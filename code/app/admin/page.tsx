'use client';

import { useEffect, useState } from 'react';

type Booking = {
  id: string;
  status: string;
  pickupDate: string;
  returnDate: string;
  total: number;
  tax: number;
  deposit: number;
  user: { name: string | null; email: string };
  vehicle: { name: string; type: string };
  payment: { status: string; amount: number } | null;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-amber-300 bg-amber-900/30 border-amber-800',
  CONFIRMED: 'text-emerald-300 bg-emerald-900/30 border-emerald-800',
  CANCELED: 'text-rose-300 bg-rose-900/30 border-rose-800',
  COMPLETED: 'text-slate-300 bg-slate-800/60 border-slate-700',
};

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');

  useEffect(() => {
    fetch('/api/admin/bookings')
      .then((r) => r.json())
      .then((d) => { setBookings(d.bookings ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok) {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: data.booking.status } : b)));
    }
    setUpdating('');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 lg:px-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Admin</p>
          <h1 className="text-4xl font-semibold tracking-tight">Bookings dashboard</h1>
          <p className="text-slate-400">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
        </header>

        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : bookings.length === 0 ? (
          <p className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            No bookings yet.
          </p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <article key={booking.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{booking.vehicle.name}</p>
                      <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${STATUS_COLORS[booking.status] ?? ''}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">
                      {booking.user.name || booking.user.email} · {booking.user.email}
                    </p>
                    <p className="text-sm text-slate-400">
                      {booking.pickupDate.slice(0, 10)} → {booking.returnDate.slice(0, 10)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">${(booking.total / 100).toFixed(2)}</p>
                    <p className="text-sm text-slate-400">+ ${(booking.deposit / 100).toFixed(2)} deposit</p>
                    {booking.payment ? (
                      <p className="mt-1 text-xs text-emerald-300">Payment: {booking.payment.status}</p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {['CONFIRMED', 'CANCELED', 'COMPLETED'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={booking.status === s || updating === booking.id}
                      onClick={() => updateStatus(booking.id, s)}
                      className="rounded-full border border-slate-700 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-40"
                    >
                      Mark {s.toLowerCase()}
                    </button>
                  ))}
                </div>

                <p className="mt-3 font-mono text-xs text-slate-600">{booking.id}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
