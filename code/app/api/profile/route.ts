import { NextResponse } from 'next/server';

import { addUser } from '../../../lib/storage';

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (!payload.email || !payload.name) {
      return NextResponse.json({ error: 'name and email are required.' }, { status: 400 });
    }

    const saved = await addUser({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...payload,
    });

    return NextResponse.json({ ok: true, user: saved });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to save profile.' }, { status: 500 });
  }
}
