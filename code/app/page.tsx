export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:px-8">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">rentwithgunjan</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          A clean, scalable car rental website foundation for Hoboken and future city expansion.
        </h1>
        <p className="max-w-2xl text-lg text-slate-300">
          This starter app includes the base Next.js + Tailwind structure needed for bookings, payments, customer profiles, and future multi-city growth.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            'Availability & booking flow',
            'Stripe-ready payment setup',
            'Customer data and future marketing hooks',
          ].map((item) => (
            <article key={item} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <h2 className="text-xl font-semibold">{item}</h2>
              <p className="mt-3 text-sm text-slate-300">Ready for the next implementation steps.</p>
            </article>
          ))}
        </div>

        <a
          href="/booking"
          className="inline-flex w-fit items-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:bg-cyan-300"
        >
          Open the reservation prototype
        </a>
      </section>
    </main>
  );
}
