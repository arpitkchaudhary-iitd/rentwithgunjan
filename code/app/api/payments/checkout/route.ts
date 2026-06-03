import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { getSessionFromRequest } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3001';

export async function POST(request: Request) {
  const user = getSessionFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { bookingId } = await request.json();
    if (!bookingId) return NextResponse.json({ error: 'bookingId is required.' }, { status: 400 });

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId, userId: user.id },
      include: { vehicle: true },
    });
    if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    if (booking.status !== 'PENDING') {
      return NextResponse.json({ error: 'Booking is not in a payable state.' }, { status: 409 });
    }

    const pickup = booking.pickupDate.toISOString().slice(0, 10);
    const returnDay = booking.returnDate.toISOString().slice(0, 10);
    const rentalDays = Math.max(
      1,
      Math.ceil((booking.returnDate.getTime() - booking.pickupDate.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${booking.vehicle.name} — ${rentalDays}-day rental`,
              description: `Pickup ${pickup} · Return ${returnDay} · Includes NJ sales tax`,
              images: booking.vehicle.imageUrl
                ? [`${BASE_URL}${booking.vehicle.imageUrl}`]
                : [],
            },
            unit_amount: booking.subtotal + booking.tax,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Security deposit (fully refundable)',
              description: 'Returned within 5 business days after vehicle is returned in good condition.',
            },
            unit_amount: booking.deposit,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        // Shows "RENTWITHGUNJAN" on customer bank statements
        statement_descriptor_suffix: 'RENTWITHGUNJAN',
        metadata: { bookingId: booking.id },
      },
      metadata: { bookingId: booking.id },
      success_url: `${BASE_URL}/booking/success?bookingId=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/booking`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[checkout]', err);
    return NextResponse.json({ error: 'Unable to create checkout session.' }, { status: 500 });
  }
}
