import { Resend } from 'resend';

type MailOptions = {
  to: string;
  subject: string;
  html: string;
};

export async function sendMail({ to, subject, html }: MailOptions) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[mail] RESEND_API_KEY not set. Preview email for ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(html);
    return;
  }

  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM || 'rentwithgunjan <onboarding@resend.dev>';

  await resend.emails.send({ from, to, subject, html });
}
