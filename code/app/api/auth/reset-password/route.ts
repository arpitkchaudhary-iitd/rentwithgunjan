import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import { findToken, removeToken, updateUser } from '../../../../lib/storage';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required.' }, { status: 400 });
    }

    const entry = await findToken(token);
    if (!entry || entry.type !== 'password-reset') {
      return NextResponse.json({ error: 'Invalid or expired reset token.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    await updateUser(String(entry.email), { password: hashedPassword });
    await removeToken(token);

    return NextResponse.json({ ok: true, message: 'Password updated successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to reset password.' }, { status: 500 });
  }
}
