import { NextResponse } from 'next/server';

import { getSessionFromRequest } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

const ALLOWED_FIELDS = [
  'name', 'phone', 'dateOfBirth',
  'marketingOptIn', 'preferredContact',
  'realEstateInterest', 'preferredNeighborhood', 'propertyTypeInterest', 'householdStatus',
] as const;

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true, email: true, name: true, phone: true, dateOfBirth: true,
      marketingOptIn: true, preferredContact: true,
      realEstateInterest: true, preferredNeighborhood: true,
      propertyTypeInterest: true, householdStatus: true,
    },
  });
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const payload = await request.json();

  // Only pick allowed fields to prevent mass-assignment
  const data: Record<string, unknown> = {};
  for (const field of ALLOWED_FIELDS) {
    if (field in payload) data[field] = payload[field];
  }

  const user = await prisma.user.update({
    where: { id: session.id },
    data,
    select: {
      id: true, email: true, name: true, phone: true, dateOfBirth: true,
      marketingOptIn: true, preferredContact: true,
      realEstateInterest: true, preferredNeighborhood: true,
      propertyTypeInterest: true, householdStatus: true,
    },
  });

  return NextResponse.json({ ok: true, user });
}
