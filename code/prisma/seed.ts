import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed vehicles
  // dailyRate and deposit stored in cents (e.g. 14000 = $140.00)
  const vehicles = [
    { name: 'CyberTruck1', type: 'Electric Pickup', dailyRate: 14000, deposit: 50000, imageUrl: '/cars/CyberTruck1/cover.svg' },
    { name: 'CyberTruck2', type: 'Electric Pickup', dailyRate: 14500, deposit: 55000, imageUrl: '/cars/CyberTruck2/cover.svg' },
    { name: 'Model X1', type: 'Luxury SUV', dailyRate: 16000, deposit: 60000, imageUrl: '/cars/Model X1/cover.svg' },
  ];

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { id: `seed-${v.name.toLowerCase().replace(/\s/g, '-')}` },
      update: v,
      create: { id: `seed-${v.name.toLowerCase().replace(/\s/g, '-')}`, ...v },
    });
  }

  // Seed admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@rentwithgunjan.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'change-me-before-launch';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'admin' },
    create: {
      email: adminEmail,
      name: 'Admin',
      password: hashedPassword,
      emailVerified: true,
      role: 'admin',
    },
  });

  console.log('Seed complete — vehicles and admin user created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
