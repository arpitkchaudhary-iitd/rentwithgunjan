import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import { createToken, findUserByEmail, addUser } from '../../../../lib/storage';
import { sendMail } from '../../../../lib/mail';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '');
    const name = String(payload.name || email).trim();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'An account already exists for this email.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const confirmToken = crypto.randomUUID();

    await addUser({
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
      confirmationToken: confirmToken,
      createdAt: new Date().toISOString(),
    });

    const confirmUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/auth/confirm?token=${confirmToken}`;
    await sendMail({
      to: email,
      subject: 'Confirm your rentwithgunjan account',
      html: `<p>Hi ${name},</p><p>Welcome to rentwithgunjan. Please confirm your email here:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p>`,
    });

    await createToken({ token: confirmToken, type: 'email-confirm', email, createdAt: new Date().toISOString() });

    return NextResponse.json({ ok: true, message: 'Account created. Please check your email to confirm your account.' });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to create account.' }, { status: 500 });
  }
}
