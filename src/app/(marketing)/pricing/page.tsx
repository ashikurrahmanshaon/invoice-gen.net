'use client';

import React, { useState } from 'react';
import { Check, HelpCircle, ChevronDown, ChevronUp, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      name: 'Free & Local',
      priceMonthly: 0,
      description: 'Full B2B features running directly on your device. Secure, serverless, and private.',
      features: [
        'Unlimited PDF invoice creation',
        'Upload custom business logos',
        '4 premium designs (Modern, Classic, Creative, Enterprise)',
        'Dynamic accent color selections',
        'Automatic client-side tax & discount calculation',
        'Fully offline functional (no internet required)',
        'Zero tracking cookies or database storage'
      ],
      cta: 'Start Billing Now',
      popular: true
    }
  ];

  const faqs = [
    { q: 'Is this invoice builder really 100% free?', a: 'Yes! There are no limits on invoice generation, template configurations, or PDF downloads. It is completely open-source and free.' },
    { q: 'Where is my invoice data stored?', a: 'Nowhere. All calculations and PDF formatting happen directly inside your web browser on your computer. Your client details, prices, and totals never touch any remote server.' },
    { q: 'Can I use this tool offline?', a: 'Yes. Once the page is loaded, you can disconnect from the internet and keep editing, styling, and generating invoices without interruption.' },
    { q: 'Why is there no login or signup button?', a: 'To protect your privacy and remove all friction. Login-free systems mean your business transactions remain entirely yours and cannot be breached or leaked from a centralized cloud database.' }
  ];

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#060606] py-16 sm:py-24 px-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 text-[10px] font-black uppercase tracking-wider">
            <Sparkles size={11} className="animate-pulse" />
            No Subscriptions
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
            Billing Without the Bill
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Professional invoice generation with zero subscriptions, zero account signups, and maximum privacy. 
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="max-w-md mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="border-2 border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl bg-white dark:bg-[#0B0B0B] p-8 flex flex-col justify-between relative shadow-xl shadow-emerald-500/[0.02]"
            >
              <span className="absolute top-0 right-8 -translate-y-1/2 bg-emerald-500 text-white px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm shadow-emerald-500/20">
                100% Free
              </span>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">{plan.name}</h3>
                  <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1 leading-relaxed">{plan.description}</p>
                </div>
                
                <div className="border-b border-zinc-100 dark:border-zinc-900 pb-5">
                  <span className="text-4xl font-extrabold text-zinc-950 dark:text-white">
                    ${plan.priceMonthly}
                  </span>
                  <span className="text-xs text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider ml-1">/ Month</span>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 uppercase tracking-wide">
                    Free Forever • No Credit Card Required
                  </p>
                </div>

                <ul className="space-y-3.5 text-[13px] text-zinc-600 dark:text-zinc-400 font-medium">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start">
                      <Check size={14} className="mr-3 mt-0.5 text-emerald-500 flex-shrink-0" strokeWidth={3} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link href="/" className="w-full block">
                  <button
                    type="button"
                    className="w-full h-11 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {plan.cta}
                  </button>
                </Link>
              </div>

            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="pt-8 border-t border-zinc-200/60 dark:border-zinc-900">
          <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-8 text-center uppercase tracking-wide">Invoicing Q&A</h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-zinc-200/70 dark:border-zinc-850 bg-white dark:bg-[#0B0B0B] rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4.5 font-bold text-zinc-800 dark:text-zinc-200 text-left text-xs cursor-pointer focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {openFaq === index ? <ChevronUp size={14} className="text-emerald-500" /> : <ChevronDown size={14} className="text-zinc-400" />}
                </button>
                {openFaq === index && (
                  <div className="px-4.5 pb-4.5 text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-900/60 pt-2.5">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security verification notice */}
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-2">
          <Shield size={13} className="text-emerald-500" /> Client-side sandbox verified. Your private billing records are never leaked.
        </p>

      </div>
    </div>
  );
}
