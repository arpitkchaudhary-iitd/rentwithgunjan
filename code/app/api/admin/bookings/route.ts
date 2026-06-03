import { NextResponse } from 'next/server';

import { getSessionFromRequest } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

async function requireAdmin(request: Request) {
  const user = getSessionFromRequest(request);
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  return dbUser?.role === 'admin' ? user : null;
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const bookings = await prisma.booking.findMany({
    include: { user: { select: { id: true, name: true, email: true } }, vehicle: true, payment: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ bookings });
}
