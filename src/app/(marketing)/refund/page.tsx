import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy - Invoice-Gen.Net',
  description: 'Review the refund policy for Invoice-Gen.Net. Learn about our 14-day money-back guarantee and subscription guidelines.',
};

export default function RefundPage() {
  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] py-20 px-6 transition-colors duration-200">
      <div className="max-w-3xl mx-auto space-y-10 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
        
        {/* Page Title */}
        <div className="space-y-3 border-b border-zinc-200 dark:border-zinc-850 pb-6 text-center lg:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Refund Policy
          </h1>
          <p className="text-xs text-zinc-450 dark:text-zinc-500">
            Last Updated: June 16, 2026
          </p>
        </div>

        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">1. 14-Day Money-Back Guarantee</h2>
          <p>
            We stand by the quality and utility of our invoicing and client tracking software. If you subscribe to any of our paid plans (Starter, Pro, or Business) and find that the platform does not suit your business workflow, you can request a full refund within <strong>14 calendar days</strong> of your initial purchase date.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">2. Eligibility for Refunds</h2>
          <p>
            To receive a refund under our 14-day guarantee, your account must satisfy the following conditions:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>The refund request is submitted within 14 days of the initial subscription charge.</li>
            <li>Your account has not violated our Acceptable Use Policies (e.g. drafting fraudulent invoices or sending unsolicited spam).</li>
            <li>This is your first time subscribing to a paid tier on Invoice-Gen.Net (subsequent upgrades or re-subscriptions are not eligible).</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">3. Annual Subscriptions</h2>
          <p>
            Annual subscriptions are protected by the same 14-day guarantee. If you cancel after the 14-day window, no prorated refunds will be issued for the remaining months of the cycle. However, your access to paid features will remain active until the end of the 12-month billing period.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">4. Refund Processing</h2>
          <p>
            Approved refunds are credited back to the original credit card or bank account used at checkout via Stripe. Please note that credit card networks and banks typically take 5 to 10 business days to clear the funds and post the transaction back to your account statement.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">5. How to Request a Refund</h2>
          <p>
            To request a refund under these terms, please contact our support team at: <a href="mailto:support@invoice-gen.net" className="underline font-medium hover:text-zinc-900 dark:hover:text-white">support@invoice-gen.net</a>. Please include your account email address and your Stripe transaction number.
          </p>
        </div>

      </div>
    </div>
  );
}
