import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function seedAdminFeatures() {
  console.log('🌱 Seeding admin features...\n');

  try {
    // Create sample blog posts
    const blog1 = await prisma.blog.upsert({
      where: { slug: 'welcome-to-blackpiston' },
      update: {},
      create: {
        title: 'Welcome to BlackPiston Garage',
        slug: 'welcome-to-blackpiston',
        content: `# Welcome to BlackPiston Garage

Your premier destination for motorcycle gear and accessories. We offer:

- Premium riding gear
- Custom builds
- Professional service
- Expert advice

Visit us today and experience the difference!`,
        category: 'Announcements',
        tags: ['welcome', 'announcement', 'news'],
        isPublished: true,
      },
    });
    console.log('✅ Blog post created:', blog1.title);

    const blog2 = await prisma.blog.upsert({
      where: { slug: 'top-5-helmets-2026' },
      update: {},
      create: {
        title: 'Top 5 Helmets for 2026',
        slug: 'top-5-helmets-2026',
        content: `# Top 5 Helmets for 2026

Here are our top picks for the best motorcycle helmets this year:

1. **AXOR Apex** - Best overall protection
2. **Steelbird SBA-1** - Best value for money
3. **MT Helmets Thunder** - Best for touring
4. **AGV K6** - Best for racing
5. **Shoei RF-1400** - Best premium option

Each helmet offers unique features and benefits. Visit our store to try them on!`,
        category: 'Reviews',
        tags: ['helmets', 'reviews', 'gear'],
        isPublished: true,
      },
    });
    console.log('✅ Blog post created:', blog2.title);

    // Create sample services
    const service1 = await prisma.service.upsert({
      where: { slug: 'oil-change' },
      update: {},
      create: {
        name: 'Oil Change',
        slug: 'oil-change',
        description: 'Complete oil change service for your motorcycle. Includes oil filter replacement and inspection.',
        price: 1500,
        duration: '1 hour',
        category: 'Maintenance',
        isActive: true,
      },
    });
    console.log('✅ Service created:', service1.name);

    const service2 = await prisma.service.upsert({
      where: { slug: 'brake-service' },
      update: {},
      create: {
        name: 'Brake Service',
        slug: 'brake-service',
        description: 'Complete brake inspection and service. Includes pad replacement if needed.',
        price: 2500,
        duration: '2 hours',
        category: 'Maintenance',
        isActive: true,
      },
    });
    console.log('✅ Service created:', service2.name);

    const service3 = await prisma.service.upsert({
      where: { slug: 'custom-paint' },
      update: {},
      create: {
        name: 'Custom Paint Job',
        slug: 'custom-paint',
        description: 'Professional custom paint service. Choose from our designs or bring your own.',
        price: 25000,
        duration: '1 week',
        category: 'Customization',
        isActive: true,
      },
    });
    console.log('✅ Service created:', service3.name);

    // Create sample builds
    const build1 = await prisma.build.upsert({
      where: { slug: 'custom-r1-track' },
      update: {},
      create: {
        name: 'Custom Yamaha R1 - Track Edition',
        slug: 'custom-r1-track',
        description: 'Track-ready custom build with performance upgrades. Features include engine tuning, exhaust system, suspension upgrade, and custom paint.',
        components: [
          'Engine ECU remap',
          'Akrapovic full exhaust system',
          'Ohlins suspension (front & rear)',
          'Carbon fiber bodywork',
          'Custom paint job',
          'Racing slicks',
        ],
        price: 350000,
        images: [],
        isFeatured: true,
        isActive: true,
      },
    });
    console.log('✅ Build created:', build1.name);

    const build2 = await prisma.build.upsert({
      where: { slug: 'cafe-racer-classic' },
      update: {},
      create: {
        name: 'Cafe Racer Classic',
        slug: 'cafe-racer-classic',
        description: 'Vintage-inspired cafe racer build. Perfect blend of classic style and modern performance.',
        components: [
          'Custom seat and tank',
          'Clip-on handlebars',
          'Upgraded brakes',
          'LED lighting',
          'Custom exhaust',
          'Retro paint scheme',
        ],
        price: 180000,
        images: [],
        isFeatured: false,
        isActive: true,
      },
    });
    console.log('✅ Build created:', build2.name);

    console.log('\n✅ Admin features seeded successfully!');
    console.log('\nYou can now:');
    console.log('- View blog posts at /admin/blog');
    console.log('- Manage services at /admin/services');
    console.log('- View builds at /admin/builds');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdminFeatures().catch((error) => {
  console.error(error);
  process.exit(1);
});
