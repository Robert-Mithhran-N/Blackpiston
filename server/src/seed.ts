import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...\n');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@blackpiston.com' },
        update: {},
        create: {
            name: 'Admin User',
            email: 'admin@blackpiston.com',
            passwordHash: adminPassword,
            role: 'ADMIN',
            phone: '+91 9876543210',
            isActive: true,
            isEmailVerified: true
        }
    });
    console.log('✅ Admin user created:', admin.email);

    // Create categories
    // Categories are now managed via tags

    // Create sample products
    const products = [
        {
            name: 'Steelbird SBA-7 Road Helmet',
            slug: 'steelbird-sba-7-road-helmet',
            shortDescription: 'Full face helmet with dual visor and aerodynamic design',
            brand: 'Steelbird',
            price: 3499,
            offerPrice: 2999,
            sku: 'HLM-SB-001',
            stockQuantity: 50,
            rating: 4.5,
            totalReviews: 128,
            tags: ['helmet', 'full face', 'steelbird', 'dual visor'],
            tagStrings: ['helmet', 'full face', 'steelbird', 'dual visor'],
            isFeatured: true,
            isActive: true,
            inStock: true,
            images: [
                { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', alt: 'Helmet Front', isPrimary: true },
                { url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800', alt: 'Helmet Side', isPrimary: false }
            ],
            specifications: [
                { label: 'Type', value: 'Full Face' },
                { label: 'Material', value: 'ABS Shell' },
                { label: 'Certification', value: 'ISI, DOT' },
                { label: 'Weight', value: '1.5 kg' }
            ]
        },
        {
            name: 'Royal Enfield Riding Jacket',
            slug: 'royal-enfield-riding-jacket',
            shortDescription: 'Premium leather jacket with CE approved armor',
            brand: 'Royal Enfield',
            price: 12999,
            offerPrice: 10999,
            sku: 'JKT-RE-001',
            stockQuantity: 30,
            rating: 4.7,
            totalReviews: 89,
            tags: ['jacket', 'leather', 'royal enfield', 'armor'],
            tagStrings: ['jacket', 'leather', 'royal enfield', 'armor'],
            isFeatured: true,
            isActive: true,
            inStock: true,
            images: [
                { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', alt: 'Jacket Front', isPrimary: true }
            ],
            specifications: [
                { label: 'Material', value: 'Genuine Leather' },
                { label: 'Armor', value: 'CE Level 2' },
                { label: 'Waterproof', value: 'Yes' }
            ]
        },
        {
            name: 'Adventure Pro Racing Boots',
            slug: 'adventure-pro-racing-boots',
            shortDescription: 'High-performance racing boots with advanced protection',
            brand: 'Adventure Pro',
            price: 8999,
            offerPrice: 7499,
            sku: 'BOT-AP-001',
            stockQuantity: 25,
            rating: 4.6,
            totalReviews: 56,
            tags: ['boots', 'racing', 'protection'],
            tagStrings: ['boots', 'racing', 'protection'],
            isFeatured: true,
            isActive: true,
            inStock: true,
            images: [
                { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', alt: 'Boots Front', isPrimary: true }
            ],
            specifications: [
                { label: 'Material', value: 'Full Grain Leather' },
                { label: 'Sole', value: 'Anti-slip Rubber' },
                { label: 'Protection', value: 'Ankle & Toe' }
            ]
        }
    ];

    for (const prod of products) {
        const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
        if (!existing) {
            await prisma.product.create({ data: prod as any });
        }
    }
    console.log('✅ Sample products created');

    // Create settings
    await prisma.settings.upsert({
        where: { key: 'GENERAL' },
        update: {},
        create: {
            key: 'GENERAL',
            siteName: 'BlackPiston Garage',
            siteTagline: 'Premium Motorcycle Gear & Accessories',
            contactEmail: 'contact@blackpiston.com',
            supportEmail: 'support@blackpiston.com',
            contactPhone: '+91 98765 43210',
            whatsappNumber: '+91 98765 43210',
            address: {
                street: '123 Bike Street',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                country: 'India'
            },
            socialLinks: {
                facebook: 'https://facebook.com/blackpistongarage',
                instagram: 'https://instagram.com/blackpistongarage',
                twitter: 'https://twitter.com/blackpistongarage',
                youtube: 'https://youtube.com/blackpistongarage'
            },
            shippingSettings: {
                freeShippingMinimum: 5000,
                defaultShippingCost: 99,
                expressShippingCost: 199,
                deliveryTimeStandard: '5-7 business days',
                deliveryTimeExpress: '2-3 business days'
            },
            maintenanceMode: false,
            allowRegistration: true
        }
    });
    console.log('✅ Settings configured');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Admin Login Credentials:');
    console.log('   Email: admin@blackpiston.com');
    console.log('   Password: admin123\n');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
