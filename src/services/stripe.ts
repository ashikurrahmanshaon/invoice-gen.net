'use strict';

import { loadStripe } from '@stripe/stripe-js';
import { dbService } from './db';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
export const isStripeConfigured = !!publishableKey;

export const stripeService = {
  async upgradeToPremium(userId: string): Promise<boolean> {
    if (isStripeConfigured) {
      try {
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const session = await response.json();
        
        if (session.url) {
          window.location.href = session.url;
          return true;
        } else if (session.sessionId) {
          const stripeClient = await loadStripe(publishableKey!);
          if (stripeClient) {
            await (stripeClient as any).redirectToCheckout({ sessionId: session.sessionId });
            return true;
          }
        }
        throw new Error('Stripe Session Redirect failed.');
      } catch (err) {
        console.error('Stripe Redirect Error:', err);
        return false;
      }
    } else {
      // Mock Stripe checkout
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulating checkout redirect
      
      // Update local storage profile to premium
      await dbService.updateProfile(userId, { is_premium: true });
      return true;
    }
  },

  async manageSubscription(userId: string): Promise<boolean> {
    if (isStripeConfigured) {
      try {
        const response = await fetch('/api/stripe/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const portal = await response.json();
        if (portal.url) {
          window.location.href = portal.url;
          return true;
        }
        throw new Error('Customer Portal Redirect failed.');
      } catch (err) {
        console.error('Customer Portal Error:', err);
        return false;
      }
    } else {
      // Mock downgrade to demonstrate toggling states
      await new Promise((resolve) => setTimeout(resolve, 800));
      await dbService.updateProfile(userId, { is_premium: false });
      return true;
    }
  }
};
