import { NextResponse } from 'next/server';

import { SAMPLE_VEHICLES } from '../../../lib/booking';

export async function GET() {
  return NextResponse.json({ vehicles: SAMPLE_VEHICLES });
}
