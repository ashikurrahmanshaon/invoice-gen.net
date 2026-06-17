import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Invoice-Gen.Net',
  description: 'Read the terms of service for Invoice-Gen.Net. Review software licensing rules, account limits, and dispute guidelines.',
};

export default function TermsPage() {
  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] py-20 px-6 transition-colors duration-200">
      <div className="max-w-3xl mx-auto space-y-10 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
        
        {/* Page Title */}
        <div className="space-y-3 border-b border-zinc-200 dark:border-zinc-850 pb-6 text-center lg:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-xs text-zinc-450 dark:text-zinc-500">
            Last Updated: June 16, 2026
          </p>
        </div>

        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">1. Agreement to Terms</h2>
          <p>
            By accessing or using the website, workspace, and services hosted at Invoice-Gen.Net, you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company, agency, or corporation, you warrant that you have the legal authority to bind that entity to these conditions.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">2. Account Registration & Security</h2>
          <p>
            To utilize the platform, you must create a verified account. You agree to provide accurate registration details and maintain the security of your credentials. You are entirely responsible for all actions, billing events, and database alterations logged under your workspace account.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">3. Acceptable Use Policies</h2>
          <p>
            You agree to use the workspace services solely for legitimate business billing, client management, and payment logging. You may not:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Generate fraudulent invoice files or mock receipts to commit financial deception.</li>
            <li>Use the mailing dispatch servers to transmit unsolicited spam or phishing emails.</li>
            <li>Attempt to bypass database security filters or execute SQL injection attacks against database tables.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">4. Billing Cycles & Subscription Plans</h2>
          <p>
            Certain features of Invoice-Gen.Net are paid via Starter, Pro, or Business subscriptions. Payments are billed on a recurring monthly or annual basis via Stripe. Subscription upgrades apply immediately, while downgrades or cancellations take effect at the end of the active billing cycle.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">5. Limitation of Liability</h2>
          <p>
            Invoice-Gen.Net is provided on an "as-is" and "as-available" basis. In no event shall we be liable for any indirect, incidental, or consequential damages resulting from database downtime, lost revenues, unpaid invoices, or audit errors. You retain sole responsibility for verifying tax calculations and financial logs.
          </p>
        </div>

        {/* Section 6 */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">6. Termination of Service</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate our acceptable use guidelines. You may terminate your account at any time by cancelling your active subscription and deleting your directory records from the settings dashboard.
          </p>
        </div>

        {/* Contact info */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-850">
          <p className="text-zinc-500">
            For questions regarding legal terms or dispute resolution, please contact us at: <a href="mailto:legal@invoice-gen.net" className="underline font-medium hover:text-zinc-900 dark:hover:text-white">legal@invoice-gen.net</a>.
          </p>
        </div>

      </div>
    </div>
  );
}
