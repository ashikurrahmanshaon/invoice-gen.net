import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200/60 dark:border-zinc-900 bg-[#FAFAFA] dark:bg-[#070707] py-12 px-6 transition-colors duration-200 no-print">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
        
        {/* Left Column - Logo & Short description */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center border border-emerald-500/10">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-extrabold text-base tracking-tighter text-zinc-950 dark:text-white flex items-center">
              invoice<span className="text-zinc-400 dark:text-zinc-650 mx-[1px]">-</span>gen<span className="text-emerald-600 dark:text-emerald-500">.net</span>
            </span>
          </Link>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
            Professional B2B invoice formatting, client directories, and cost ledgers running entirely client-side. No signup, no database, no logs.
          </p>
          <div className="pt-2 text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center space-x-1.5 font-medium">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Stripe-verified formatting & local client processing</span>
          </div>
        </div>

        {/* Column 2: Product */}
        <div className="space-y-3.5">
          <h4 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">Product</h4>
          <ul className="space-y-2.5 text-xs text-zinc-500 dark:text-zinc-400 font-bold">
            <li><Link href="/features" className="hover:text-emerald-550 dark:hover:text-emerald-450 transition-colors">Features</Link></li>
            <li><Link href="/solutions" className="hover:text-emerald-550 dark:hover:text-emerald-450 transition-colors">Solutions</Link></li>
            <li><Link href="/product-tour" className="hover:text-emerald-550 dark:hover:text-emerald-450 transition-colors">Product Tour</Link></li>
            <li><Link href="/security" className="hover:text-emerald-550 dark:hover:text-emerald-450 transition-colors">Security</Link></li>
            <li><Link href="/pricing" className="hover:text-emerald-550 dark:hover:text-emerald-450 transition-colors">Pricing Info</Link></li>
          </ul>
        </div>

        {/* Column 3: Company */}
        <div className="space-y-3.5">
          <h4 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">Company</h4>
          <ul className="space-y-2.5 text-xs text-zinc-500 dark:text-zinc-400 font-bold">
            <li><Link href="/about" className="hover:text-emerald-550 dark:hover:text-emerald-450 transition-colors">About Story</Link></li>
            <li><Link href="/contact" className="hover:text-emerald-550 dark:hover:text-emerald-450 transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        {/* Column 4: Legal & Help */}
        <div className="space-y-3.5">
          <h4 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">Legal & Help</h4>
          <ul className="space-y-2.5 text-xs text-zinc-500 dark:text-zinc-400 font-bold">
            <li><Link href="/help-center" className="hover:text-emerald-550 dark:hover:text-emerald-450 transition-colors">Help Center</Link></li>
            <li><Link href="/privacy" className="hover:text-emerald-550 dark:hover:text-emerald-450 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-emerald-550 dark:hover:text-emerald-450 transition-colors">Terms of Service</Link></li>
            <li><Link href="/refund" className="hover:text-emerald-550 dark:hover:text-emerald-450 transition-colors">Refund Policy</Link></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-zinc-200/60 dark:border-zinc-900 text-center md:flex md:items-center md:justify-between space-y-4 md:space-y-0 text-xs text-zinc-400 dark:text-zinc-500">
        <p className="max-w-xl md:text-left leading-relaxed">
          This site is not affiliated with Stripe Inc. All calculations are run locally and document generation is performed within your active browser session.
        </p>
        <p className="font-semibold">
          &copy; {new Date().getFullYear()} invoice-gen.net. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
