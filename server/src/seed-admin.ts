import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
    const hash = await bcrypt.hash('admin@2510', 12);

    const user = await prisma.user.upsert({
        where: { email: 'blackpistongarages@gmail.com' },
        update: {
            passwordHash: hash,
            role: 'ADMIN',
            name: 'BlackPiston Admin',
        },
        create: {
            name: 'BlackPiston Admin',
            email: 'blackpistongarages@gmail.com',
            passwordHash: hash,
            role: 'ADMIN',
            authProvider: 'local',
            isActive: true,
            isEmailVerified: true,
        },
    });

    console.log('✅ Admin user created/updated:', user.email, '| Role:', user.role);
    await prisma.$disconnect();
}

main().catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
});
