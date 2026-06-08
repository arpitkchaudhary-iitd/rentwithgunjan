import Nav from './components/Nav';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav />

      <main>
        {/* Hero */}
        <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20 lg:px-8">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Hoboken, New Jersey</p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl leading-tight">
            Rent a premium car.<br />No hassle.
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Choose from our fleet of three handpicked vehicles. Select your dates, pay securely with Stripe, and pick up your keys — it&apos;s that simple.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/booking"
              className="inline-flex items-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 hover:bg-cyan-300 transition">
              Check availability →
            </a>
            <a href="/signup"
              className="inline-flex items-center rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-white hover:border-slate-500 transition">
              Create an account
            </a>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 pb-20 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: 'Live availability', body: 'Real-time calendar so you always know which cars are free for your dates.' },
              { title: 'Secure Stripe checkout', body: 'Pay by card in seconds. NJ sales tax and refundable deposit calculated automatically.' },
              { title: 'Manage your bookings', body: 'View your rental history, receipts, and upcoming trips — all in your account dashboard.' },
            ].map((f) => (
              <article key={f.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <h2 className="text-lg font-semibold">{f.title}</h2>
                <p className="mt-2 text-sm text-slate-400">{f.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
