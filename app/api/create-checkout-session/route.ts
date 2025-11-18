import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-10-29.clover',
  });
  try {
    const { plan } = await request.json();

    const prices = {
      pro: {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Flowtusk Pro',
            description: 'Unlimited ICP analyses and premium features',
          },
          unit_amount: 2900, // $29.00
          recurring: { interval: 'month' as const },
        },
        quantity: 1,
      },
      lifetime: {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Flowtusk Lifetime Deal',
            description: 'Lifetime access to all Pro features',
          },
          unit_amount: 29000, // $290.00
        },
        quantity: 1,
      },
    };

    const lineItems = plan === 'lifetime' 
      ? [prices.lifetime] 
      : [prices.pro];

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: plan === 'lifetime' ? 'payment' : 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?plan=${plan}`,
      metadata: {
        plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

