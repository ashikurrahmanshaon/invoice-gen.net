'use client';

import React from 'react';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import { FreeInvoiceBuilder } from '@/components/invoice/FreeInvoiceBuilder';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#060606] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-emerald-250 flex flex-col transition-colors duration-250">
      <Navbar />
      <main className="flex-grow flex items-start justify-center py-6 sm:py-10 px-3 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-emerald-450/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-blue-450/5 blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-[1080px] bg-white dark:bg-[#0B0B0B] rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-zinc-200/50 dark:border-zinc-900 overflow-hidden relative z-10 transition-all duration-300">
          {/* Subtle top edge glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />
          
          <FreeInvoiceBuilder />
        </div>
      </main>
      <Footer />
    </div>
  );
}
