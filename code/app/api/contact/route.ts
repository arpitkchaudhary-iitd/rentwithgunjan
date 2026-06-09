import { NextResponse } from 'next/server';

import { sendMail } from '../../../lib/mail';

const SALES_EMAIL = 'sales@rentwithgunjan.com';

const SUBJECTS: Record<string, string> = {
  reservation: 'Reservation Inquiry',
  payment: 'Payment Question',
  general: 'General Inquiry',
  other: 'Other',
};

export async function POST(request: Request) {
  try {
    const { name, email, topic, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !topic || !message?.trim()) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (message.trim().length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters.' }, { status: 400 });
    }

    const topicLabel = SUBJECTS[topic] ?? topic;

    // Email to sales team
    await sendMail({
      to: SALES_EMAIL,
      subject: `[Contact] ${topicLabel} — ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#0f172a">New contact form submission</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Name</td>
                <td style="padding:8px 0;font-size:14px"><strong>${name}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Email</td>
                <td style="padding:8px 0;font-size:14px"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Topic</td>
                <td style="padding:8px 0;font-size:14px">${topicLabel}</td></tr>
          </table>
          <hr style="margin:16px 0;border:none;border-top:1px solid #e2e8f0"/>
          <p style="font-size:14px;color:#1e293b;white-space:pre-wrap">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          <hr style="margin:16px 0;border:none;border-top:1px solid #e2e8f0"/>
          <p style="font-size:12px;color:#94a3b8">Reply directly to this email to respond to ${name}.</p>
        </div>
      `,
    });

    // Auto-reply to sender
    await sendMail({
      to: email,
      subject: `We received your message — Rent With Gunjan`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#0f172a">Thanks for reaching out, ${name}!</h2>
          <p style="font-size:14px;color:#334155">
            We've received your message about <strong>${topicLabel}</strong> and will get back to you
            within 24 hours.
          </p>
          <p style="font-size:14px;color:#334155">
            In the meantime, you can browse our available cars at
            <a href="https://rentwithgunjan.com/booking">rentwithgunjan.com/booking</a>.
          </p>
          <p style="font-size:14px;color:#334155">— The Rent With Gunjan team</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to send message. Please try again.' }, { status: 500 });
  }
}
