import React from 'react';
import { Metadata } from 'next';
import { Check, CheckCircle2, User, Building2, Briefcase, Store } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Solutions - Invoice-Gen.Net',
  description: 'Tailored billing and invoicing solutions for solo professionals, consulting agencies, contractors, and growing small businesses.',
};

export default function SolutionsPage() {
  const solutions = [
    {
      id: 'solo-professionals',
      title: 'For Solo Professionals',
      icon: User,
      subtitle: 'Fast billing, instant exports, and zero subscription bloat.',
      problem: 'Solo professionals lose billable hours wrestling with complicated double-entry ledger setups or paying high monthly fees just to print a few PDF invoices.',
      solution: 'Invoice-Gen.Net provides a clean, web-based creator. Store client details once, punch in your hours, calculate discounts, and export beautiful PDF documents instantly.',
      highlights: [
        'Free tier includes up to 5 invoices and 3 client records every month.',
        'Instantly export print-ready PDFs without browser headers or margins.',
        'Fully database-backed record keeping, allowing client auto-completion.'
      ],
      cta: 'Start Invoicing Free'
    },
    {
      id: 'agencies',
      title: 'For Agencies',
      icon: Building2,
      subtitle: 'Client directories, multiple active projects, and transaction history.',
      problem: 'Agencies manage multiple active contractors, recurring retainers, and complex accounts, making spreadsheet-based tracking prone to audit and payment errors.',
      solution: 'Our multi-client directories and payment ledger consolidate invoice tracking in one safe dashboard. Monitor who has paid and follow up on overdue statements with confidence.',
      highlights: [
        'Centralized Client Directory stores addresses, emails, and tax identifiers.',
        'Payment status timeline logs (Draft, Sent, Overdue, Paid) for all invoices.',
        'Clean revenue analytics to monitor collection speeds and outstanding balances.'
      ],
      cta: 'Scale Your Agency Billing'
    },
    {
      id: 'consultants',
      title: 'For Consultants',
      icon: Briefcase,
      subtitle: 'Professional B2B document layouts, hourly billing, and compliance.',
      problem: 'Consultants require clean, compliant, and branded billing documents that project corporate-level trust to procurement managers and financial departments.',
      solution: 'Invoice-Gen.Net delivers structured invoices that satisfy corporate accounting standards, offering neat sections for detailed hour logs, taxes, and payment conditions.',
      highlights: [
        'Minimalist, monochrome layout system structured to look handcrafted.',
        'Includes tax rate, volume discount, and custom transaction terms inputs.',
        'Protected by database-level Row-Level Security to secure client confidentiality.'
      ],
      cta: 'Create Compliant Invoices'
    },
    {
      id: 'small-businesses',
      title: 'For Small Businesses',
      icon: Store,
      subtitle: 'Reception logs, transaction records, and tax-ready PDF directories.',
      problem: 'Small business owners waste days every tax season searching for scattered invoice documents, unpaid bills, and miscellaneous client email chains.',
      solution: 'Our workspace acts as a centralized vault for your invoicing. Export full billing timelines and sort history chronologically, making quarterly audits simple.',
      highlights: [
        'Duplicate previous invoices with a single click to save setup times.',
        'Stripe Checkout integration to collect client payments securely online.',
        'Download clean transactional sheets containing all historical records.'
      ],
      cta: 'Manage Business Receivables'
    }
  ];

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] py-20 px-6 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-white">
            Tailored Billing Solutions
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Every business has unique operational needs. Explore how Invoice-Gen.Net provides the exact structure required to keep your billing clean and on track.
          </p>
        </div>

        {/* Solutions List */}
        <div className="space-y-12">
          {solutions.map((sol, index) => (
            <div
              key={sol.id}
              id={sol.id}
              className="group flex flex-col items-center text-center border border-zinc-200/60 dark:border-zinc-800/60 p-8 sm:p-14 rounded-3xl bg-white/50 dark:bg-[#0A0A0A]/50 hover:bg-white dark:hover:bg-zinc-900/50 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/30 transition-all duration-500 transform hover:-translate-y-2 scroll-mt-32 relative overflow-hidden"
            >
              <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-gradient-to-br from-emerald-400/20 via-emerald-400/5 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-150 group-hover:translate-x-4 group-hover:-translate-y-4 pointer-events-none"></div>
              </div>
              
              {/* Massive Iconic Header */}
              <div className="h-20 w-20 mb-8 rounded-3xl bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/40 dark:to-emerald-800/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 shadow-md shadow-emerald-500/5 transition-all duration-500 transform group-hover:-translate-y-2 group-hover:scale-110 relative z-10">
                <sol.icon size={32} strokeWidth={2} />
              </div>
              
              <div className="space-y-4 max-w-2xl mb-14 relative z-10">
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest inline-block">Solution {index + 1}</span>
                <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">{sol.title}</h2>
                <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400 pt-2">{sol.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl text-left w-full mb-14 relative z-10">
                  <div className="space-y-4 bg-zinc-50/80 dark:bg-zinc-900/40 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 group-hover:bg-white dark:group-hover:bg-zinc-900/80 transition-colors duration-300">
                    <h4 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-zinc-300 mr-2"></div> The Operational Challenge</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">{sol.problem}</p>
                  </div>
                  <div className="space-y-4 bg-emerald-50/50 dark:bg-emerald-900/10 p-8 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors duration-300">
                    <h4 className="text-[11px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div> How Invoice-Gen.Net Resolves It</h4>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">{sol.solution}</p>
                  </div>
              </div>

              <div className="border-t border-zinc-200/60 dark:border-zinc-800/60 pt-10 w-full max-w-5xl flex flex-col items-center relative z-10">
                <h4 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-8">Solution Highlights</h4>
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mb-10 w-full text-left">
                  {sol.highlights.map((h, i) => (
                    <li key={i} className="flex items-start text-[13px] font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      <CheckCircle2 size={18} className="mr-3 mt-0.5 text-emerald-500 flex-shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login?signup=true">
                  <Button className="h-12 px-10 text-sm font-bold shadow-lg shadow-emerald-500/20 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl transition-all duration-300 group-hover:-translate-y-1 hover:shadow-emerald-500/40">
                    {sol.cta}
                  </Button>
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
