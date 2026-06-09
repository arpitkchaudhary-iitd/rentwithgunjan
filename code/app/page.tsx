import HeroActions from './components/HeroActions';
import Nav from './components/Nav';
import Skyline from './components/Skyline';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav />

      <main>
        {/* Hero */}
        <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20 lg:px-8">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">
            Hoboken, New Jersey
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl leading-[1.08]">
            Premium cars.<br />
            <span className="text-cyan-400">Manhattan views.</span><br />
            <span className="text-slate-400 text-4xl md:text-5xl font-light">No hassle.</span>
          </h1>
          <p className="max-w-xl text-lg text-slate-300 leading-relaxed">
            Pick your dates, choose from our handpicked fleet, and pay securely with Stripe.
            Keys in hand in minutes — right across from the NYC skyline.
          </p>
          <HeroActions />
        </section>

        {/* NYC Skyline banner */}
        <Skyline />

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <p className="mb-8 text-sm uppercase tracking-[0.25em] text-cyan-400">Why Rent With Gunjan</p>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: (
                  <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                  </svg>
                ),
                title: 'Live availability',
                body: 'Real-time calendar — see exactly which cars are free for your dates before you book.',
              },
              {
                icon: (
                  <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                ),
                title: 'Secure Stripe checkout',
                body: 'Pay by card in seconds. NJ sales tax and refundable deposit calculated automatically.',
              },
              {
                icon: (
                  <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                ),
                title: 'Full booking history',
                body: 'View your trips, receipts, and upcoming rentals — all in your account dashboard.',
              },
            ].map((f) => (
              <article key={f.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                  {f.icon}
                </div>
                <h2 className="text-lg font-semibold">{f.title}</h2>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Footer strip */}
        <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Rent With Gunjan · Hoboken, NJ ·{' '}
          <a href="mailto:info@rentwithgunjan.com" className="hover:text-slate-300 transition">
            info@rentwithgunjan.com
          </a>
        </footer>
      </main>
    </div>
  );
}
