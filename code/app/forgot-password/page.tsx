'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submit = async () => {
    setMessage('Sending reset instructions…');
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    setMessage(response.ok ? data.message : data.error || 'Unable to send reset email.');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16 lg:px-8">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Reset password</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Recover access to your account.</h1>
        <p className="text-slate-300">Enter the email address on your account and we’ll send a reset link.</p>
        <article className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <label className="grid gap-2 text-sm text-slate-200">Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
          </label>
          <button onClick={submit} className="mt-6 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 hover:bg-cyan-300">Send reset link</button>
          {message ? <p className="mt-4 text-sm text-cyan-100">{message}</p> : null}
        </article>
      </section>
    </main>
  );
}
