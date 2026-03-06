import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/database.js';

const router = Router();

// JWT signing helper — cast expiresIn to satisfy newer @types/jsonwebtoken
const jwtSignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any };

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register new user
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                passwordHash,
                role: 'USER',
                authProvider: 'local'
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
            process.env.JWT_SECRET || 'default-secret',
            jwtSignOptions
        );

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
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
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
            process.env.JWT_SECRET || 'default-secret',
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

// Google OAuth login
router.post('/google', async (req: Request, res: Response) => {
    try {
        const { access_token, credential } = req.body;

        let googleId: string | undefined;
        let email: string | undefined;
        let name: string | undefined;
        let picture: string | undefined;
        let email_verified: boolean = false;

        if (access_token) {
            // Flow 1: Access token from useGoogleLogin popup
            // Fetch user info from Google's userinfo API
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
            // Update existing user with Google info if not already set
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId: user.googleId || googleId,
                    avatar: user.avatar || picture,
                    isEmailVerified: email_verified || user.isEmailVerified,
                    lastLogin: new Date()
                }
            });
            console.log('✅ Google OAuth: Existing user signed in:', email);
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
            console.log('✅ Google OAuth: New user created:', email);
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'default-secret',
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
        const { email, password } = req.body;

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
            process.env.JWT_SECRET || 'default-secret',
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: string };

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

