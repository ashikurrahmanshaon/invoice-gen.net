'use client';

import React from 'react';
import { FreeInvoiceBuilder } from '@/components/invoice/FreeInvoiceBuilder';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-200">
      <div className="max-w-[1200px] mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 mb-4">
            Free Invoice Generator
          </h1>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
            Create, download, and send professional PDF invoices in seconds. No sign-up required. Completely free forever.
          </p>
        </div>
        
        <div className="bg-white rounded-3xl shadow-2xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden">
          <FreeInvoiceBuilder />
        </div>
      </div>
    </div>
  );
}
