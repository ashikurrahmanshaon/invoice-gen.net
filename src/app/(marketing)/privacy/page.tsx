import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Invoice-Gen.Net',
  description: 'Review the privacy policy for Invoice-Gen.Nettik Learn about data isolation, RLS rules, and transaction data processing via Stripe.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] py-20 px-6 transition-colors duration-200">
      <div className="max-w-3xl mx-auto space-y-10 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
        
        {/* Page Title */}
        <div className="space-y-3 border-b border-zinc-200 dark:border-zinc-850 pb-6 text-center lg:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-xs text-zinc-450 dark:text-zinc-500">
            Last Updated: June 16, 2026
          </p>
        </div>

        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">1. Information We Collect</h2>
          <p>
            Invoice-Gen.Net collects only the information necessary to provide and secure our invoicing, client ledger, and transaction record services.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Account Credentials:</strong> Name, business name, and email address collected during account creation via Supabase Auth.
            </li>
            <li>
              <strong>Workspace & Invoicing Data:</strong> Client contact cards, client billing addresses, hourly rates, taxes, discounts, and historical ledger entries.
            </li>
            <li>
              <strong>Technical Logs:</strong> Device type, IP addresses, browser version, and session data processed for cybersecurity monitoring and service performance.
            </li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">2. How We Secure and Isolate Data</h2>
          <p>
            We take data isolation seriously. We enforce database-level PostgreSQL Row-Level Security (RLS) policies. Every query sent to our databases is automatically checked for session authorization, ensuring that one business owner can never query or view another user's invoice ledger or client database under any circumstances.
          </p>
          <p>
            Data is encrypted in transit using TLS 1.3 and at rest using AES-256 standard encryption algorithms.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">3. Third-Party Services and Payments</h2>
          <p>
            We partner with Stripe Inc. for online credit card and ACH payment processing. When you upgrade your account or use checkout options, your billing credentials, card numbers, and bank account pins are processed directly by Stripe. Invoice-Gen.Net never accesses, processes, or stores your raw financial security keys.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">4. Data Ownership & Portability</h2>
          <p>
            You retain 100% ownership of all business registers, client contact catalogs, and billing ledgers compiled in your workspace. You have the right to download your entire directory database in standard JSON or CSV formats at any time. We do not charge fees or place artificial barriers on data exports.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">5. GDPR & Compliance Disclosures</h2>
          <p>
            For users residing in the European Economic Area (EEA), we act as both data controller for account metrics and data processor for client records. You retain the right to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Request access to your stored files.</li>
            <li>Correct any inaccurate contact sheets.</li>
            <li>Request deletion of your entire account directory ("Right to be Forgotten").</li>
          </ul>
        </div>

        {/* Section 6 */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">6. Changes to This Policy</h2>
          <p>
            We may update this privacy statement as our software features expand. Active users will be notified of major policy adjustments via email or visible announcement indicators inside the workspace.
          </p>
        </div>

        {/* Contact info */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-850">
          <p className="text-zinc-500">
            For questions regarding our privacy architecture or encryption standards, please contact us at: <a href="mailto:privacy@invoice-gen.net" className="underline font-medium hover:text-zinc-900 dark:hover:text-white">privacy@invoice-gen.net</a>.
          </p>
        </div>

      </div>
    </div>
  );
}
