'use client';

import { useState } from 'react';
import Nav from '../components/Nav';

const TOPICS = [
  { value: 'reservation', label: 'Reservation' },
  { value: 'payment',     label: 'Payment' },
  { value: 'general',     label: 'General inquiry' },
  { value: 'other',       label: 'Other' },
];

export default function ContactPage() {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [topic, setTopic]     = useState('reservation');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const r = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, topic, message }),
    });
    const d = await r.json();

    if (r.ok) {
      setSuccess(true);
    } else {
      setError(d.error ?? 'Unable to send. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav />

      <main className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">Get in touch</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Contact Us</h1>
          <p className="mt-3 text-slate-400">
            Questions about a reservation, payment, or anything else? Fill out the form and we'll
            get back to you within 24 hours.
          </p>
        </div>

        {success ? (
          <div className="rounded-3xl border border-emerald-800/50 bg-emerald-950/30 p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">
              ✓
            </div>
            <h2 className="text-2xl font-semibold">Message sent!</h2>
            <p className="text-slate-300">
              Thanks for reaching out. We've sent a confirmation to <strong>{email}</strong> and
              will reply within 24 hours.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <button
                onClick={() => { setSuccess(false); setName(''); setEmail(''); setMessage(''); setTopic('reservation'); }}
                className="rounded-full border border-slate-700 px-5 py-2.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white transition"
              >
                Send another message
              </button>
              <a href="/" className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 transition">
                Back to home
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-200">Your name
                <input
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith" required
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">Email address
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm text-slate-200">Topic
              <select
                value={topic} onChange={(e) => setTopic(e.target.value)} required
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
              >
                {TOPICS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm text-slate-200">Message
              <textarea
                value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question or issue in as much detail as you'd like…"
                required minLength={10} rows={5}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 resize-none"
              />
            </label>

            {error && (
              <p className="rounded-xl border border-rose-900 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
                {error}
              </p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg hover:bg-cyan-300 disabled:opacity-60 transition"
            >
              {loading ? 'Sending…' : 'Send message →'}
            </button>

            <p className="text-center text-xs text-slate-500">
              We respond within 24 hours · <a href="mailto:sales@rentwithgunjan.com" className="hover:text-slate-300 transition">sales@rentwithgunjan.com</a>
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
