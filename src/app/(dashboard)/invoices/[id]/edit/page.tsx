'use strict';

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { dbService, Invoice } from '@/services/db';
import { InvoiceEditor } from '@/components/invoice/InvoiceEditor';

interface EditInvoicePageProps {
  params: Promise<{ id: string }>;
}

export default function EditInvoicePage({ params }: EditInvoicePageProps) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdAndInvoice = async () => {
      try {
        const resolvedParams = await params;
        setInvoiceId(resolvedParams.id);
        const data = await dbService.getInvoiceById(resolvedParams.id);
        if (!data) {
          router.push('/invoices');
        } else {
          setInvoice(data);
        }
      } catch (err) {
        console.error('Failed to load invoice in edit page:', err);
        router.push('/invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchIdAndInvoice();
  }, [params, router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-44 bg-secondary animate-pulse rounded" />
        <div className="h-96 bg-secondary animate-pulse rounded-lg" />
      </div>
    );
  }

  return <InvoiceEditor invoiceId={invoiceId!} initialInvoice={invoice} />;
}
