'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Nav from '../../components/Nav';

function SuccessContent() {
  const params = useSearchParams();
  const bookingId = params.get('bookingId');

  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-6 py-24 text-center lg:px-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-4xl">
          ✓
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">Booking confirmed!</h1>
        <p className="text-slate-300">
          Your payment was successful and your reservation is confirmed. A confirmation email has been sent to you.
        </p>
        {bookingId ? (
          <p className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-4 font-mono text-sm text-slate-300">
            Booking ID: <span className="text-cyan-300">{bookingId}</span>
          </p>
        ) : null}
        <a
          href="/account#bookings"
          onClick={() => localStorage.setItem('accountTab', 'bookings')}
          className="mt-2 inline-flex rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg hover:bg-cyan-300"
        >
          View my bookings
        </a>
        <a href="/" className="text-sm text-slate-400 hover:text-slate-200">
          Back to home
        </a>
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
