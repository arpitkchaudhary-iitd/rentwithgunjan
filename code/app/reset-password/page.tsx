'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const submit = async () => {
    setMessage('Updating password…');
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await response.json();
    setMessage(response.ok ? data.message : data.error || 'Unable to reset password.');
  };

  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
      <label className="grid gap-2 text-sm text-slate-200">New password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
      </label>
      <button onClick={submit} className="mt-6 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 hover:bg-cyan-300">Reset password</button>
      {message ? <p className="mt-4 text-sm text-cyan-100">{message}</p> : null}
    </article>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16 lg:px-8">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Set new password</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Choose a new password for your account.</h1>
        <Suspense fallback={<p className="text-slate-400">Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </section>
    </main>
  );
}
