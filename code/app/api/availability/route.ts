import { NextResponse } from 'next/server';

import { getAvailableVehicles } from '../../../lib/booking';

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

  return NextResponse.json({
    pickupDate,
    returnDate,
    vehicles: getAvailableVehicles(pickupDate, returnDate),
  });
}
