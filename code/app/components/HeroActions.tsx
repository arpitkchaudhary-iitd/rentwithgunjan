'use client';

import { useEffect, useState } from 'react';

export default function HeroActions() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => setLoggedIn(r.ok))
      .catch(() => setLoggedIn(false));
  }, []);

  // Render nothing until we know auth state to avoid layout shift
  if (loggedIn === null) return null;

  return (
    <div className="flex flex-wrap gap-4">
      <a
        href="/booking"
        className="inline-flex items-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 hover:bg-cyan-300 transition"
      >
        Check availability →
      </a>
      {!loggedIn && (
        <a
          href="/signup"
          className="inline-flex items-center rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-white hover:border-slate-500 transition"
        >
          Create an account
        </a>
      )}
    </div>
  );
}
