'use strict';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, info: 'Stripe API secret key is missing. Mock billing mode active.' },
        { status: 200 }
      );
    }

    const stripe = new Stripe(apiKey, {
      apiVersion: '2025-01-27.academics' as any, // fallback or direct api version
    });

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'invoice-gen.net - Premium Subscription',
              description: 'Unlimited invoices, AI features, payment logs, and detailed revenue analytics.',
            },
            unit_amount: 1500, // $15.00
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?checkout_session=success`,
      cancel_url: `${origin}/settings?checkout_session=cancel`,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('Stripe Checkout Route Error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
