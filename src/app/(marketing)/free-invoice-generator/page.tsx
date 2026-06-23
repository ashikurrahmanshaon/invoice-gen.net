import React from 'react';
import { Metadata } from 'next';
import { FreeInvoiceBuilder } from '@/components/invoice/FreeInvoiceBuilder';

export const metadata: Metadata = {
  title: 'Free Invoice Generator | Invoice-Gen.Net',
  description: 'Create and download professional PDF invoices instantly for free. No credit card, no signup required.',
  keywords: ['free invoice generator', 'invoice maker', 'pdf invoice', 'create invoice free'],
};

export default function FreeInvoiceGeneratorPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FreeInvoiceBuilder />
      </div>
    </div>
  );
}
