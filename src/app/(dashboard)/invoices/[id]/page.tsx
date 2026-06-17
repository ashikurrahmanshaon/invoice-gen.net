'use strict';

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth';
import { dbService, Invoice, Payment, Profile } from '@/services/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  ArrowLeft,
  Printer,
  Share2,
  CreditCard,
  Edit2,
  CheckCircle,
  FileText,
  Mail,
  Send,
  Copy,
  DollarSign,
  Calendar,
  Wallet,
} from 'lucide-react';

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const getBrandColorClasses = (color?: string) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-600',
          text: 'text-emerald-600',
          border: 'border-emerald-600',
        };
      case 'rose':
        return {
          bg: 'bg-rose-600',
          text: 'text-rose-600',
          border: 'border-rose-600',
        };
      case 'amber':
        return {
          bg: 'bg-amber-500',
          text: 'text-amber-500',
          border: 'border-amber-500',
        };
      case 'slate':
        return {
          bg: 'bg-slate-800',
          text: 'text-slate-800',
          border: 'border-slate-800',
        };
      case 'indigo':
      default:
        return {
          bg: 'bg-indigo-600',
          text: 'text-indigo-600',
          border: 'border-indigo-600',
        };
    }
  };

  const brandClasses = getBrandColorClasses(profile?.brand_color);

  // Sharing Modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Wire Transfer');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [recording, setRecording] = useState(false);

  const loadInvoiceData = async (invoiceId: string) => {
    try {
      const data = await dbService.getInvoiceById(invoiceId);
      if (!data) {
        router.push('/invoices');
        return;
      }
      setInvoice(data);
      setPaymentAmount(data.total); // prefill with remaining amount

      if (user) {
        const prof = await dbService.getProfile(user.id);
        setProfile(prof);
      }

      const paymentList = await dbService.getPayments(invoiceId);
      setPayments(paymentList);
    } catch (err) {
      console.error('Failed to load invoice details:', err);
      router.push('/invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchId = async () => {
      const resolvedParams = await params;
      loadInvoiceData(resolvedParams.id);
    };
    fetchId();
  }, [params, router, user]);

  useEffect(() => {
    if (!loading && invoice && typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('print') === 'true') {
        const newUrl = window.location.pathname;
        window.history.replaceState({ path: newUrl }, '', newUrl);
        setTimeout(() => {
          window.print();
        }, 300);
      }
    }
  }, [loading, invoice]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window === 'undefined' || !invoice) return;
    const shareLink = `${window.location.origin}/invoices/${invoice.id}`;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice || paymentAmount <= 0) return;
    setRecording(true);
    try {
      await dbService.recordPayment({
        invoice_id: invoice.id,
        amount: paymentAmount,
        payment_method: paymentMethod,
        notes: paymentNotes,
      });

      // Reload
      await loadInvoiceData(invoice.id);
      setIsPaymentModalOpen(false);
      setPaymentNotes('');
    } catch (err) {
      console.error('Record Payment Failed:', err);
    } finally {
      setRecording(false);
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  if (loading || !invoice) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-44 bg-secondary animate-pulse rounded" />
        <div className="h-96 bg-secondary animate-pulse rounded-lg" />
      </div>
    );
  }

  // Pre-fill share text templates
  const invoiceLink = typeof window !== 'undefined' ? `${window.location.origin}/invoices/${invoice.id}` : '';
  const shareMessage = `Hi, here is invoice ${invoice.invoice_number} from ${profile?.company_name || 'us'} for ${formatCurrency(invoice.total, invoice.currency)}. View details and pay here: ${invoiceLink}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
  const mailtoUrl = `mailto:${invoice.client?.email || ''}?subject=${encodeURIComponent(`Invoice ${invoice.invoice_number} from ${profile?.company_name || 'invoice-gen.net'}`)}&body=${encodeURIComponent(`Dear ${invoice.client?.name || 'Customer'},\n\nWe appreciate your business. Please find our invoice ${invoice.invoice_number} for the amount of ${formatCurrency(invoice.total, invoice.currency)} below.\n\nLink to Invoice: ${invoiceLink}\n\nNotes:\n${invoice.notes || 'Thanks'}\n\nBest regards,\n${profile?.company_name || 'invoice-gen.net'}`)}`;

  // Premium features check
  const isPremiumUser = profile?.is_premium || false;

  return (
    <div className="space-y-6">
      {/* Header controls (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4 no-print">
        <div className="flex items-center space-x-3">
          <Link href="/invoices">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Invoice Details</h1>
            <p className="text-xs text-muted-foreground">Invoice: <span className="font-bold text-foreground">{invoice.invoice_number}</span></p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/invoices/${invoice.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit2 size={14} className="mr-1.5" /> Edit
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer size={14} className="mr-1.5" /> Print / PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsShareModalOpen(true)}>
            <Share2 size={14} className="mr-1.5" /> Share
          </Button>
          
          <Button
            size="sm"
            onClick={() => setIsPaymentModalOpen(true)}
            className="bg-success text-white hover:brightness-105 border-success/20"
          >
            <CreditCard size={14} className="mr-1.5" /> Record Payment
          </Button>
        </div>
      </div>

      {/* Main Invoice Sheet Document */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Printable Sheet (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="print-card shadow-lg border-border bg-white text-zinc-900 rounded-xl overflow-hidden aspect-[1/1.414] relative">
            
            {/* Status Watermark */}
            {invoice.status === 'paid' && (
              <div className="absolute top-10 right-40 rotate-[15deg] border-4 border-emerald-500 text-emerald-500 font-extrabold text-xl px-4 py-1.5 rounded uppercase tracking-widest opacity-25 select-none pointer-events-none">
                PAID
              </div>
            )}

            <CardContent className="p-10 text-xs flex flex-col justify-between h-full space-y-8">
              <div className="space-y-8">
                {/* Brand header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5">
                    {profile?.logo_url ? (
                      <img src={profile.logo_url} alt="Logo" className="max-h-12 max-w-32 object-contain" />
                    ) : (
                      <div className={`h-8 w-8 rounded ${brandClasses.bg} flex items-center justify-center text-white font-bold text-sm`}>
                        {profile?.company_name?.charAt(0).toUpperCase() || 'I'}
                      </div>
                    )}
                    <h2 className="text-sm font-bold text-zinc-800 mt-2">{profile?.company_name || 'invoice-gen.net Inc.'}</h2>
                    <p className="text-[10px] text-zinc-500 max-w-xs whitespace-pre-wrap">{profile?.company_address || '100 Pine Street, San Francisco, CA 94111'}</p>
                    <p className="text-[9px] text-zinc-500">{profile?.company_email || 'billing@invoice-gen.net'}</p>
                    {profile?.company_phone && <p className="text-[9px] text-zinc-500">{profile.company_phone}</p>}
                  </div>
 
                  <div className="text-right space-y-1.5">
                    <h1 className={`text-lg font-extrabold tracking-tight uppercase ${brandClasses.text}`}>Invoice</h1>
                    <p className="text-sm font-bold text-zinc-800">{invoice.invoice_number}</p>
                    <div className="pt-2 text-[9px] text-zinc-500 space-y-0.5">
                      <p>Billed on: <span className="font-semibold text-zinc-700">{invoice.issue_date}</span></p>
                      <p>Due by: <span className="font-semibold text-zinc-700">{invoice.due_date}</span></p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-100" />

                {/* Billing Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold text-zinc-400 uppercase text-[9px] tracking-wider">Bill To:</h3>
                    <p className="font-bold text-zinc-800 text-sm mt-1">{invoice.client?.name || 'Client Name'}</p>
                    <p className="text-zinc-500 mt-0.5">{invoice.client?.email || 'client@email.com'}</p>
                    <p className="text-zinc-500 line-clamp-2 max-w-xs mt-0.5">{invoice.client?.address || 'Client Address'}</p>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left border-collapse mt-4">
                  <thead>
                    <tr className="border-b-2 border-zinc-200 text-zinc-400 uppercase text-[9px] font-bold tracking-wider">
                      <th className="pb-2.5">Description</th>
                      <th className="pb-2.5 text-right w-16">Qty</th>
                      <th className="pb-2.5 text-right w-24">Unit Price</th>
                      <th className="pb-2.5 text-right w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {invoice.items && invoice.items.map((item) => (
                      <tr key={item.id} className="text-zinc-700">
                        <td className="py-3 font-medium">{item.description}</td>
                        <td className="py-3 text-right text-zinc-500">{item.quantity}</td>
                        <td className="py-3 text-right text-zinc-500">{formatCurrency(item.unit_price, invoice.currency)}</td>
                        <td className="py-3 text-right font-bold text-zinc-800">{formatCurrency(item.amount, invoice.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary panel */}
              <div className="space-y-4">
                <div className="border-t-2 border-zinc-200 pt-5 flex justify-between items-start">
                  <div className="max-w-xs">
                    <h4 className="font-bold text-zinc-400 uppercase text-[8px] tracking-wider mb-1">Notes & Instructions:</h4>
                    <p className="text-[9px] text-zinc-500 leading-relaxed italic whitespace-pre-wrap">{invoice.notes || 'Thank you for your business!'}</p>
                  </div>

                  <div className="w-64 text-right space-y-1.5 text-[10px]">
                    <div className="flex justify-between text-zinc-500">
                      <span>Subtotal:</span>
                      <span className="font-medium text-zinc-800">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                    </div>

                    {invoice.discount_amount > 0 && (
                      <div className="flex justify-between text-zinc-500">
                        <span>Discount {invoice.discount_rate > 0 ? `(${invoice.discount_rate}%)` : ''}:</span>
                        <span className="font-medium text-emerald-600">-{formatCurrency(invoice.discount_amount, invoice.currency)}</span>
                      </div>
                    )}

                    {invoice.tax_rate > 0 && (
                      <div className="flex justify-between text-zinc-500">
                        <span>Tax ({invoice.tax_rate}%):</span>
                        <span className="font-medium text-zinc-800">{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
                      </div>
                    )}

                    <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-extrabold text-zinc-900">
                      <span className={brandClasses.text}>Total:</span>
                      <span>{formatCurrency(invoice.total, invoice.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info & Payment Log (4 cols) (hidden on print) */}
        <div className="lg:col-span-4 space-y-6 no-print">
          {/* Payment History card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Payment Tracking</span>
                {invoice.status === 'paid' ? (
                  <span className="text-[10px] font-bold bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full uppercase">
                    Paid
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-warning/10 text-warning border border-warning/20 px-2 py-0.5 rounded-full uppercase">
                    Pending
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {payments.length > 0 ? (
                <div className="space-y-3.5">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Payment Log</div>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {payments.map((p) => (
                      <div key={p.id} className="flex justify-between items-start text-xs border-b border-border/20 pb-2">
                        <div className="space-y-0.5">
                          <p className="font-semibold">{p.payment_method}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(p.payment_date).toLocaleDateString()}</p>
                          {p.notes && <p className="text-[9px] text-muted-foreground italic">"{p.notes}"</p>}
                        </div>
                        <span className="font-bold text-success">+{formatCurrency(p.amount, invoice.currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground italic">
                  No payment transaction records registered yet.
                </div>
              )}

              <Button
                variant="outline"
                className="w-full text-xs font-semibold"
                onClick={() => setIsPaymentModalOpen(true)}
              >
                Record Payment Received
              </Button>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="shadow-sm bg-secondary/25 border-primary/10">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center space-x-2 text-primary">
                <CheckCircle size={15} />
                <span className="font-bold text-xs uppercase tracking-wider">Quick Printing Tip</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When the print preview menu mounts, disable "Headers and Footers" in your browser printing configurations to produce a clean vector sheet.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Share Invoice Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Billing Invoice"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Share this invoice directly to your client via digital channels.</p>
          
          <div className="space-y-3 pt-2">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-3 rounded-lg border border-border/60 hover:bg-secondary/40 transition-colors"
            >
              <div className="h-8 w-8 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600">
                <Send size={15} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-xs font-bold">Share to WhatsApp</h4>
                <p className="text-[10px] text-muted-foreground">Opens WhatsApp Web with pre-filled billing details.</p>
              </div>
            </a>

            {/* Email */}
            <a
              href={mailtoUrl}
              className="flex items-center space-x-3 p-3 rounded-lg border border-border/60 hover:bg-secondary/40 transition-colors"
            >
              <div className="h-8 w-8 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-600">
                <Mail size={15} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-xs font-bold">Send via Email</h4>
                <p className="text-[10px] text-muted-foreground">Draft email message prefilled with invoice links.</p>
              </div>
            </a>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center space-x-3 p-3 rounded-lg border border-border/60 hover:bg-secondary/40 transition-colors cursor-pointer"
            >
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Copy size={15} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-xs font-bold">{copied ? 'Copied!' : 'Copy Public URL'}</h4>
                <p className="text-[10px] text-muted-foreground">Save the public sharing link to your clipboard.</p>
              </div>
            </button>
          </div>
        </div>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment Transaction"
        size="sm"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Payment Amount</label>
            <div className="relative">
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={paymentAmount || ''}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-right pr-10"
              />
              <DollarSign className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/60" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Payment Method</label>
            <div className="relative">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground appearance-none cursor-pointer"
              >
                <option value="Wire Transfer">Wire Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="PayPal">PayPal</option>
                <option value="Cash">Cash</option>
                <option value="Stripe Portal">Stripe Invoice Link</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Transaction Notes</label>
            <textarea
              placeholder="e.g. Check number, transaction reference code..."
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border/40">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={recording} className="bg-success text-white hover:brightness-105 border-success/20">
              Submit Transaction
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
