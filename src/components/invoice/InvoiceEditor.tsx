'use strict';

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth';
import { dbService, Client, Invoice, InvoiceItem, Profile } from '@/services/db';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Eye,
  FileText,
  UserPlus,
  Percent,
  DollarSign,
} from 'lucide-react';

interface InvoiceEditorProps {
  invoiceId?: string;
  initialInvoice?: Invoice | null;
}

export function InvoiceEditor({ invoiceId, initialInvoice }: InvoiceEditorProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields State
  const [clientId, setClientId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
  const [discountRate, setDiscountRate] = useState(0); // for percent
  const [discountVal, setDiscountVal] = useState(0); // for flat
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>([
    { description: '', quantity: 1, unit_price: 0, amount: 0 },
  ]);

  // Modals & Tabs State
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', address: '' });
  const [clientSubmitting, setClientSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit'); // Mobile view toggle
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const prof = await dbService.getProfile(user.id);
        setProfile(prof);
        
        const clientList = await dbService.getClients(user.id);
        setClients(clientList);

        if (initialInvoice) {
          // Editing mode
          setClientId(initialInvoice.client_id || '');
          setInvoiceNumber(initialInvoice.invoice_number);
          setIssueDate(initialInvoice.issue_date);
          setDueDate(initialInvoice.due_date);
          setCurrency(initialInvoice.currency);
          setTaxRate(initialInvoice.tax_rate);
          setNotes(initialInvoice.notes || '');
          
          if (initialInvoice.discount_rate > 0) {
            setDiscountType('percent');
            setDiscountRate(initialInvoice.discount_rate);
          } else if (initialInvoice.discount_amount > 0) {
            setDiscountType('flat');
            setDiscountVal(initialInvoice.discount_amount);
          }
          
          setItems(
            initialInvoice.items.map((item) => ({
              description: item.description,
              quantity: Number(item.quantity),
              unit_price: Number(item.unit_price),
              amount: Number(item.amount),
            }))
          );
        } else {
          // Creating mode
          const nextNum = await dbService.getNextInvoiceNumber(user.id);
          setInvoiceNumber(nextNum);
          setCurrency(prof.currency || 'USD');
          setNotes('Invoice generated. Thank you for your business!');
        }
      } catch (err) {
        console.error('Failed to load editor configs:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, initialInvoice]);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const discountAmount =
    discountType === 'percent'
      ? subtotal * (discountRate / 100)
      : discountVal;
  
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * (taxRate / 100);
  const total = taxableAmount + taxAmount;

  // Items Modification
  const handleItemChange = (index: number, field: keyof Omit<InvoiceItem, 'id' | 'amount'>, value: any) => {
    const updated = [...items];
    if (field === 'quantity') {
      const q = parseInt(value, 10);
      updated[index].quantity = isNaN(q) ? 0 : q;
    } else if (field === 'unit_price') {
      const p = parseFloat(value);
      updated[index].unit_price = isNaN(p) ? 0 : p;
    } else {
      updated[index].description = value;
    }
    updated[index].amount = updated[index].quantity * updated[index].unit_price;
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, amount: 0 }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Quick client add
  const handleQuickAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !user) return;
    setClientSubmitting(true);
    try {
      const added = await dbService.createClient({
        user_id: user.id,
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        address: newClient.address,
      });
      setClients([...clients, added]);
      setClientId(added.id);
      setIsClientModalOpen(false);
      setNewClient({ name: '', email: '', phone: '', address: '' });
    } catch (err) {
      console.error('Quick Add Client Failed:', err);
    } finally {
      setClientSubmitting(false);
    }
  };

  const handleSave = async () => {
    setError('');
    if (!clientId) {
      setError('Please select or add a client.');
      return;
    }
    if (!invoiceNumber) {
      setError('Invoice number is required.');
      return;
    }
    if (items.some((item) => !item.description.trim() || item.unit_price <= 0)) {
      setError('Please fill in valid descriptions and unit prices for all item lines.');
      return;
    }

    setSaving(true);
    const invoicePayload = {
      user_id: user!.id,
      client_id: clientId,
      invoice_number: invoiceNumber,
      status: (initialInvoice?.status || 'pending') as 'pending' | 'draft' | 'paid' | 'overdue',
      issue_date: issueDate,
      due_date: dueDate,
      currency,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      discount_rate: discountType === 'percent' ? discountRate : 0,
      discount_amount: discountAmount,
      subtotal,
      total,
      notes,
      items: items as InvoiceItem[],
    };

    try {
      let savedInvoice: Invoice;
      if (invoiceId) {
        savedInvoice = await dbService.updateInvoice(invoiceId, invoicePayload);
      } else {
        savedInvoice = await dbService.createInvoice(invoicePayload);
      }
      router.push(`/invoices/${savedInvoice.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to save invoice.');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrencyVal = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(val);
  };

  const selectedClient = clients.find((c) => c.id === clientId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-44 bg-secondary animate-pulse rounded" />
        <div className="h-96 bg-secondary animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {invoiceId ? `Edit Invoice ${invoiceNumber}` : 'Create New Invoice'}
            </h1>
            <p className="text-xs text-muted-foreground">Draft and configure item rates, clients, and layout parameters.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Mobile view toggles */}
          <div className="flex md:hidden bg-secondary/50 rounded-lg p-1 border border-border/40">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1 text-xs font-semibold rounded-md ${
                activeTab === 'edit' ? 'bg-card text-foreground shadow' : 'text-muted-foreground'
              }`}
            >
              Configure
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-xs font-semibold rounded-md ${
                activeTab === 'preview' ? 'bg-card text-foreground shadow' : 'text-muted-foreground'
              }`}
            >
              Preview
            </button>
          </div>

          <Button onClick={handleSave} isLoading={saving} size="sm">
            <Save size={16} className="mr-2" /> Save Invoice
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg border border-destructive/20 bg-destructive/10 text-xs font-semibold text-destructive text-center">
          {error}
        </div>
      )}

      {/* Workspace Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Editor Form Columns (7 cols) */}
        <div className={`md:col-span-7 space-y-6 ${activeTab === 'preview' ? 'hidden md:block' : 'block'}`}>
          {/* General Invoicing parameters */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">General settings</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Client</label>
                  <button
                    onClick={() => setIsClientModalOpen(true)}
                    className="text-xs text-primary hover:underline font-semibold flex items-center cursor-pointer"
                  >
                    <UserPlus size={12} className="mr-1" /> Quick Add Client
                  </button>
                </div>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select client from directory...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <Input
                label="Invoice Number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />

              <Select
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={[
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'GBP', label: 'GBP (£)' },
                  { value: 'CAD', label: 'CAD ($)' },
                  { value: 'AUD', label: 'AUD ($)' },
                ]}
              />

              <Input
                label="Issue Date"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />

              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Line Items Card */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40 mb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Line items</CardTitle>
              <Button size="sm" variant="outline" className="h-8 text-xs font-semibold" onClick={addItemRow}>
                <Plus size={14} className="mr-1" /> Add Row
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-b sm:border-0 border-border/40 pb-4 sm:pb-0">
                  <div className="flex-1 w-full">
                    {index === 0 && <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5 hidden sm:block">Description</label>}
                    <input
                      type="text"
                      placeholder="Consulting / Licensing etc."
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="w-full sm:w-20">
                    {index === 0 && <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5 hidden sm:block">Qty</label>}
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={item.quantity || ''}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-right"
                    />
                  </div>

                  <div className="w-full sm:w-28">
                    {index === 0 && <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5 hidden sm:block">Price</label>}
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={item.unit_price || ''}
                      onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-right"
                    />
                  </div>

                  <div className="w-full sm:w-24 text-right pt-2 sm:pt-0">
                    {index === 0 && <label className="text-[10px] font-semibold text-muted-foreground text-right uppercase mb-1.5 hidden sm:block">Amount</label>}
                    <div className="text-sm font-bold py-2 px-1 text-foreground">
                      {formatCurrencyVal(item.amount)}
                    </div>
                  </div>

                  <div className="pt-2 sm:pt-0 self-end sm:self-auto">
                    {index === 0 && <div className="h-6 hidden sm:block" />}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 h-10 w-10 p-0"
                      disabled={items.length === 1}
                      onClick={() => removeItemRow(index)}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tax, Discounts & Notes */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Adjustments & Notes</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Tax Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Tax Rate (%)</label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={taxRate || ''}
                      onChange={(e) => setTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="pr-10 text-right"
                    />
                    <Percent className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/60" />
                  </div>
                </div>

                {/* Discount input with mode switcher */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Discount</label>
                    <div className="flex border border-border rounded p-0.5 text-[10px] font-semibold bg-secondary/50">
                      <button
                        onClick={() => setDiscountType('percent')}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          discountType === 'percent' ? 'bg-card text-foreground shadow' : 'text-muted-foreground'
                        }`}
                      >
                        %
                      </button>
                      <button
                        onClick={() => setDiscountType('flat')}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          discountType === 'flat' ? 'bg-card text-foreground shadow' : 'text-muted-foreground'
                        }`}
                      >
                        $
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    {discountType === 'percent' ? (
                      <>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={discountRate || ''}
                          onChange={(e) => setDiscountRate(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="pr-10 text-right"
                        />
                        <Percent className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/60" />
                      </>
                    ) : (
                      <>
                        <Input
                          type="number"
                          min="0"
                          value={discountVal || ''}
                          onChange={(e) => setDiscountVal(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="pr-10 text-right"
                        />
                        <DollarSign className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/60" />
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Textarea
                label="Invoice Notes"
                rows={5}
                placeholder="Include payment terms, bank details, or terms here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Panel (5 cols) */}
        <div className={`md:col-span-5 sticky top-6 ${activeTab === 'edit' ? 'hidden md:block' : 'block'}`}>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Real-time Preview</span>
            <span className="text-[10px] bg-secondary/80 px-2 py-0.5 rounded-full border border-border/40 flex items-center">
              <Eye size={10} className="mr-1 text-primary" /> Auto-updates
            </span>
          </div>
          
          <Card className="shadow-lg border-border/80 overflow-hidden bg-white text-zinc-900 aspect-[1/1.414]">
            <CardContent className="p-8 text-xs h-full flex flex-col justify-between select-none">
              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    {profile?.logo_url ? (
                      <img src={profile.logo_url} alt="Logo" className="max-h-8 max-w-28 object-contain" />
                    ) : (
                      <div className={`h-6 w-6 rounded ${brandClasses.bg} flex items-center justify-center text-white font-bold text-xs`}>
                        {profile?.company_name?.charAt(0).toUpperCase() || 'I'}
                      </div>
                    )}
                    <h3 className="font-bold text-sm text-zinc-900 mt-2">{profile?.company_name || 'My Company'}</h3>
                    <p className="text-[10px] text-zinc-500 max-w-44 line-clamp-2">{profile?.company_address || 'Company Address'}</p>
                    <p className="text-[9px] text-zinc-500">{profile?.company_email}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <h2 className={`text-base font-extrabold tracking-tight uppercase ${brandClasses.text}`}>Invoice</h2>
                    <p className="font-bold text-zinc-800">{invoiceNumber || 'INV-XXXX'}</p>
                    <div className="pt-2 text-[9px] text-zinc-500 space-y-0.5">
                      <p>Billed on: <span className="font-semibold text-zinc-700">{issueDate}</span></p>
                      <p>Due by: <span className="font-semibold text-zinc-700">{dueDate}</span></p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-100" />

                {/* Client info mapping */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-zinc-500 uppercase text-[9px] tracking-wider">Bill To:</h4>
                    <p className="font-bold text-zinc-800 mt-1">{selectedClient?.name || 'Client Name'}</p>
                    <p className="text-zinc-500 mt-0.5">{selectedClient?.email || 'client@email.com'}</p>
                    <p className="text-zinc-500 line-clamp-2 max-w-44 mt-0.5">{selectedClient?.address || 'Client Address'}</p>
                  </div>
                </div>

                {/* Table details */}
                <table className="w-full text-left mt-4 border-collapse">
                  <thead>
                    <tr className="border-b-2 border-zinc-200 text-zinc-500 uppercase text-[9px] font-bold tracking-wider">
                      <th className="pb-2">Description</th>
                      <th className="pb-2 text-right w-12">Qty</th>
                      <th className="pb-2 text-right w-20">Unit Price</th>
                      <th className="pb-2 text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 text-zinc-800 font-medium truncate max-w-36">{item.description || 'Item Description'}</td>
                        <td className="py-2.5 text-right text-zinc-500">{item.quantity || 1}</td>
                        <td className="py-2.5 text-right text-zinc-500">{formatCurrencyVal(item.unit_price)}</td>
                        <td className="py-2.5 text-right font-bold text-zinc-800">{formatCurrencyVal(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals panel */}
              <div className="space-y-4">
                <div className="border-t-2 border-zinc-200 pt-4 flex justify-between items-start">
                  <div className="max-w-44">
                    <h4 className="font-bold text-zinc-500 uppercase text-[8px] tracking-wider mb-1">Notes & Instructions:</h4>
                    <p className="text-[9px] text-zinc-500 leading-relaxed italic line-clamp-3">{notes || 'Thank you for your business!'}</p>
                  </div>

                  <div className="w-48 text-right space-y-1.5 text-[10px]">
                    <div className="flex justify-between text-zinc-500">
                      <span>Subtotal:</span>
                      <span className="font-medium text-zinc-800">{formatCurrencyVal(subtotal)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-zinc-500">
                        <span>Discount {discountType === 'percent' ? `(${discountRate}%)` : ''}:</span>
                        <span className="font-medium text-success">-{formatCurrencyVal(discountAmount)}</span>
                      </div>
                    )}

                    {taxRate > 0 && (
                      <div className="flex justify-between text-zinc-500">
                        <span>Tax ({taxRate}%):</span>
                        <span className="font-medium text-zinc-800">{formatCurrencyVal(taxAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between border-t border-zinc-200 pt-2 text-xs font-extrabold text-zinc-900">
                      <span className={brandClasses.text}>Total:</span>
                      <span>{formatCurrencyVal(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Client Modal */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title="Add New Client Contacts"
        size="md"
      >
        <form onSubmit={handleQuickAddClient} className="space-y-4">
          <Input
            label="Client / Company Name"
            required
            value={newClient.name}
            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
          />
          <Input
            label="Billing Email"
            type="email"
            placeholder="billing@company.com"
            value={newClient.email}
            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
          />
          <Input
            label="Contact Phone"
            placeholder="+1 (555) 000-0000"
            value={newClient.phone}
            onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
          />
          <Textarea
            label="Corporate / Billing Address"
            rows={3}
            placeholder="123 Corporate Blvd, Suite 100, New York, NY 10001"
            value={newClient.address}
            onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
          />
          <div className="flex justify-end space-x-3 pt-4 border-t border-border/40">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsClientModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={clientSubmitting}>
              Add Client Contacts
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
