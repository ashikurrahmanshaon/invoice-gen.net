'use client';

import React from 'react';
import { FreeInvoiceBuilder } from '@/components/invoice/FreeInvoiceBuilder';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#060606] text-zinc-900 dark:text-zinc-150 font-sans selection:bg-emerald-255 dark:selection:bg-emerald-800 transition-colors duration-250 relative overflow-hidden py-4 sm:py-8">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-0 left-1/4 w-[40%] h-[350px] rounded-full bg-emerald-450/5 dark:bg-emerald-500/5 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[35%] h-[350px] rounded-full bg-blue-450/5 dark:bg-blue-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* EDITOR CARD WRAPPER */}
      <main id="editor" className="max-w-[1080px] mx-auto px-3 sm:px-6 relative z-10">
        <div className="bg-white dark:bg-[#0B0B0B] rounded-2xl shadow-[0_8px_40px_-15px_rgba(0,0,0,0.03)] dark:shadow-black/20 border border-zinc-200/60 dark:border-zinc-900 overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          <FreeInvoiceBuilder />
        </div>
      </main>
    </div>
  );
}
