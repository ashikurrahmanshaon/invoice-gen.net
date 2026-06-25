'use client';

import React from 'react';
import { FreeInvoiceBuilder } from '@/components/invoice/FreeInvoiceBuilder';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-zinc-150 font-sans selection:bg-emerald-500/30 transition-colors duration-250 relative overflow-hidden py-12 pb-32 flex justify-center items-start">
      {/* Cinematic Mesh Background */}
      <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[600px] rounded-full bg-emerald-500/15 blur-[150px] pointer-events-none -z-10 animate-pulse-slow mix-blend-screen" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[600px] rounded-full bg-blue-600/15 blur-[150px] pointer-events-none -z-10 animate-pulse-slow mix-blend-screen" />
      <div className="absolute top-[30%] left-[40%] w-[40%] h-[400px] rounded-full bg-violet-500/10 blur-[150px] pointer-events-none -z-10 mix-blend-screen" />

      {/* Grid Pattern Overlay for extra texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none -z-10 mix-blend-overlay" />
      
      {/* Canvas Wrapper */}
      <main id="editor" className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center">
        <FreeInvoiceBuilder />
      </main>
    </div>
  );
}
