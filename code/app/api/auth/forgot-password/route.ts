import { NextResponse } from 'next/server';

import { createToken, findUserByEmail } from '../../../../lib/storage';
import { sendMail } from '../../../../lib/mail';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });

    const user = await findUserByEmail(normalizedEmail);
    if (!user) return NextResponse.json({ ok: true, message: 'If an account exists, a reset email was sent.' });

    const token = crypto.randomUUID();
    await createToken({ token, type: 'password-reset', email: normalizedEmail, createdAt: new Date().toISOString() });

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    await sendMail({
      to: normalizedEmail,
      subject: 'Reset your rentwithgunjan password',
      html: `<p>Hi ${user.name || normalizedEmail},</p><p>Use this link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    return NextResponse.json({ ok: true, message: 'If an account exists, a reset email was sent.' });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to send reset link.' }, { status: 500 });
  }
}
