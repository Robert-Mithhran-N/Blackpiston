import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Helmets',
    slug: 'helmets',
    description: 'Premium motorcycle helmets for maximum protection and style',
    icon: 'hard-hat',
    sortOrder: 1,
    isActive: true,
  },
  {
    name: 'Riding Jackets',
    slug: 'jackets',
    description: 'Armored riding jackets for all seasons and conditions',
    icon: 'shirt',
    sortOrder: 2,
    isActive: true,
  },
  {
    name: 'Gloves',
    slug: 'gloves',
    description: 'Riding gloves for grip, comfort, and hand protection',
    icon: 'hand',
    sortOrder: 3,
    isActive: true,
  },
  {
    name: 'Riding Boots',
    slug: 'boots',
    description: 'Motorcycle boots with ankle protection and anti-slip soles',
    icon: 'footprints',
    sortOrder: 4,
    isActive: true,
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Motorcycle accessories, gadgets, and add-ons',
    icon: 'sparkles',
    sortOrder: 5,
    isActive: true,
  },
  {
    name: 'Riding Pants',
    slug: 'pants',
    description: 'Armored riding pants and jeans for lower-body protection',
    icon: 'layers',
    sortOrder: 6,
    isActive: true,
  },
  {
    name: 'Rain Gear',
    slug: 'rain-gear',
    description: 'Waterproof riding suits, covers, and rain protection',
    icon: 'cloud-rain',
    sortOrder: 7,
    isActive: true,
  },
  {
    name: 'Luggage & Bags',
    slug: 'luggage',
    description: 'Saddlebags, tank bags, tail bags, and touring luggage',
    icon: 'briefcase',
    sortOrder: 8,
    isActive: true,
  },
];

async function seed() {
  console.log('🌱 Seeding product categories...\n');

  for (const cat of categories) {
    const existing = await prisma.productCategory.findUnique({
      where: { slug: cat.slug },
    });

    if (existing) {
      console.log(`  ⏭️  "${cat.name}" already exists — skipping`);
    } else {
      await prisma.productCategory.create({ data: cat });
      console.log(`  ✅ Created: ${cat.name}`);
    }
  }

  console.log('\n🎉 Category seeding complete!');
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  prisma.$disconnect();
  process.exit(1);
});
