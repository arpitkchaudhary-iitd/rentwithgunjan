import { NextResponse } from 'next/server';

import { findToken, removeToken, updateUser } from '../../../../lib/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Missing token.' }, { status: 400 });
    }

    const entry = await findToken(token);
    if (!entry || entry.type !== 'email-confirm') {
      return NextResponse.json({ error: 'Invalid or expired confirmation link.' }, { status: 400 });
    }

    await updateUser(String(entry.email), { emailVerified: true, confirmationToken: null });
    await removeToken(token);

    return NextResponse.json({ ok: true, message: 'Email confirmed successfully. You can now sign in.' });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to confirm email.' }, { status: 500 });
  }
}
