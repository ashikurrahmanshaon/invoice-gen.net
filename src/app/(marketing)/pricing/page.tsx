'use client';

import React, { useState } from 'react';
import { Check, HelpCircle, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      name: 'Free',
      priceMonthly: 0,
      priceAnnual: 0,
      description: 'Essential billing tools for side gigs and validation.',
      features: [
        'Up to 5 invoices per month',
        'Up to 3 client records',
        'Standard PDF exports',
        'Single user access'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Starter',
      priceMonthly: 12,
      priceAnnual: 9,
      description: 'Structured workspace for single operators and contractors.',
      features: [
        'Up to 30 invoices per month',
        'Unlimited client records',
        'Standard PDF exports',
        'Full ledger history logs',
        'Basic accounting summaries'
      ],
      cta: 'Choose Starter',
      popular: false
    },
    {
      name: 'Pro',
      priceMonthly: 24,
      priceAnnual: 19,
      description: 'Complete invoicing and receipt ledger suite for growing firms.',
      features: [
        'Unlimited invoices',
        'Unlimited client records',
        'Vector-clean PDF exports',
        'AI Invoice Assistant integration',
        'Stripe Checkout payments integration',
        'Dedicated client support queue'
      ],
      cta: 'Choose Pro',
      popular: true
    },
    {
      name: 'Business',
      priceMonthly: 49,
      priceAnnual: 39,
      description: 'Dedicated multi-seat portal for teams and agencies.',
      features: [
        'Unlimited invoices & clients',
        'Up to 5 team member seats',
        'Advanced financial summaries',
        'Custom domain branding exports',
        'Dedicated account representative',
        'Custom API access'
      ],
      cta: 'Choose Business',
      popular: false
    }
  ];

  const comparisonFeatures = [
    { name: 'Monthly Invoices Included', free: '5', starter: '30', pro: 'Unlimited', business: 'Unlimited' },
    { name: 'Client Records', free: '3', starter: 'Unlimited', pro: 'Unlimited', business: 'Unlimited' },
    { name: 'PDF Exports', free: 'Standard', starter: 'Standard', pro: 'Vector-Clean', business: 'Vector-Clean' },
    { name: 'Ledger Audit History', free: 'No', starter: 'Yes', pro: 'Yes', business: 'Yes' },
    { name: 'AI Invoice Assistant', free: 'No', starter: 'No', pro: 'Yes', business: 'Yes' },
    { name: 'Stripe Online Payments', free: 'No', starter: 'No', pro: 'Yes', business: 'Yes' },
    { name: 'Team Member Seats', free: '1', starter: '1', pro: '1', business: 'Up to 5' },
    { name: 'Custom Branding', free: 'No', starter: 'No', pro: 'No', business: 'Yes' },
    { name: 'Support SLA', free: 'Community', starter: 'Standard', pro: '24h Queue', business: 'Dedicated rep' }
  ];

  const faqs = [
    { q: 'How does the Free plan work?', a: 'The free plan includes 5 invoice generations and 3 client directory slots per month. There is no credit card required to register and you can stay on this tier indefinitely.' },
    { q: 'Are payments secure?', a: 'Yes. We process all transaction and checkout billing data via Stripe. We do not store raw credit card credentials on our servers.' },
    { q: 'Can I export my directory details?', a: 'Absolutely. You retain complete ownership of your invoicing history, ledger accounts, and customer lists. You can download them in standard CSV/JSON format at any time.' },
    { q: 'Can I cancel or change plans anytime?', a: 'Yes. You can upgrade, downgrade, or cancel your active subscription directly inside your settings panel. Changes will apply at the start of your next billing cycle.' },
    { q: 'Is there a limit on PDF downloads?', a: 'No. There are no restrictions on printing or exporting PDF receipts for any active invoice generated on your account.' }
  ];

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] py-20 px-6 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Transparent Pricing
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Choose a plan structured for your business scale. No hidden fees, no artificial urgency, and zero configuration setup fees.
          </p>
          
          {/* Billing Toggle */}
          <div className="pt-2 flex items-center justify-center space-x-3 text-xs font-semibold">
            <span className={!isAnnual ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}>Billed Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`w-12 h-6 rounded-full p-1 flex items-center transition-all duration-300 cursor-pointer shadow-inner ${isAnnual ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-zinc-200 dark:bg-zinc-800'}`}
              aria-label="Toggle bill cycle"
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isAnnual ? 'translate-x-6' : 'translate-x-0 dark:bg-zinc-300'}`} />
            </button>
            <span className={`flex items-center space-x-1.5 ${isAnnual ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
              <span>Billed Annually</span>
              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 px-1.5 py-0.5 rounded text-[9px] font-bold shadow-sm shadow-emerald-500/10">Save ~25%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`border rounded-xl bg-white dark:bg-[#0A0A0A] p-6 flex flex-col justify-between relative hover:border-zinc-350 dark:hover:border-zinc-700 transition-colors duration-250 ${
                plan.popular
                  ? 'border-2 border-zinc-950 dark:border-white shadow-md'
                  : 'border-zinc-200 dark:border-zinc-850'
              }`}
            >
              {plan.popular && (
                <span className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-500 text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm shadow-emerald-500/20">
                  Popular Choice
                </span>
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">{plan.name}</h3>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{plan.description}</p>
                </div>
                
                <div className="border-b border-zinc-100 dark:border-zinc-900 pb-4">
                  <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                    ${isAnnual ? plan.priceAnnual : plan.priceMonthly}
                  </span>
                  <span className="text-xs text-zinc-450 dark:text-zinc-500 font-medium">/mo</span>
                  <p className="text-[9px] text-zinc-400 mt-1">
                    {plan.priceMonthly === 0 ? 'Free forever' : isAnnual ? `Billed $${plan.priceAnnual * 12} annually` : 'Cancel anytime'}
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start">
                      <Check size={12} className="mr-2 mt-0.5 text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <Link href={plan.priceMonthly === 0 ? '/login?signup=true' : `/login?signup=true&plan=${plan.name.toLowerCase()}&cycle=${isAnnual ? 'annual' : 'monthly'}`} className="w-full">
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    className={`w-full h-9 text-xs font-semibold shadow-sm ${!plan.popular ? 'bg-white dark:bg-zinc-900' : ''}`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>

            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="pt-12 border-t border-zinc-200 dark:border-zinc-850">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 text-center">Feature Matrix</h2>
          <div className="border border-zinc-200 dark:border-zinc-850 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[600px]">
                <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-850 text-zinc-500 dark:text-zinc-400 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Capability</th>
                    <th className="px-6 py-4 text-center">Free</th>
                    <th className="px-6 py-4 text-center">Starter</th>
                    <th className="px-6 py-4 text-center">Pro</th>
                    <th className="px-6 py-4 text-center">Business</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850 text-zinc-700 dark:text-zinc-300">
                  {comparisonFeatures.map((row) => (
                    <tr key={row.name} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                      <td className="px-6 py-3.5 font-medium text-zinc-900 dark:text-white">{row.name}</td>
                      <td className="px-6 py-3.5 text-center">{row.free}</td>
                      <td className="px-6 py-3.5 text-center">{row.starter}</td>
                      <td className="px-6 py-3.5 text-center font-semibold">{row.pro}</td>
                      <td className="px-6 py-3.5 text-center">{row.business}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="pt-12 border-t border-zinc-200 dark:border-zinc-850">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-8 text-center">Pricing & Billing Q&A</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 rounded-lg">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4.5 font-semibold text-zinc-800 dark:text-white text-left text-xs cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openFaq === index && (
                  <div className="px-4.5 pb-4.5 text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-900 pt-2.5">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security verification notice */}
        <p className="text-center text-xs text-zinc-450 dark:text-zinc-500 flex items-center justify-center gap-2">
          <Lock size={14} /> Payments are processed securely via Stripe. Your financial credentials are never accessed or stored.
        </p>

      </div>
    </div>
  );
}
