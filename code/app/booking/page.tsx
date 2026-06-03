'use client';

import { useEffect, useMemo, useState } from 'react';

type VehicleOption = {
  id: string;
  name: string;
  type: string;
  dailyRate: number;
  deposit: number;
  imageUrl?: string | null;
  estimate: { rentalDays: number; subtotal: number; tax: number; total: number; deposit: number };
};

export default function BookingPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [pickupDate, setPickupDate] = useState(today);
  const [returnDate, setReturnDate] = useState(
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().slice(0, 10),
  );
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 lg:px-8">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Booking flow</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            Reserve a car in Hoboken in a few steps.
          </h1>
          <p className="max-w-2xl text-slate-300">
            Select your dates, pick a vehicle, and complete checkout securely via Stripe.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">Availability window</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-200">
                Pickup date
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                Return date
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                />
              </label>
            </div>

            <div className="mt-6 space-y-4">
              {loading ? (
                <p className="text-sm text-cyan-200">Checking availability…</p>
              ) : vehicles.length === 0 ? (
                <p className="rounded-2xl border border-rose-900 bg-rose-950/40 p-4 text-sm text-rose-100">
                  No cars are available for those dates. Try adjusting the window.
                </p>
              ) : (
                vehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    type="button"
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={`w-full rounded-2xl border p-5 text-left transition ${
                      selectedVehicleId === vehicle.id
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-slate-800 bg-slate-950 hover:border-cyan-400/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold">{vehicle.name}</p>
                        <p className="text-sm text-slate-300">
                          {vehicle.type} • ${vehicle.dailyRate}/day
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
                        Available
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      {vehicle.estimate.rentalDays} day rental · ${vehicle.estimate.subtotal} subtotal · $
                      {vehicle.estimate.tax} NJ tax
                    </p>
                  </button>
                ))
              )}
            </div>
          </article>

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
                    <div className="flex justify-between">
                      <span>Rental days</span>
                      <strong>{selectedVehicle.estimate.rentalDays}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <strong>${selectedVehicle.estimate.subtotal}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>New Jersey tax (8.875%)</span>
                      <strong>${selectedVehicle.estimate.tax}</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-700 pt-2 text-white">
                      <span>Rental total</span>
                      <strong>${selectedVehicle.estimate.total}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Security deposit (refundable)</span>
                      <strong>${selectedVehicle.estimate.deposit}</strong>
                    </div>
                  </div>
                </div>
                {error ? <p className="rounded-xl bg-rose-950/40 p-3 text-sm text-rose-200">{error}</p> : null}
                <button
                  type="button"
                  onClick={reserve}
                  disabled={reserving}
                  className="mt-2 inline-flex w-full justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 hover:bg-cyan-300 disabled:opacity-60"
                >
                  {reserving ? 'Preparing checkout…' : 'Reserve now — pay with Stripe'}
                </button>
                <p className="text-xs text-slate-400">
                  You will be redirected to Stripe to complete payment. The deposit is fully refundable after the
                  rental.
                </p>
              </div>
            ) : (
              <p className="mt-6 text-slate-300">
                Choose a date range and select a vehicle to see the pricing summary and checkout options.
              </p>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
