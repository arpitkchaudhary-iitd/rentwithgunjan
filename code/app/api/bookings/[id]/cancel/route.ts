import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { getSessionFromRequest } from '../../../../../lib/auth';
import { getRefundTier } from '../../../../../lib/cancellation.config';
import { prisma } from '../../../../../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = getSessionFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { payment: true },
  });

  if (!booking || booking.userId !== user.id) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  }

  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
    return NextResponse.json({ error: 'This booking cannot be cancelled.' }, { status: 400 });
  }

  const now = new Date();
  const pickupDate = new Date(booking.pickupDate);
  const daysUntilPickup = Math.floor(
    (pickupDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntilPickup < 0) {
    return NextResponse.json(
      { error: 'Cannot cancel after the pickup date has passed.' },
      { status: 400 },
    );
  }

  const tier = getRefundTier(daysUntilPickup);
  let refundedCents = 0;
  let stripeRefundId: string | null = null;

  // Issue Stripe refund only for CONFIRMED (paid) bookings
  if (
    booking.status === 'CONFIRMED' &&
    booking.payment?.stripeSessionId &&
    tier.refundPercent > 0
  ) {
    try {
      const session = await stripe.checkout.sessions.retrieve(
        booking.payment.stripeSessionId,
      );
      if (session.payment_intent) {
        refundedCents = Math.round((booking.total * tier.refundPercent) / 100);
        const refund = await stripe.refunds.create({
          payment_intent: session.payment_intent as string,
          amount: refundedCents,
        });
        stripeRefundId = refund.id;
      }
    } catch (err) {
      console.error('Stripe refund error:', err);
      return NextResponse.json(
        { error: 'Unable to process the refund. Please contact support.' },
        { status: 500 },
      );
    }
  }

  await prisma.booking.update({
    where: { id: params.id },
    data: { status: 'CANCELED' },
  });

  return NextResponse.json({
    ok: true,
    daysUntilPickup,
    refundPercent: tier.refundPercent,
    refundLabel: tier.label,
    refundedCents,
    refundedDollars: (refundedCents / 100).toFixed(2),
    stripeRefundId,
  });
}
