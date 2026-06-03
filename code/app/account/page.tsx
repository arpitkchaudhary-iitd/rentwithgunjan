'use client';

import { useState } from 'react';

export default function AccountPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  const saveProfile = async () => {
    setStatus('Saving your profile…');
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone }),
    });

    const data = await response.json();
    setStatus(response.ok ? 'Profile saved successfully.' : data.error ?? 'Unable to save profile.');
  };

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('Uploading file…');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', 'driver-licenses');

    const response = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await response.json();
    setUploadStatus(response.ok ? `Uploaded to ${data.path}` : data.error ?? 'Upload failed.');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16 lg:px-8">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Account & uploads</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">Collect user details and driver-license uploads in one place.</h1>
        <p className="max-w-2xl text-slate-300">This is the next real step beyond the placeholder login screen: user profile capture and file upload persistence.</p>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">User profile</h2>
            <div className="mt-6 space-y-4">
              <label className="grid gap-2 text-sm text-slate-200">Full name
                <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">Phone
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
              </label>
              <button onClick={saveProfile} className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 hover:bg-cyan-300">Save profile</button>
              {status ? <p className="text-sm text-cyan-100">{status}</p> : null}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">Driver license upload</h2>
            <p className="mt-2 text-sm text-slate-300">Upload a file to the local server for the next verification step.</p>
            <input type="file" accept="image/*,.pdf" onChange={uploadFile} className="mt-6 block w-full rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-4 text-sm text-slate-100" />
            {uploadStatus ? <p className="mt-4 text-sm text-cyan-100">{uploadStatus}</p> : null}
          </article>
        </div>
      </section>
    </main>
  );
}
