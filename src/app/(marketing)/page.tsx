'use client';

import React from 'react';
import { FreeInvoiceBuilder } from '@/components/invoice/FreeInvoiceBuilder';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#060606] text-zinc-900 dark:text-zinc-150 font-sans selection:bg-emerald-255 dark:selection:bg-emerald-800 transition-colors duration-250 relative overflow-hidden py-4 sm:py-8 lg:py-12">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[500px] rounded-full bg-emerald-400/10 dark:bg-emerald-500/10 blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[500px] rounded-full bg-blue-400/10 dark:bg-blue-500/10 blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[300px] rounded-full bg-violet-400/5 dark:bg-violet-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* EDITOR CARD WRAPPER */}
      <main id="editor" className="max-w-[1500px] mx-auto px-3 sm:px-6 relative z-10">
        <div className="bg-white/80 dark:bg-[#0B0B0B]/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-black/40 border border-zinc-200/60 dark:border-zinc-800/80 overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 dark:via-emerald-500/20 to-transparent" />
          <FreeInvoiceBuilder />
        </div>
      </main>
    </div>
  );
}

