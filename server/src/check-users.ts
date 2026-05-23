import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
    console.log("Checking DB users...");
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
        }
    });
    console.log("Total users found:", users.length);
    console.log(JSON.stringify(users, null, 2));

    const settings = await prisma.settings.findMany();
    console.log("Settings found:", settings.length);

    const orders = await prisma.order.findMany({ take: 5 });
    console.log("Orders found:", orders.length);

    const products = await prisma.product.findMany({ take: 5 });
    console.log("Products found:", products.length);

    await prisma.$disconnect();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
