import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

import { getSessionFromRequest } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const bookingId = formData.get('bookingId') as string | null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'A file is required.' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, WEBP, and PDF files are accepted.' }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File must be under 10 MB.' }, { status: 400 });
    }

    // Store outside /public so files are not served as static assets (PII protection)
    const uploadDir = path.join(process.cwd(), 'uploads', 'driver-licenses');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.bin';
    const fileName = `${session.id}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Record in DB — storageUrl is the server-local path (replace with blob URL in production)
    const storageUrl = `/api/documents/${fileName}`;

    const doc = await prisma.documentUpload.create({
      data: {
        userId: session.id,
        bookingId: bookingId || null,
        fileName: file.name,
        storageUrl,
      },
    });

    return NextResponse.json({ ok: true, documentId: doc.id, fileName: file.name });
  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}
