import { prisma } from './prisma';

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function addUser(user: {
  id?: string;
  name?: string;
  email: string;
  password: string;
  emailVerified?: boolean;
  confirmationToken?: string;
  createdAt?: string;
}) {
  return prisma.user.create({
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      emailVerified: user.emailVerified ?? false,
    },
  });
}

export async function updateUser(email: string, update: Record<string, unknown>) {
  const { confirmationToken: _ignored, ...rest } = update;
  return prisma.user.update({
    where: { email },
    data: rest as Parameters<typeof prisma.user.update>[0]['data'],
  });
}

export async function createToken(token: {
  token: string;
  type: string;
  email: string;
  createdAt?: string;
}) {
  const user = await prisma.user.findUnique({ where: { email: token.email } });
  if (!user) throw new Error(`No user found for email: ${token.email}`);

  // Remove any existing token of the same type for this user to avoid duplicates
  await prisma.token.deleteMany({ where: { userId: user.id, type: token.type } });

  return prisma.token.create({
    data: { token: token.token, type: token.type, userId: user.id },
  });
}

export async function findToken(token: string) {
  const entry = await prisma.token.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!entry) return undefined;
  return { token: entry.token, type: entry.type, email: entry.user.email };
}

export async function removeToken(token: string) {
  await prisma.token.delete({ where: { token } }).catch(() => null);
}
