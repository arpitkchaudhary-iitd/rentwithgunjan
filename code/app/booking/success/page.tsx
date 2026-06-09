'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Nav from '../../components/Nav';

type Booking = {
  id: string;
  pickupDate: string;
  returnDate: string;
  status: string;
  subtotal: number;
  tax: number;
  deposit: number;
  total: number;
  vehicle: { name: string; type: string };
};

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

function SuccessContent() {
  const params = useSearchParams();
  const bookingId = params.get('bookingId');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }
    fetch(`/api/bookings/${bookingId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setBooking(d?.booking ?? null))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [bookingId]);

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-8 px-6 py-20 text-center lg:px-8">
      {/* Confirmation header */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-4xl">
        ✓
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">Booking confirmed!</h1>
        <p className="text-slate-300">
          Payment successful. A confirmation email is on its way to you.
        </p>
      </div>

      {/* Booking detail card */}
      {loading ? (
        <p className="text-sm text-slate-400">Loading booking details…</p>
      ) : booking ? (
        <div className="w-full rounded-3xl border border-slate-800 bg-slate-900 p-6 text-left shadow-2xl">
          {/* Vehicle */}
          <div className="border-b border-slate-800 pb-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Your vehicle</p>
            <p className="mt-1 text-2xl font-semibold">{booking.vehicle.name}</p>
            <p className="text-sm text-slate-400">{booking.vehicle.type}</p>
          </div>

          {/* Dates */}
          <div className="mt-4 grid grid-cols-2 gap-4 border-b border-slate-800 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pickup</p>
              <p className="mt-1 font-medium">{fmtDate(booking.pickupDate)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Return</p>
              <p className="mt-1 font-medium">{fmtDate(booking.returnDate)}</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-4 space-y-2 text-sm border-b border-slate-800 pb-4">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal</span><span>{fmt(booking.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>NJ tax (8.875%)</span><span>{fmt(booking.tax)}</span>
            </div>
            <div className="flex justify-between font-semibold text-white">
              <span>Total charged</span><span>{fmt(booking.total)}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-xs pt-1">
              <span>Security deposit (refundable)</span><span>{fmt(booking.deposit)}</span>
            </div>
          </div>

          {/* Status + ID */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="rounded-full border bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 border-emerald-500/20">
              {booking.status}
            </span>
            <span className="font-mono text-xs text-slate-500 truncate max-w-[180px]">{booking.id}</span>
          </div>
        </div>
      ) : bookingId ? (
        <p className="text-sm text-slate-400">Could not load booking details.</p>
      ) : null}

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 w-full">
        <a
          href="/account?tab=bookings"
          className="inline-flex w-full justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg hover:bg-cyan-300 transition"
        >
          View all my bookings
        </a>
        <a href="/" className="text-sm text-slate-400 hover:text-slate-200 transition">
          Back to home
        </a>
      </div>
    </section>
  );
}

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav />
      <Suspense>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
