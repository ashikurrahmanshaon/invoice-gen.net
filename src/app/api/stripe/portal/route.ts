'use strict';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { dbService } from '@/services/db';

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
      apiVersion: '2025-01-27.academics' as any,
    });

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    // Retrieve customer ID from database
    const profile = await dbService.getProfile(userId);
    const customerId = profile?.stripe_customer_id;

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'No Stripe Customer ID exists for this user profile.' },
        { status: 400 }
      );
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/settings`,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (err: any) {
    console.error('Stripe Portal Route Error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
