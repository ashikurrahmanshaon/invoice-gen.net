'use client';

import React from 'react';
import { FreeInvoiceBuilder } from '@/components/invoice/FreeInvoiceBuilder';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 py-12 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-10 no-print">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-4">
            Free Invoice Generator
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            Create professional invoices in seconds. Completely free, no sign-up required.
          </p>
        </div>
        
        <div className="relative rounded-[2.5rem] p-1 overflow-hidden">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 via-emerald-500/0 to-emerald-500/30 blur-sm pointer-events-none"></div>
          
          <FreeInvoiceBuilder />
        </div>
      </div>
    </div>
  );
}
