import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    // connect to mongo db using raw query to drop the index
    await prisma.$runCommandRaw({
      dropIndexes: "users",
      index: "users_googleId_key"
    });
    console.log("Success: dropped index users_googleId_key");
  } catch (error) {
    console.error("Failed to drop index:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
