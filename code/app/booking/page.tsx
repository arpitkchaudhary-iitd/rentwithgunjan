'use client';

import { useEffect, useMemo, useState } from 'react';
import Nav from '../components/Nav';

type VehicleOption = {
  id: string;
  name: string;
  type: string;
  dailyRate: number;
  deposit: number;
  imageUrl?: string | null;
  estimate: { rentalDays: number; subtotal: number; tax: number; total: number; deposit: number };
};

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function BookingPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [pickupDate, setPickupDate] = useState(today);
  const [returnDate, setReturnDate] = useState(addDays(today, 3));
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState('');

  // Auth state
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null | undefined>(undefined);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const handlePickupChange = (newPickup: string) => {
    setPickupDate(newPickup);
    if (returnDate <= newPickup) setReturnDate(addDays(newPickup, 1));
  };

  useEffect(() => {
    const loadAvailability = async () => {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/availability?pickupDate=${pickupDate}&returnDate=${returnDate}`);
      const data = await response.json();
      setVehicles(data.vehicles ?? []);
      setSelectedVehicleId((data.vehicles ?? [])[0]?.id ?? '');
      setLoading(false);
    };
    loadAvailability();
  }, [pickupDate, returnDate]);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId) ?? null,
    [selectedVehicleId, vehicles],
  );

  const reserve = async () => {
    if (!selectedVehicle) return;
    setReserving(true);
    setError('');
    try {
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId: selectedVehicle.id, pickupDate, returnDate }),
      });
      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) {
        setError(bookingData.error ?? 'Unable to create booking.');
        setReserving(false);
        return;
      }
      const checkoutRes = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: bookingData.bookingId }),
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        setError(checkoutData.error ?? 'Unable to start checkout.');
        setReserving(false);
        return;
      }
      window.location.href = checkoutData.url;
    } catch {
      setError('Something went wrong. Please try again.');
      setReserving(false);
    }
  };

  const handleReserveClick = () => {
    if (!user) {
      setShowAuth(true);
      setAuthError('');
    } else {
      reserve();
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (authMode === 'register') {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: authName, email: authEmail, password: authPassword }),
        });
        const regData = await regRes.json();
        if (!regRes.ok) {
          setAuthError(regData.error ?? 'Unable to create account.');
          setAuthLoading(false);
          return;
        }
      }

      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        setAuthError(loginData.error ?? 'Invalid email or password.');
        setAuthLoading(false);
        return;
      }

      setUser(loginData.user);
      setShowAuth(false);
      // Auto-proceed with the reservation
      setAuthLoading(false);
      reserve();
    } catch {
      setAuthError('Something went wrong. Please try again.');
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav />
      <main>
        <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 lg:px-8">
          <header className="space-y-4">
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Reserve a car</p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
              Pick your dates. We handle the rest.
            </h1>
            <p className="max-w-2xl text-slate-300">
              Select your dates, choose a vehicle, and pay securely via Stripe. Confirmation is instant.
            </p>
          </header>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Vehicle picker */}
            <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h2 className="text-xl font-semibold">Availability window</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-slate-200">
                  Pickup date
                  <input type="date" value={pickupDate} min={today}
                    onChange={(e) => handlePickupChange(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
                </label>
                <label className="grid gap-2 text-sm text-slate-200">
                  Return date
                  <input type="date" value={returnDate} min={addDays(pickupDate, 1)}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
                </label>
              </div>

              <div className="mt-6 space-y-4">
                {loading ? (
                  <p className="text-sm text-cyan-200">Checking availability…</p>
                ) : vehicles.length === 0 ? (
                  <p className="rounded-2xl border border-rose-900 bg-rose-950/40 p-4 text-sm text-rose-100">
                    No cars available for those dates. Try adjusting the window.
                  </p>
                ) : (
                  vehicles.map((vehicle) => (
                    <button key={vehicle.id} type="button"
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      className={`w-full rounded-2xl border p-5 text-left transition ${
                        selectedVehicleId === vehicle.id
                          ? 'border-cyan-400 bg-cyan-400/10'
                          : 'border-slate-800 bg-slate-950 hover:border-cyan-400/60'
                      }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold">{vehicle.name}</p>
                          <p className="text-sm text-slate-300">{vehicle.type} · ${vehicle.dailyRate}/day</p>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
                          Available
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-300">
                        {vehicle.estimate.rentalDays} day rental · ${vehicle.estimate.subtotal} subtotal · ${vehicle.estimate.tax} NJ tax
                      </p>
                    </button>
                  ))
                )}
              </div>
            </article>

            {/* Summary + auth */}
            <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h2 className="text-xl font-semibold">Reservation summary</h2>

              {selectedVehicle ? (
                <div className="mt-6 space-y-5 text-sm text-slate-200">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Selected vehicle</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{selectedVehicle.name}</p>
                    <p className="text-slate-300">{selectedVehicle.type}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Pricing estimate</p>
                    <div className="mt-3 space-y-2 text-slate-200">
                      <div className="flex justify-between"><span>Rental days</span><strong>{selectedVehicle.estimate.rentalDays}</strong></div>
                      <div className="flex justify-between"><span>Subtotal</span><strong>${selectedVehicle.estimate.subtotal}</strong></div>
                      <div className="flex justify-between"><span>New Jersey tax (8.875%)</span><strong>${selectedVehicle.estimate.tax}</strong></div>
                      <div className="flex justify-between border-t border-slate-700 pt-2 text-white"><span>Rental total</span><strong>${selectedVehicle.estimate.total}</strong></div>
                      <div className="flex justify-between text-slate-300"><span>Security deposit (refundable)</span><strong>${selectedVehicle.estimate.deposit}</strong></div>
                    </div>
                  </div>

                  {error ? <p className="rounded-xl bg-rose-950/40 p-3 text-sm text-rose-200">{error}</p> : null}

                  {/* Guest auth panel */}
                  {showAuth && !user ? (
                    <div className="rounded-2xl border border-cyan-900/60 bg-cyan-950/20 p-5 space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-white">Almost there!</p>
                        <p className="text-xs text-slate-400 mt-1">Sign in or create a free account to complete your reservation.</p>
                      </div>

                      {/* Tab toggle */}
                      <div className="flex rounded-xl border border-slate-700 bg-slate-900 p-1">
                        <button type="button" onClick={() => { setAuthMode('login'); setAuthError(''); }}
                          className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${authMode === 'login' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
                          Sign in
                        </button>
                        <button type="button" onClick={() => { setAuthMode('register'); setAuthError(''); }}
                          className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${authMode === 'register' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
                          Create account
                        </button>
                      </div>

                      <form onSubmit={handleAuth} className="space-y-3">
                        {authMode === 'register' && (
                          <input value={authName} onChange={(e) => setAuthName(e.target.value)}
                            placeholder="Full name" required
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500" />
                        )}
                        <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="Email address" required
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500" />
                        <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Password (min. 8 characters)" required minLength={8}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500" />

                        {authError && <p className="rounded-lg bg-rose-950/40 px-3 py-2 text-xs text-rose-300">{authError}</p>}

                        <button type="submit" disabled={authLoading}
                          className="w-full rounded-full bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-60 transition">
                          {authLoading
                            ? 'Please wait…'
                            : authMode === 'login'
                            ? 'Sign in and reserve →'
                            : 'Create account and reserve →'}
                        </button>
                      </form>

                      <button type="button" onClick={() => setShowAuth(false)}
                        className="w-full text-xs text-slate-500 hover:text-slate-300 transition">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button type="button" onClick={handleReserveClick} disabled={reserving}
                        className="mt-2 inline-flex w-full justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 hover:bg-cyan-300 disabled:opacity-60">
                        {reserving ? 'Preparing checkout…' : user ? 'Reserve now — pay with Stripe' : 'Reserve now →'}
                      </button>
                      {!user && (
                        <p className="text-center text-xs text-slate-400">
                          You'll be asked to sign in or create a free account — it only takes 30 seconds.
                        </p>
                      )}
                    </>
                  )}

                  <p className="text-xs text-slate-400">
                    Redirected to Stripe for secure payment. The deposit is fully refundable after return.
                  </p>
                </div>
              ) : (
                <p className="mt-6 text-slate-300">Choose a date range and select a vehicle to see the pricing summary.</p>
              )}
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
