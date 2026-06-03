'use client';

import { useEffect, useMemo, useState } from 'react';

import type { Vehicle } from '../../lib/booking';

export default function BookingPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [pickupDate, setPickupDate] = useState(today);
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().slice(0, 10));
  const [vehicles, setVehicles] = useState<Array<Vehicle & { estimate: { subtotal: number; tax: number; total: number; rentalDays: number; deposit: number } }>>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAvailability = async () => {
      setLoading(true);
      const response = await fetch(`/api/availability?pickupDate=${pickupDate}&returnDate=${returnDate}`);
      const data = await response.json();
      setVehicles(data.vehicles ?? []);
      setSelectedVehicleId((data.vehicles ?? [])[0]?.id ?? '');
      setLoading(false);
    };

    loadAvailability();
  }, [pickupDate, returnDate]);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null,
    [selectedVehicleId, vehicles],
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 lg:px-8">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Booking flow</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">Reserve a car in Hoboken in a few steps.</h1>
          <p className="max-w-2xl text-slate-300">This first version uses live availability logic, pricing estimates, and a database-ready booking schema for the next payment integration.</p>
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
                  onChange={(event) => setPickupDate(event.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                Return date
                <input
                  type="date"
                  value={returnDate}
                  onChange={(event) => setReturnDate(event.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                />
              </label>
            </div>

            <div className="mt-6 space-y-4">
              {loading ? (
                <p className="text-sm text-cyan-200">Checking availability…</p>
              ) : vehicles.length === 0 ? (
                <p className="rounded-2xl border border-rose-900 bg-rose-950/40 p-4 text-sm text-rose-100">No cars are available for those dates. Try adjusting the window.</p>
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
                        <p className="text-sm text-slate-300">{vehicle.type} • ${vehicle.dailyRate}/day</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Available</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">{vehicle.estimate.rentalDays} day rental • ${vehicle.estimate.subtotal} subtotal • ${vehicle.estimate.tax} tax</p>
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
                  <p className="text-slate-300">{selectedVehicle.type} with ${selectedVehicle.dailyRate}/day pricing.</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Pricing estimate</p>
                  <div className="mt-3 space-y-2 text-slate-200">
                    <div className="flex justify-between"><span>Rental days</span><strong>{selectedVehicle.estimate.rentalDays}</strong></div>
                    <div className="flex justify-between"><span>Subtotal</span><strong>${selectedVehicle.estimate.subtotal}</strong></div>
                    <div className="flex justify-between"><span>New Jersey tax</span><strong>${selectedVehicle.estimate.tax}</strong></div>
                    <div className="flex justify-between text-white"><span>Estimated total</span><strong>${selectedVehicle.estimate.total}</strong></div>
                    <div className="flex justify-between text-slate-300"><span>Security deposit</span><strong>${selectedVehicle.estimate.deposit}</strong></div>
                  </div>
                </div>
                <p className="text-slate-300">This booking summary is ready to connect to Stripe Checkout and the Prisma booking model in the next implementation phase.</p>
              </div>
            ) : (
              <p className="mt-6 text-slate-300">Choose a date range to reveal the booking summary, pricing estimate, and the next steps for checkout.</p>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
