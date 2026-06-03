'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-16 lg:px-8">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">User login</p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">A first-pass login screen for the upcoming authentication flow.</h1>
        <p className="max-w-2xl text-slate-300">This page is ready to connect to real sign-in providers next. The user profile and booking data will be stored in the Prisma schema we already added.</p>

        <article className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <label className="grid gap-2 text-sm text-slate-200">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </label>
          <label className="mt-4 grid gap-2 text-sm text-slate-200">
            Password
            <input
              type="password"
              placeholder="••••••••"
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </label>
          <a
            href="/account"
            className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 hover:bg-cyan-300"
          >
            Continue to account & uploads
          </a>
          <p className="mt-4 text-xs text-slate-400">Next step: connect this form to a real auth provider and store the user record in the Prisma User model.</p>
        </article>
      </section>
    </main>
  );
}
