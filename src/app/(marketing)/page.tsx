'use client';

import React from 'react';
import { FreeInvoiceBuilder } from '@/components/invoice/FreeInvoiceBuilder';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 py-4 px-2 sm:px-6">
      <div className="max-w-[1000px] mx-auto">
        <FreeInvoiceBuilder />
      </div>
    </div>
  );
}
