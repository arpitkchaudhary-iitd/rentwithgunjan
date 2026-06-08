'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Nav from '../components/Nav';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();

    if (response.ok) {
      // Auto sign-in after registration
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (loginRes.ok) {
        router.push('/account');
      } else {
        setMessage(data.message ?? 'Account created. Please sign in.');
        setLoading(false);
      }
    } else {
      setMessage(data.error ?? 'Unable to create account.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav />
      <main className="flex min-h-[calc(100vh-65px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
            <p className="mt-2 text-slate-400">Start renting in minutes.</p>
          </div>

          <form onSubmit={submit} className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl space-y-4">
            <label className="grid gap-2 text-sm text-slate-200">Full name
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith" autoComplete="name"
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500" />
            </label>
            <label className="grid gap-2 text-sm text-slate-200">Email address
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email"
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500" />
            </label>
            <label className="grid gap-2 text-sm text-slate-200">Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters" required minLength={8} autoComplete="new-password"
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500" />
            </label>

            {message && (
              <p className="rounded-xl border border-rose-900 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">{message}</p>
            )}

            <button type="submit" disabled={loading}
              className="mt-2 w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg hover:bg-cyan-300 disabled:opacity-60 transition">
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <p className="text-center text-sm text-slate-400 pt-1">
              Already have an account? <a href="/login" className="text-cyan-400 hover:text-cyan-300 transition">Sign in</a>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
