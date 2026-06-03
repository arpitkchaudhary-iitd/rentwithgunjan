const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.booking.updateMany({
  where: { status: 'PENDING' },
  data: { status: 'CANCELED' },
}).then((r) => console.log(`Cancelled ${r.count} stale PENDING bookings`))
  .finally(() => prisma.$disconnect());
