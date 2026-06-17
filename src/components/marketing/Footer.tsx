import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#0A0A0A] py-16 px-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        
        {/* Leftmost Column - Logo & Short description */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-md shadow-sm border border-emerald-500/20">
              <svg
                className="w-5 h-5 text-white drop-shadow-sm"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-black text-lg tracking-tighter text-zinc-950 dark:text-white flex items-center">
              invoice<span className="text-zinc-400 dark:text-zinc-500 mx-[1px]">-</span>gen<span className="text-emerald-600 dark:text-emerald-500">.net</span>
            </span>
          </Link>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
            Professional invoicing, client relationship directory, and payment status ledgers built for freelancers, agencies, consultants, and growing businesses.
          </p>
          <div className="pt-2 text-xs text-zinc-400 flex items-center space-x-1.5">
            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Stripe Verified Partner & Security Encrypted</span>
          </div>
        </div>

        {/* Column 2: Product */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Product</h4>
          <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              <Link href="/features" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Features
              </Link>
            </li>
            <li>
              <Link href="/solutions" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Solutions
              </Link>
            </li>
            <li>
              <Link href="/product-tour" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Product Tour
              </Link>
            </li>
            <li>
              <Link href="/security" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Security & Data
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Pricing Plans
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Company */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Company</h4>
          <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              <Link href="/about" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                About Our Story
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Resources & Legal */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Legal & Help</h4>
          <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              <Link href="/help-center" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Help Center
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/refund" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center space-y-4">
        <p className="text-xs text-zinc-450 dark:text-zinc-500 max-w-2xl mx-auto leading-relaxed">
          All transactions are encrypted and processed by Stripe. We enforce database-level row-level security (RLS) policies to keep client information, invoices, and accounting logs separated and secured.
        </p>
        <p className="text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} invoice-gen.net. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
