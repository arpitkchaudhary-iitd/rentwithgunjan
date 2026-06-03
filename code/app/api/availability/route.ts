import { NextResponse } from 'next/server';

import { prisma } from '../../../lib/prisma';
import { calculateEstimate } from '../../../lib/booking';

const NJ_TAX_RATE = 0.08875;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pickupDate = searchParams.get('pickupDate');
  const returnDate = searchParams.get('returnDate');

  if (!pickupDate || !returnDate) {
    return NextResponse.json({ error: 'pickupDate and returnDate are required.' }, { status: 400 });
  }

  const pickup = new Date(`${pickupDate}T00:00:00Z`);
  const returnDay = new Date(`${returnDate}T00:00:00Z`);

  if (Number.isNaN(pickup.getTime()) || Number.isNaN(returnDay.getTime()) || pickup >= returnDay) {
    return NextResponse.json({ error: 'pickupDate must be before returnDate.' }, { status: 400 });
  }

  // Find vehicle IDs already booked in this window (overlapping active bookings)
  const conflicting = await prisma.booking.findMany({
    where: {
      status: { in: ['PENDING', 'CONFIRMED'] },
      pickupDate: { lt: returnDay },
      returnDate: { gt: pickup },
    },
    select: { vehicleId: true },
  });
  const bookedIds = new Set(conflicting.map((b) => b.vehicleId));

  const vehicles = await prisma.vehicle.findMany({ where: { active: true }, orderBy: { name: 'asc' } });

  const available = vehicles
    .filter((v) => !bookedIds.has(v.id))
    .map((v) => {
      const rentalDays = Math.max(
        1,
        Math.ceil((returnDay.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)),
      );
      // dailyRate and deposit stored in cents; convert to dollars for the response
      const subtotalCents = rentalDays * v.dailyRate;
      const taxCents = Math.round(subtotalCents * NJ_TAX_RATE);
      const totalCents = subtotalCents + taxCents;
      return {
        id: v.id,
        name: v.name,
        type: v.type,
        imageUrl: v.imageUrl,
        dailyRate: v.dailyRate / 100,
        deposit: v.deposit / 100,
        estimate: {
          rentalDays,
          subtotal: subtotalCents / 100,
          tax: taxCents / 100,
          total: totalCents / 100,
          deposit: v.deposit / 100,
        },
      };
    });

  return NextResponse.json({ pickupDate, returnDate, vehicles: available });
}
