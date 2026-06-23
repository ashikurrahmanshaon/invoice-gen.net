'use client';

import React from 'react';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import { FreeInvoiceBuilder } from '@/components/invoice/FreeInvoiceBuilder';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-200 flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <FreeInvoiceBuilder />
      </div>
      <Footer />
    </div>
  );
}
