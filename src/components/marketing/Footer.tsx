import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200/55 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#080808] py-8 px-6 transition-colors duration-200 no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left text-sm text-zinc-500">
        
        {/* Logo and short description */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center border border-emerald-500/10">
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-extrabold text-sm tracking-tighter text-zinc-950 dark:text-white flex items-center">
              invoice<span className="text-zinc-400 dark:text-zinc-650 mx-[1px]">-</span>gen<span className="text-emerald-600 dark:text-emerald-500">.net</span>
            </span>
          </Link>
          <span className="hidden md:inline text-zinc-300 dark:text-zinc-800">|</span>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-sm">
            Secure client-side editor. No databases, no tracking. Data never leaves your device.
          </p>
        </div>

        {/* Right side - copyright and link */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-zinc-400 dark:text-zinc-500">
          <span>Stripe verified invoice format</span>
          <span className="hidden sm:inline text-zinc-300 dark:text-zinc-800">•</span>
          <span>&copy; {new Date().getFullYear()} invoice-gen.net. All rights reserved.</span>
        </div>

      </div>
    </footer>
  );
}
