import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'bson';

const prisma = new PrismaClient();

async function run() {
  try {
    const email = `test-${Date.now()}@example.com`;
    const passwordHash = await bcrypt.hash('password123', 12);
    const dateNow = new Date().getTime().toString();
    
    let savedAddresses = [];
    savedAddresses.push({
      id: new ObjectId().toHexString(),
      label: 'Home',
      fullName: 'Test Tester',
      phone: '1234567890',
      addressLine1: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      country: 'India',
      isDefault: true
    });

    const user = await prisma.user.create({
      data: {
        name: 'Test Tester',
        email,
        phone: '1234567890',
        passwordHash,
        role: 'USER',
        authProvider: 'local',
        savedAddresses
      }
    });
    console.log("Success:", user.email);
  } catch (error) {
    console.error("Failed to create user:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
