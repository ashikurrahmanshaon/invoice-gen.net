'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically load the heavy invoice builder to massively speed up initial page load (Lighthouse score boost)
const FreeInvoiceBuilder = dynamic(
  () => import('@/components/invoice/FreeInvoiceBuilder').then(mod => mod.FreeInvoiceBuilder),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-[600px] flex flex-col items-center justify-center bg-white rounded-[1.5rem] border border-zinc-200 shadow-sm animate-pulse">
        <div className="h-8 w-8 rounded-full border-2 border-zinc-200 border-t-emerald-500 animate-spin mb-4" />
        <p className="text-zinc-400 font-medium text-sm">Loading workspace...</p>
      </div>
    )
  }
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 py-4 px-2 sm:px-6">
      <div className="max-w-[1000px] mx-auto">
        <FreeInvoiceBuilder />
      </div>
    </div>
  );
}
