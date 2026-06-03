import { NextResponse } from 'next/server';

import { getSessionFromRequest } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';

async function requireAdmin(request: Request) {
  const user = getSessionFromRequest(request);
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  return dbUser?.role === 'admin' ? user : null;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { status } = await request.json();
  const valid = ['PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED'];
  if (!valid.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  const booking = await prisma.booking.update({
    where: { id: params.id },
    data: { status },
    include: { user: { select: { name: true, email: true } }, vehicle: true },
  });
  return NextResponse.json({ ok: true, booking });
}
