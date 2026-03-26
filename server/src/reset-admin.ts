import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function resetAdmin() {
    const email = 'blackpistongarages@gmail.com';
    const password = 'Robert@2005';
    const passwordHash = await bcrypt.hash(password, 12);

    // Check if admin exists
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        // Update to ADMIN role + reset password
        await prisma.user.update({
            where: { email },
            data: { 
                role: 'ADMIN', 
                passwordHash,
                isActive: true 
            }
        });
        console.log(`✅ Admin user updated: ${email} (role set to ADMIN, password reset)`);
    } else {
        // Create admin user
        await prisma.user.create({
            data: {
                name: 'BlackPiston Admin',
                email,
                passwordHash,
                role: 'ADMIN',
                authProvider: 'local',
                googleId: `admin_${Date.now()}`,
                isActive: true,
                isEmailVerified: true
            }
        });
        console.log(`✅ Admin user created: ${email}`);
    }

    await prisma.$disconnect();
}

resetAdmin().catch(err => {
    console.error('Failed:', err);
    process.exit(1);
});
