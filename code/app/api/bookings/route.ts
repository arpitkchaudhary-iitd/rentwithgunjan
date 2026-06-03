import { NextResponse } from 'next/server';

import { getSessionFromRequest } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

const NJ_TAX_RATE = 0.08875;

export async function POST(request: Request) {
  const user = getSessionFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { vehicleId, pickupDate, returnDate } = await request.json();

    if (!vehicleId || !pickupDate || !returnDate) {
      return NextResponse.json({ error: 'vehicleId, pickupDate, and returnDate are required.' }, { status: 400 });
    }

    const pickup = new Date(`${pickupDate}T00:00:00Z`);
    const returnDay = new Date(`${returnDate}T00:00:00Z`);

    if (pickup >= returnDay) {
      return NextResponse.json({ error: 'pickupDate must be before returnDate.' }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId, active: true } });
    if (!vehicle) return NextResponse.json({ error: 'Vehicle not found.' }, { status: 404 });

    // Check for conflicting bookings
    const conflict = await prisma.booking.findFirst({
      where: {
        vehicleId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        pickupDate: { lt: returnDay },
        returnDate: { gt: pickup },
      },
    });
    if (conflict) {
      return NextResponse.json({ error: 'This vehicle is not available for the selected dates.' }, { status: 409 });
    }

    const rentalDays = Math.max(1, Math.ceil((returnDay.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)));
    const subtotalCents = rentalDays * vehicle.dailyRate;
    const taxCents = Math.round(subtotalCents * NJ_TAX_RATE);
    const totalCents = subtotalCents + taxCents;

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        vehicleId,
        pickupDate: pickup,
        returnDate: returnDay,
        status: 'PENDING',
        subtotal: subtotalCents,
        tax: taxCents,
        deposit: vehicle.deposit,
        total: totalCents,
      },
    });

    return NextResponse.json({ ok: true, bookingId: booking.id });
  } catch {
    return NextResponse.json({ error: 'Unable to create booking.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const user = getSessionFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { vehicle: true, payment: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ bookings });
}
