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
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] pt-16">
      <FreeInvoiceBuilder />
    </div>
  );
}
