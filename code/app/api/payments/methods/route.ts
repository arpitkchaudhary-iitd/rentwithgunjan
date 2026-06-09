import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { getSessionFromRequest } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function GET(request: Request) {
  const user = getSessionFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.stripeCustomerId) {
    return NextResponse.json({ paymentMethods: [] });
  }

  const result = await stripe.paymentMethods.list({
    customer: dbUser.stripeCustomerId,
    type: 'card',
  });

  const methods = result.data.map((pm) => ({
    id: pm.id,
    brand: pm.card?.brand ?? 'card',
    last4: pm.card?.last4 ?? '????',
    expMonth: pm.card?.exp_month,
    expYear: pm.card?.exp_year,
  }));

  return NextResponse.json({ paymentMethods: methods });
}

export async function DELETE(request: Request) {
  const user = getSessionFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { paymentMethodId } = await request.json();
  if (!paymentMethodId) return NextResponse.json({ error: 'paymentMethodId required.' }, { status: 400 });

  // Verify the payment method belongs to this customer before detaching
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  if (pm.customer !== dbUser?.stripeCustomerId) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  await stripe.paymentMethods.detach(paymentMethodId);
  return NextResponse.json({ ok: true });
}
