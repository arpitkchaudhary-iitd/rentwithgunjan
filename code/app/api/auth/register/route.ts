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
    const hasResend = !!process.env.RESEND_API_KEY;

    // Auto-verify when Resend is not configured (dev mode) so login isn't blocked
    await addUser({
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
      emailVerified: !hasResend,
      createdAt: new Date().toISOString(),
    });

    if (hasResend) {
      const confirmToken = crypto.randomUUID();
      const confirmUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/confirm?token=${confirmToken}`;
      await createToken({ token: confirmToken, type: 'email-confirm', email, createdAt: new Date().toISOString() });
      await sendMail({
        to: email,
        subject: 'Confirm your rentwithgunjan account',
        html: `<p>Hi ${name},</p><p>Welcome to rentwithgunjan. Please confirm your email:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p>`,
      });
      return NextResponse.json({ ok: true, message: 'Account created. Please check your email to confirm your account.' });
    }

    return NextResponse.json({ ok: true, message: 'Account created. You can now sign in.' });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to create account.' }, { status: 500 });
  }
}
