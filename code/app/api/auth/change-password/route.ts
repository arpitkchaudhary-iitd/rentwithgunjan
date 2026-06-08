import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import { getSessionFromRequest } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required.' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user?.password) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 403 });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: session.id }, data: { password: hashed } });

    return NextResponse.json({ ok: true, message: 'Password updated successfully.' });
  } catch {
    return NextResponse.json({ error: 'Unable to update password.' }, { status: 500 });
  }
}
