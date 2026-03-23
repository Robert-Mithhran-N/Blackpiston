import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const data = {
  "Helmets": ["Full Face", "Modular", "Open Face", "Off-Road"],
  "Riding Jackets": ["Touring", "Racing", "Mesh", "Leather"],
  "Gloves": ["Full Gauntlet", "Short Cuff", "Waterproof"],
  "Riding Boots": ["Touring Boots", "Racing Boots", "Riding Shoes"],
  "Accessories": ["Action Cameras", "Intercoms", "Phone Mounts"],
  "Riding Pants": ["Mesh Pants", "Textile Pants", "Riding Jeans"],
  "Rain Gear": ["Rain Suits", "Rain Jackets", "Boot Covers"],
  "Luggage & Bags": ["Tank Bags", "Saddlebags", "Tail Bags"],
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function seedTree() {
  console.log('🌱 Seeding ProductType -> Category hierarchy...\n');

  for (const [parentName, childrenNames] of Object.entries(data)) {
    // 1. Ensure parent exists
    let parent = await prisma.productCategory.findUnique({
      where: { slug: slugify(parentName) }
    });
    
    if (!parent) {
      parent = await prisma.productCategory.create({
        data: {
          name: parentName,
          slug: slugify(parentName),
          isActive: true,
        }
      });
      console.log(`  ➕ Created top-level: ${parentName}`);
    } else {
      console.log(`  ☑️ Found top-level: ${parentName}`);
    }

    // 2. Create children
    for (const childName of childrenNames) {
      const childSlug = slugify(childName);
      const existingChild = await prisma.productCategory.findFirst({
        where: { slug: childSlug, parentId: parent.id }
      });
      
      if (!existingChild) {
        await prisma.productCategory.create({
          data: {
            name: childName,
            slug: childSlug,
            parentId: parent.id,
            isActive: true,
          }
        });
        console.log(`     ↳ Created sub-category: ${childName}`);
      } else {
        console.log(`     ↳ Found sub-category: ${childName}`);
      }
    }
  }

  console.log('\n🎉 Hierarchy seeding complete!');
  await prisma.$disconnect();
}

seedTree().catch((err) => {
  console.error('❌ Seed failed:', err);
  prisma.$disconnect();
  process.exit(1);
});
