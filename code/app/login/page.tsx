'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Nav from '../components/Nav';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      router.push('/account');
    } else {
      setMessage(data.error ?? 'Unable to sign in. Check your email and password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav />
      <main className="flex min-h-[calc(100vh-65px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-slate-400">Sign in to manage your bookings.</p>
          </div>

          <form onSubmit={submit} className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl space-y-4">
            <label className="grid gap-2 text-sm text-slate-200">Email address
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email"
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500" />
            </label>
            <label className="grid gap-2 text-sm text-slate-200">Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete="current-password"
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500" />
            </label>

            {message && (
              <p className="rounded-xl border border-rose-900 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">{message}</p>
            )}

            <button type="submit" disabled={loading}
              className="mt-2 w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg hover:bg-cyan-300 disabled:opacity-60 transition">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <div className="flex justify-between text-sm text-slate-400 pt-1">
              <a href="/signup" className="text-cyan-400 hover:text-cyan-300 transition">Create account</a>
              <a href="/forgot-password" className="hover:text-slate-200 transition">Forgot password?</a>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
