import { NextResponse } from 'next/server';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { sessionId } = await request.json();

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const email = session.customer_details['email'];
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  const expirationDate = new Date(subscription.current_period_end * 1000);
  const tier = session.metadata.tier;
  const subscriptionId = session.subscription;

  const data = { email, tier, expirationDate, subscriptionId };

  return NextResponse.json({ data });
}
