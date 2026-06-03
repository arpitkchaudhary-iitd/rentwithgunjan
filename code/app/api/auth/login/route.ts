import { NextResponse } from 'next/server';

import { authenticateUser, signSession } from '../../../../lib/auth';
import { findUserByEmail } from '../../../../lib/storage';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '');

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const rawUser = await findUserByEmail(email);
    if (!rawUser?.emailVerified) {
      return NextResponse.json(
        { error: 'Please confirm your email before logging in. Check your inbox for the confirmation link.' },
        { status: 403 },
      );
    }

    const token = signSession(user);
    const response = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Unable to log in.' }, { status: 500 });
  }
}
