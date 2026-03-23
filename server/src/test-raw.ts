import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    const res = await prisma.user.findRaw({ filter: { email: { $exists: true } } });
    console.log("findRaw works:", !!res);
    await prisma.$runCommandRaw({
      update: "users",
      updates: [
        {
          q: { email: "testtest@test.com" },
          u: { $set: { tempTestField: "hello" } }
        }
      ]
    });
    console.log("update via runCommandRaw works");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
