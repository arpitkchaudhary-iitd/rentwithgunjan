const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.user.findUnique({
  where: { email: 'gunjangoel@rentwithgunjan.com' },
  include: { tokens: true },
}).then((u) => {
  if (!u) { console.log('User not found'); return; }
  console.log('emailVerified:', u.emailVerified);
  if (u.tokens.length === 0) {
    console.log('No tokens found');
  } else {
    u.tokens.forEach((t) => console.log('type:', t.type, '| token:', t.token));
  }
}).finally(() => prisma.$disconnect());
