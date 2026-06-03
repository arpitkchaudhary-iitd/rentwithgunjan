import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { prisma } from '../../../../lib/prisma';
import { sendMail } from '../../../../lib/mail';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST(request: Request) {
  const body = await request.text();
  const sig = headers().get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) return NextResponse.json({ ok: true });

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
      include: { user: true, vehicle: true },
    });

    await prisma.payment.create({
      data: {
        bookingId,
        provider: 'stripe',
        status: 'paid',
        amount: session.amount_total ?? booking.total + booking.deposit,
        currency: session.currency ?? 'usd',
        stripeSessionId: session.id,
      },
    });

    // Send confirmation email
    const pickup = booking.pickupDate.toISOString().slice(0, 10);
    const returnDay = booking.returnDate.toISOString().slice(0, 10);
    await sendMail({
      to: booking.user.email,
      subject: `Booking confirmed — ${booking.vehicle.name}`,
      html: `
        <h2>Your booking is confirmed!</h2>
        <p>Hi ${booking.user.name || booking.user.email},</p>
        <p><strong>Vehicle:</strong> ${booking.vehicle.name} (${booking.vehicle.type})</p>
        <p><strong>Pickup:</strong> ${pickup}</p>
        <p><strong>Return:</strong> ${returnDay}</p>
        <p><strong>Booking ID:</strong> ${booking.id}</p>
        <p>Thank you for renting with Gunjan!</p>
      `,
    });
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent;
    const sessionList = await stripe.checkout.sessions.list({ payment_intent: intent.id });
    const bookingId = sessionList.data[0]?.metadata?.bookingId;
    if (bookingId) {
      await prisma.booking.update({ where: { id: bookingId }, data: { status: 'CANCELED' } });
    }
  }

  return NextResponse.json({ ok: true });
}
