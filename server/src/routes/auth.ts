import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/database.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/emailService.js';
import crypto from 'crypto';
import { ObjectId } from 'bson';
import { z } from 'zod';
import { JWT_SIGN_OPTIONS, JWT_VERIFY_OPTIONS } from '../middlewares/security.js';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    address: z.object({
        line1: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional()
    }).optional()
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

const googleOAuthSchema = z.object({
    access_token: z.string().optional(),
    credential: z.string().optional(),
}).refine(data => data.access_token || data.credential, {
    message: 'Either access_token or credential is required',
});

const adminLoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const router = Router();

// JWT signing options — hardened with algorithm, issuer, audience
const jwtSignOptions = JWT_SIGN_OPTIONS as jwt.SignOptions;

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register new user
router.post('/register', async (req: Request, res: Response) => {
    try {
        const validation = registerSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.format()
            });
        }
        const { name, email, password, phone, address } = validation.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        const savedAddresses: any[] = [];
        if (address && address.line1) {
            savedAddresses.push({
                id: new ObjectId().toHexString(),
                label: 'Home',
                fullName: name || '',
                phone: phone || '',
                addressLine1: address.line1,
                addressLine2: '',
                city: address.city || '',
                state: address.state || '',
                pincode: address.pincode || '',
                country: 'India',
                isDefault: true
            });
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                passwordHash,
                role: 'USER',
                authProvider: 'local',
                googleId: `local_${new ObjectId().toHexString()}`,
                savedAddresses
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true
            }
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET!,
            jwtSignOptions
        );

        // ── Send Welcome Email ──
        sendWelcomeEmail(user.email, user.name).catch(err => console.error("Welcome Email failed", err));

        res.status(201).json({
            message: 'User registered successfully',
            user,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const validation = loginSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.format()
            });
        }
        const { email, password } = validation.data;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            // Signal frontend to route to onboarding flow
            return res.json({
                isNewUser: true,
                email
            });
        }

        // If user signed up via Google and has no password, reject
        if (!user.passwordHash) {
            return res.status(401).json({
                error: 'This account uses Google sign-in. Please use "Sign in with Google" instead.'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET!,
            jwtSignOptions
        );

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Forgot Password
router.post('/forgot-password', async (req: Request, res: Response) => {
    try {
        const validation = forgotPasswordSchema.safeParse(req.body);
        if (!validation.success) {
            // Always return success for security (don't reveal validation)
            return res.status(200).json({ message: 'If the email exists, a reset link has been sent' });
        }
        const { email } = validation.data;
        
        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Always return success for security
        res.status(200).json({ message: 'If the email exists, a reset link has been sent' });

        if (!user || user.authProvider === 'google') {
            return;
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        // Use raw query to bypass active schema lock
        await prisma.$runCommandRaw({
            update: "users",
            updates: [
                {
                    q: { _id: { $oid: user.id } },
                    u: { $set: { resetToken, resetTokenExpiry: { $date: resetTokenExpiry.toISOString() } } }
                }
            ]
        });

        // Send email silently
        sendPasswordResetEmail(user.email, resetToken).catch(err => console.error("Forgot Password Email failed", err));
    } catch (error) {
        console.error('Forgot password error:', error);
    }
});

// Reset Password
router.post('/reset-password', async (req: Request, res: Response) => {
    try {
        const validation = resetPasswordSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.format()
            });
        }
        const { token, newPassword } = validation.data;

        // Use raw find to bypass active schema lock
        const cursor = await prisma.$runCommandRaw({
            find: "users",
            filter: {
                resetToken: token,
                resetTokenExpiry: { $gt: { $date: new Date().toISOString() } }
            },
            limit: 1
        }) as any;

        const userBatch = cursor?.cursor?.firstBatch;
        
        if (!userBatch || userBatch.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        const user = userBatch[0];
        const userId = user._id.$oid;

        const passwordHash = await bcrypt.hash(newPassword, 12);

        // Update password and unset reset tokens
        await prisma.$runCommandRaw({
            update: "users",
            updates: [
                {
                    q: { _id: { $oid: userId } },
                    u: { 
                        $set: { passwordHash },
                        $unset: { resetToken: "", resetTokenExpiry: "" }
                    }
                }
            ]
        });

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Google OAuth login
router.post('/google', async (req: Request, res: Response) => {
    try {
        const validation = googleOAuthSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.format()
            });
        }
        const { access_token, credential } = validation.data;

        let googleId: string | undefined;
        let email: string | undefined;
        let name: string | undefined;
        let picture: string | undefined;
        let email_verified: boolean = false;

        if (access_token) {
            // Flow 1: Access token from useGoogleLogin popup
            const userInfoResponse = await fetch(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                {
                    headers: { Authorization: `Bearer ${access_token}` }
                }
            );

            if (!userInfoResponse.ok) {
                return res.status(401).json({ error: 'Invalid Google access token' });
            }

            const userInfo = await userInfoResponse.json();
            googleId = userInfo.sub;
            email = userInfo.email;
            name = userInfo.name;
            picture = userInfo.picture;
            email_verified = userInfo.email_verified || false;

        } else if (credential) {
            // Flow 2: ID token from GoogleLogin component (fallback)
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                return res.status(401).json({ error: 'Invalid Google token' });
            }

            googleId = payload.sub;
            email = payload.email;
            name = payload.name;
            picture = payload.picture;
            email_verified = payload.email_verified || false;

        } else {
            return res.status(400).json({ error: 'Google access_token or credential is required' });
        }

        if (!email) {
            return res.status(401).json({ error: 'Could not retrieve email from Google' });
        }

        // Find existing user by email or googleId
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    ...(googleId ? [{ googleId }] : [])
                ]
            }
        });

        if (user) {
            const isDummyGoogleId = user.googleId?.startsWith('local_');
            
            // Update existing user with Google info if not already set
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId: isDummyGoogleId ? googleId : (user.googleId || googleId),
                    avatar: user.avatar || picture,
                    isEmailVerified: email_verified || user.isEmailVerified,
                    lastLogin: new Date()
                }
            });
        } else {
            // Create new user from Google profile
            user = await prisma.user.create({
                data: {
                    name: name || email.split('@')[0],
                    email,
                    googleId,
                    authProvider: 'google',
                    avatar: picture,
                    role: 'USER',
                    isActive: true,
                    isEmailVerified: email_verified
                }
            });
            
            // ── Send Welcome Email for New Google Signups ──
            sendWelcomeEmail(user.email, user.name).catch(err => console.error("Google Welcome Email failed", err));
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET!,
            jwtSignOptions
        );

        res.json({
            message: 'Google login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            },
            token
        });
    } catch (error) {
        console.error('Google OAuth error:', error);
        res.status(401).json({ error: 'Google authentication failed' });
    }
});

// Admin login
router.post('/admin/login', async (req: Request, res: Response) => {
    try {
        const validation = adminLoginSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.format()
            });
        }
        const { email, password } = validation.data;

        // Find admin user
        const user = await prisma.user.findFirst({
            where: {
                email,
                role: { in: ['ADMIN', 'STAFF'] }
            }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        if (!user.passwordHash) {
            return res.status(401).json({ error: 'Admin accounts require a password' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET!,
            jwtSignOptions
        );

        res.json({
            message: 'Admin login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            },
            token
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get current user profile
router.get('/me', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!, JWT_VERIFY_OPTIONS) as { userId: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                avatar: true,
                address: true,
                savedAddresses: true,
                isActive: true,
                authProvider: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

export default router;

