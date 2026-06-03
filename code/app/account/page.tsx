'use client';

import { useEffect, useState } from 'react';

type Profile = {
  email: string;
  name: string;
  phone: string;
  dateOfBirth: string;
  marketingOptIn: boolean;
  preferredContact: string;
  realEstateInterest: boolean;
  preferredNeighborhood: string;
  propertyTypeInterest: string;
  householdStatus: string;
};

const EMPTY: Profile = {
  email: '', name: '', phone: '', dateOfBirth: '',
  marketingOptIn: false, preferredContact: 'email',
  realEstateInterest: false, preferredNeighborhood: '',
  propertyTypeInterest: '', householdStatus: '',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm text-slate-200">
      {label}
      {children}
    </label>
  );
}

const inputCls = 'rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none';
const selectCls = `${inputCls} cursor-pointer`;

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setProfile({
            email: d.user.email ?? '',
            name: d.user.name ?? '',
            phone: d.user.phone ?? '',
            dateOfBirth: d.user.dateOfBirth ?? '',
            marketingOptIn: d.user.marketingOptIn ?? false,
            preferredContact: d.user.preferredContact ?? 'email',
            realEstateInterest: d.user.realEstateInterest ?? false,
            preferredNeighborhood: d.user.preferredNeighborhood ?? '',
            propertyTypeInterest: d.user.propertyTypeInterest ?? '',
            householdStatus: d.user.householdStatus ?? '',
          });
        }
      })
      .catch(() => null);
  }, []);

  const set = (field: keyof Profile, value: string | boolean) =>
    setProfile((prev) => ({ ...prev, [field]: value }));

  const saveProfile = async () => {
    setSaving(true);
    setSaveMsg('');
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    setSaveMsg(res.ok ? 'Profile saved.' : data.error ?? 'Unable to save.');
    setSaving(false);
  };

  const uploadLicense = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg('Uploading…');
    setUploadedDoc('');

    const form = new FormData();
    form.append('file', file);

    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const data = await res.json();

    if (res.ok) {
      setUploadedDoc(data.fileName);
      setUploadMsg('Driver license uploaded and saved successfully.');
    } else {
      setUploadMsg(data.error ?? 'Upload failed.');
    }
    setUploading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 lg:px-8">

        <header>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">My account</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Profile &amp; documents</h1>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">

          {/* ── Core profile ── */}
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold">Contact information</h2>
            <p className="mt-1 text-sm text-slate-400">Used for booking confirmations and rental communications.</p>
            <div className="mt-6 space-y-4">
              <Field label="Full name">
                <input value={profile.name} onChange={(e) => set('name', e.target.value)}
                  placeholder="Jane Smith" className={inputCls} />
              </Field>
              <Field label="Email address">
                <input value={profile.email} readOnly
                  className={`${inputCls} cursor-not-allowed opacity-60`} />
              </Field>
              <Field label="Phone number">
                <input value={profile.phone} onChange={(e) => set('phone', e.target.value)}
                  placeholder="+1 (201) 555-0100" className={inputCls} />
              </Field>
              <Field label="Date of birth (required for rental compliance)">
                <input type="date" value={profile.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)}
                  className={inputCls} />
              </Field>
            </div>
          </article>

          {/* ── Driver license ── */}
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold">Driver license</h2>
            <p className="mt-1 text-sm text-slate-400">
              Upload a clear photo or PDF of your valid driver license. Required before your first rental.
              Files are stored securely and never shared publicly.
            </p>
            <label className="mt-6 flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center hover:border-cyan-400/60 transition">
              <span className="text-3xl">📄</span>
              <span className="text-sm text-slate-300">
                {uploading ? 'Uploading…' : 'Click to choose a file'}
              </span>
              <span className="text-xs text-slate-500">JPG, PNG, WEBP or PDF · max 10 MB</span>
              <input type="file" accept="image/*,.pdf" onChange={uploadLicense}
                className="sr-only" disabled={uploading} />
            </label>
            {uploadMsg && (
              <p className={`mt-4 rounded-xl px-4 py-3 text-sm ${uploadedDoc ? 'bg-emerald-900/30 text-emerald-300' : 'bg-rose-900/30 text-rose-300'}`}>
                {uploadMsg}
              </p>
            )}
            {uploadedDoc && (
              <p className="mt-2 truncate font-mono text-xs text-slate-500">{uploadedDoc}</p>
            )}
          </article>

          {/* ── Communication preferences ── */}
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold">Communication preferences</h2>
            <p className="mt-1 text-sm text-slate-400">Control how we reach you for updates and offers.</p>
            <div className="mt-6 space-y-5">
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={profile.marketingOptIn}
                  onChange={(e) => set('marketingOptIn', e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-cyan-400" />
                <span className="text-sm text-slate-200">
                  Yes, send me deals, availability updates, and seasonal promotions
                </span>
              </label>
              <Field label="Preferred contact method">
                <select value={profile.preferredContact}
                  onChange={(e) => set('preferredContact', e.target.value)} className={selectCls}>
                  <option value="email">Email</option>
                  <option value="phone">Phone call</option>
                  <option value="sms">SMS / text</option>
                </select>
              </Field>
            </div>
          </article>

          {/* ── Real estate cross-sell ── */}
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold">Real estate interest
              <span className="ml-2 rounded-full bg-slate-700 px-2 py-0.5 text-xs font-normal text-slate-300">Optional</span>
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Gunjan Goel is a licensed NJ real estate agent. Share your property interests and she
              will reach out if a relevant opportunity comes up — completely optional, no pressure.
            </p>
            <div className="mt-6 space-y-5">
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={profile.realEstateInterest}
                  onChange={(e) => set('realEstateInterest', e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-cyan-400" />
                <span className="text-sm text-slate-200">
                  I'm open to hearing about real estate opportunities in the area
                </span>
              </label>

              {profile.realEstateInterest && (
                <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-950 p-4">
                  <Field label="Preferred neighborhood">
                    <select value={profile.preferredNeighborhood}
                      onChange={(e) => set('preferredNeighborhood', e.target.value)} className={selectCls}>
                      <option value="">Select a neighborhood…</option>
                      <option value="Hoboken">Hoboken, NJ</option>
                      <option value="Jersey City">Jersey City, NJ</option>
                      <option value="Newark">Newark, NJ</option>
                      <option value="Weehawken">Weehawken, NJ</option>
                      <option value="Edgewater">Edgewater, NJ</option>
                      <option value="NYC">New York City, NY</option>
                      <option value="other">Other / flexible</option>
                    </select>
                  </Field>
                  <Field label="Property type interest">
                    <select value={profile.propertyTypeInterest}
                      onChange={(e) => set('propertyTypeInterest', e.target.value)} className={selectCls}>
                      <option value="">Select a type…</option>
                      <option value="condo">Condo / apartment</option>
                      <option value="house">Single-family house</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="commercial">Commercial space</option>
                      <option value="any">No preference</option>
                    </select>
                  </Field>
                  <Field label="Current housing situation">
                    <select value={profile.householdStatus}
                      onChange={(e) => set('householdStatus', e.target.value)} className={selectCls}>
                      <option value="">Select…</option>
                      <option value="renting">Currently renting</option>
                      <option value="owns">Own my home</option>
                      <option value="looking-to-buy">Actively looking to buy</option>
                      <option value="looking-to-rent">Looking to rent</option>
                      <option value="investor">Real estate investor</option>
                    </select>
                  </Field>
                </div>
              )}
            </div>
          </article>
        </div>

        {/* ── Save button ── */}
        <div className="flex items-center gap-4">
          <button type="button" onClick={saveProfile} disabled={saving}
            className="rounded-full bg-cyan-400 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 hover:bg-cyan-300 disabled:opacity-60">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
          {saveMsg && (
            <p className={`text-sm ${saveMsg === 'Profile saved.' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {saveMsg}
            </p>
          )}
        </div>

      </section>
    </main>
  );
}
