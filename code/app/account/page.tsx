'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Nav from '../components/Nav';
import { CANCELLATION_POLICY, getRefundTier } from '../../lib/cancellation.config';

type Profile = {
  id: string; email: string; name: string | null; phone: string | null; dateOfBirth: string | null;
};

type Booking = {
  id: string;
  pickupDate: string;
  returnDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED';
  subtotal: number; tax: number; deposit: number; total: number;
  createdAt: string;
  vehicle: { name: string; type: string };
  payment: { stripeSessionId: string | null } | null;
};

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-amber-500/10 text-amber-300 border-amber-500/20',
  CONFIRMED: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  CANCELED:  'bg-rose-500/10 text-rose-300 border-rose-500/20',
  COMPLETED: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
};

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

type Tab = 'profile' | 'security' | 'bookings';

function AccountContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) ?? 'profile';
  const [tab, setTab] = useState<Tab>(
    ['profile', 'security', 'bookings'].includes(initialTab) ? initialTab : 'profile',
  );

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Security state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [securityMsg, setSecurityMsg] = useState('');
  const [securitySaving, setSecuritySaving] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Cancellation state
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelPending, setCancelPending] = useState(false);
  const [cancelMsg, setCancelMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) {
          setProfile(d.user);
          setName(d.user.name ?? '');
          setPhone(d.user.phone ?? '');
          setDob(d.user.dateOfBirth ?? '');
        }
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (tab !== 'bookings') return;
    setBookingsLoading(true);
    fetch('/api/bookings')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setBookings(d?.bookings ?? []))
      .catch(() => null)
      .finally(() => setBookingsLoading(false));
  }, [tab]);

  const saveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg('');
    const r = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, dateOfBirth: dob || null }),
    });
    const d = await r.json();
    setProfileMsg(r.ok ? 'Profile saved.' : d.error ?? 'Unable to save.');
    setProfileSaving(false);
  };

  const changePassword = async () => {
    if (newPw !== confirmPw) { setSecurityMsg('New passwords do not match.'); return; }
    setSecuritySaving(true);
    setSecurityMsg('');
    const r = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    const d = await r.json();
    setSecurityMsg(r.ok ? 'Password updated.' : d.error ?? 'Unable to update password.');
    if (r.ok) { setCurrentPw(''); setNewPw(''); setConfirmPw(''); }
    setSecuritySaving(false);
  };

  const cancelBooking = async (bookingId: string) => {
    setCancelPending(true);
    setCancelMsg(null);
    const r = await fetch(`/api/bookings/${bookingId}/cancel`, { method: 'POST' });
    const d = await r.json();
    if (r.ok) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELED' } : b)),
      );
      setCancelMsg({
        id: bookingId,
        ok: true,
        text: d.refundPercent > 0
          ? `Booking cancelled. ${d.refundLabel} — $${d.refundedDollars} will be returned to your card within 5–10 days.`
          : 'Booking cancelled. No refund applies per the cancellation policy.',
      });
    } else {
      setCancelMsg({ id: bookingId, ok: false, text: d.error ?? 'Unable to cancel.' });
    }
    setCancellingId(null);
    setCancelPending(false);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'bookings', label: 'My bookings' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav />

      <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Account</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {profile?.name ? `Welcome back, ${profile.name.split(' ')[0]}.` : 'My account'}
          </h1>
          {profile?.email && <p className="mt-1 text-sm text-slate-400">{profile.email}</p>}
        </div>

        <div className="mb-8 flex gap-1 rounded-2xl border border-slate-800 bg-slate-900 p-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                tab === t.id ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold">Personal information</h2>
            <p className="mt-1 text-sm text-slate-400">Update your name, phone, and date of birth.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-200">Full name
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">Email address
                <input value={profile?.email ?? ''} readOnly
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-400 cursor-not-allowed" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">Phone number
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">Date of birth
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
              </label>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <button onClick={saveProfile} disabled={profileSaving}
                className="rounded-full bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-60 transition">
                {profileSaving ? 'Saving…' : 'Save profile'}
              </button>
              {profileMsg && (
                <p className={`text-sm ${profileMsg === 'Profile saved.' ? 'text-emerald-400' : 'text-rose-400'}`}>{profileMsg}</p>
              )}
            </div>
          </div>
        )}

        {/* Security tab */}
        {tab === 'security' && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold">Change password</h2>
            <p className="mt-1 text-sm text-slate-400">Choose a strong password of at least 8 characters.</p>
            <div className="mt-6 grid gap-4 max-w-md">
              <label className="grid gap-2 text-sm text-slate-200">Current password
                <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">New password
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="••••••••"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">Confirm new password
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500" />
              </label>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <button onClick={changePassword} disabled={securitySaving || !currentPw || !newPw || !confirmPw}
                className="rounded-full bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-60 transition">
                {securitySaving ? 'Updating…' : 'Update password'}
              </button>
              {securityMsg && (
                <p className={`text-sm ${securityMsg === 'Password updated.' ? 'text-emerald-400' : 'text-rose-400'}`}>{securityMsg}</p>
              )}
            </div>
          </div>
        )}

        {/* Bookings tab */}
        {tab === 'bookings' && (
          <div className="space-y-4">
            {/* Cancellation policy summary */}
            <details className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 text-sm">
              <summary className="cursor-pointer font-medium text-slate-300 hover:text-white transition select-none">
                Cancellation policy
              </summary>
              <div className="mt-4 divide-y divide-slate-800">
                {CANCELLATION_POLICY.map((tier) => (
                  <div key={tier.minDaysBeforePickup} className="flex items-center justify-between py-3">
                    <span className="text-slate-400">{tier.description}</span>
                    <span className={`ml-4 shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                      tier.refundPercent === 100 ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' :
                      tier.refundPercent > 0    ? 'border-amber-500/20 bg-amber-500/10 text-amber-300' :
                                                  'border-rose-500/20 bg-rose-500/10 text-rose-300'
                    }`}>{tier.label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">Security deposits are always fully refunded regardless of when you cancel.</p>
            </details>

            {bookingsLoading ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">Loading your bookings…</div>
            ) : bookings.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">
                <p className="text-slate-300">No bookings yet.</p>
                <a href="/booking" className="mt-4 inline-flex rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 transition">
                  Book your first car
                </a>
              </div>
            ) : (
              <>
                {bookings.map((b) => {
                  const daysUntil = Math.floor(
                    (new Date(b.pickupDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                  );
                  const tier = getRefundTier(daysUntil);
                  const refundAmt = fmt(Math.round((b.total * tier.refundPercent) / 100));
                  const canCancel = (b.status === 'PENDING' || b.status === 'CONFIRMED') && daysUntil >= 0;

                  return (
                    <article key={b.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold">{b.vehicle.name}</p>
                          <p className="text-sm text-slate-400">{b.vehicle.type}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${STATUS_STYLES[b.status]}`}>
                          {b.status}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-500">Pickup</p>
                          <p className="mt-1 text-sm font-medium">{fmtDate(b.pickupDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-500">Return</p>
                          <p className="mt-1 text-sm font-medium">{fmtDate(b.returnDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-500">Rental total</p>
                          <p className="mt-1 text-sm font-medium">{fmt(b.total)}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-500">Deposit (refundable)</p>
                          <p className="mt-1 text-sm font-medium">{fmt(b.deposit)}</p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-400">
                          <span>Subtotal <strong className="text-white">{fmt(b.subtotal)}</strong></span>
                          <span>NJ Tax <strong className="text-white">{fmt(b.tax)}</strong></span>
                          <span>Deposit <strong className="text-white">{fmt(b.deposit)}</strong></span>
                          <span className="font-semibold text-white">Charged total <strong>{fmt(b.total + b.deposit)}</strong></span>
                        </div>
                      </div>

                      {/* Cancel confirmation panel */}
                      {cancellingId === b.id && (
                        <div className="mt-4 rounded-2xl border border-rose-900/60 bg-rose-950/30 p-4">
                          <p className="text-sm font-medium text-rose-200">Cancel this booking?</p>
                          <div className="mt-2 text-sm text-slate-300 space-y-1">
                            <p>Days until pickup: <strong>{daysUntil >= 0 ? `${daysUntil} day${daysUntil !== 1 ? 's' : ''}` : 'past pickup'}</strong></p>
                            <p>Refund policy: <strong>{tier.label}</strong>
                              {tier.refundPercent > 0 && b.status === 'CONFIRMED'
                                ? ` — ${refundAmt} returned to your card`
                                : b.status === 'PENDING'
                                ? ' — no charge was made'
                                : ' — no refund'}
                            </p>
                          </div>
                          <div className="mt-4 flex gap-3">
                            <button
                              onClick={() => cancelBooking(b.id)}
                              disabled={cancelPending}
                              className="rounded-full bg-rose-500 px-5 py-2 text-xs font-semibold text-white hover:bg-rose-400 disabled:opacity-60 transition"
                            >
                              {cancelPending ? 'Cancelling…' : 'Yes, cancel booking'}
                            </button>
                            <button
                              onClick={() => setCancellingId(null)}
                              className="rounded-full border border-slate-700 px-5 py-2 text-xs text-slate-300 hover:border-slate-500 hover:text-white transition"
                            >
                              Keep booking
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Result message */}
                      {cancelMsg?.id === b.id && (
                        <p className={`mt-3 text-sm ${cancelMsg.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {cancelMsg.text}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="font-mono text-xs text-slate-600">ID: {b.id}</p>
                        <div className="flex gap-2">
                          {b.status === 'PENDING' && (
                            <a href="/booking" className="rounded-full border border-amber-500/40 px-4 py-1.5 text-xs text-amber-300 hover:border-amber-400 transition">
                              Complete payment
                            </a>
                          )}
                          {canCancel && cancellingId !== b.id && (
                            <button
                              onClick={() => { setCancellingId(b.id); setCancelMsg(null); }}
                              className="rounded-full border border-rose-800 px-4 py-1.5 text-xs text-rose-400 hover:border-rose-600 hover:text-rose-300 transition"
                            >
                              Cancel booking
                            </button>
                          )}
                          <a href="/booking" className="rounded-full bg-cyan-400 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-300 transition">
                            Book again
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
                <div className="pt-2 text-center">
                  <a href="/booking" className="inline-flex rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 transition">
                    Make a new booking
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense>
      <AccountContent />
    </Suspense>
  );
}
