'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import {
  Plus, Trash2, ArrowLeft, Eye, Download, UserPlus, Percent, DollarSign, Target, Briefcase, FileText, Zap
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Simplified local types
interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}
interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
}

export function FreeInvoiceBuilder() {
  const router = useRouter();
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Profile Mock State
  const [companyName, setCompanyName] = useState('My Company Inc.');
  const [companyAddress, setCompanyAddress] = useState('123 Business Rd.\nCity, State 12345');
  const [companyEmail, setCompanyEmail] = useState('billing@mycompany.com');
  const [logoUrl, setLogoUrl] = useState('');
  
  // Clients Mock State
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState('');
  
  // Invoice Details State
  const [invoiceNumber, setInvoiceNumber] = useState('INV-0001');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
  const [discountRate, setDiscountRate] = useState(0);
  const [discountVal, setDiscountVal] = useState(0);
  const [notes, setNotes] = useState('Thank you for your business!');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Consulting Services', quantity: 1, unit_price: 150, amount: 150 },
  ]);

  // UI State
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', address: '' });
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUpsellModalOpen, setIsUpsellModalOpen] = useState(false);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const discountAmount = discountType === 'percent' ? subtotal * (discountRate / 100) : discountVal;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * (taxRate / 100);
  const total = taxableAmount + taxAmount;

  // Handlers
  const handleItemChange = (index: number, field: keyof Omit<InvoiceItem, 'amount'>, value: any) => {
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

  const addItemRow = () => setItems([...items, { description: '', quantity: 1, unit_price: 0, amount: 0 }]);
  const removeItemRow = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, idx) => idx !== index));
  };

  const handleQuickAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;
    const added = { id: Date.now().toString(), ...newClient };
    setClients([...clients, added]);
    setClientId(added.id);
    setIsClientModalOpen(false);
    setNewClient({ name: '', email: '', address: '' });
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setIsDownloading(true);
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceNumber || 'Invoice'}.pdf`);
      
      // Trigger upsell after successful download
      setTimeout(() => setIsUpsellModalOpen(true), 1500);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatCurrencyVal = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val);
  };

  const selectedClient = clients.find((c) => c.id === clientId);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-0 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4 mb-4 relative">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/10 border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm shadow-emerald-500/10 items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Zap size={22} fill="currentColor" className="opacity-80" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                Free Invoice Generator
              </h1>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                Create professional invoices in seconds. <span className="text-emerald-600 dark:text-emerald-500">No signup required.</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 z-10">
          <div className="flex md:hidden bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${activeTab === 'edit' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-zinc-500'}`}
            >Configure</button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${activeTab === 'preview' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-zinc-500'}`}
            >Preview</button>
          </div>

          <Button 
            onClick={handleDownloadPDF} 
            isLoading={isDownloading} 
            className="group relative h-11 px-6 bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 font-bold border border-emerald-400/50 hover:border-emerald-300 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-24 h-24 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            </div>
            <Download size={18} className="mr-2 group-hover:animate-bounce" /> 
            <span className="tracking-wide">Download PDF</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 md:h-[calc(100vh-160px)] md:min-h-[600px]">
        {/* Editor Form Columns */}
        <div className={`md:col-span-6 space-y-6 md:overflow-y-auto pr-0 md:pr-2 pb-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full ${activeTab === 'preview' ? 'hidden md:block' : 'block'}`}>
          
          <Card className="shadow-lg shadow-emerald-500/5 border-emerald-500/20 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/20 pb-4 border-b border-emerald-100/50 dark:border-emerald-800/50">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Your Company Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <Input label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              <Input label="Billing Email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
              <div className="sm:col-span-2">
                <Textarea label="Company Address" rows={2} value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md shadow-zinc-200/50 dark:shadow-black/20 border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/50 mb-4"><CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Invoice Settings</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Billed To (Client)</label>
                  <button onClick={() => setIsClientModalOpen(true)} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center">
                    <Plus size={12} className="mr-1" /> Add Client Details
                  </button>
                </div>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground"
                >
                  <option value="" disabled>Select client...</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <Input label="Invoice Number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
              <Select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} options={[
                { value: 'USD', label: 'USD ($)' }, { value: 'EUR', label: 'EUR (€)' }, { value: 'GBP', label: 'GBP (£)' }
              ]} />
              <Input label="Issue Date" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </CardContent>
          </Card>

          <Card className="shadow-md shadow-zinc-200/50 dark:shadow-black/20 border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/50 mb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Line items</CardTitle>
              <Button size="sm" variant="outline" className="h-8 text-xs font-semibold" onClick={addItemRow}>
                <Plus size={14} className="mr-1" /> Add Row
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 border-b sm:border-0 border-border/40 pb-4 sm:pb-0">
                  <div className="flex-1 w-full">
                    {index === 0 && <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5 hidden sm:block">Description</label>}
                    <input type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                  </div>
                  <div className="w-full sm:w-20">
                    {index === 0 && <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5 hidden sm:block">Qty</label>}
                    <input type="number" min="1" value={item.quantity || ''} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-right" />
                  </div>
                  <div className="w-full sm:w-28">
                    {index === 0 && <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5 hidden sm:block">Price</label>}
                    <input type="number" step="0.01" value={item.unit_price || ''} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-right" />
                  </div>
                  <div className="w-full sm:w-24 text-right pt-2 sm:pt-0">
                    {index === 0 && <label className="text-[10px] font-semibold text-muted-foreground text-right uppercase mb-1.5 hidden sm:block">Amount</label>}
                    <div className="text-sm font-bold py-2 px-1 text-foreground">{formatCurrencyVal(item.amount)}</div>
                  </div>
                  <div className="pt-2 sm:pt-0 self-end sm:self-auto">
                    {index === 0 && <div className="h-6 hidden sm:block" />}
                    <Button variant="ghost" size="sm" className="text-destructive h-10 w-10 p-0" disabled={items.length === 1} onClick={() => removeItemRow(index)}>
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-md shadow-zinc-200/50 dark:shadow-black/20 border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/50 mb-4"><CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Adjustments</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Tax Rate (%)</label>
                  <div className="relative">
                    <Input type="number" min="0" max="100" step="0.01" value={taxRate || ''} onChange={(e) => setTaxRate(Math.max(0, parseFloat(e.target.value) || 0))} className="pr-10 text-right" />
                    <Percent className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/60" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Discount</label>
                    <div className="flex border border-border rounded p-0.5 text-[10px] font-semibold bg-secondary/50">
                      <button onClick={() => setDiscountType('percent')} className={`px-1.5 py-0.5 rounded ${discountType === 'percent' ? 'bg-card shadow' : 'text-muted-foreground'}`}>%</button>
                      <button onClick={() => setDiscountType('flat')} className={`px-1.5 py-0.5 rounded ${discountType === 'flat' ? 'bg-card shadow' : 'text-muted-foreground'}`}>$</button>
                    </div>
                  </div>
                  <div className="relative">
                    {discountType === 'percent' ? (
                      <><Input type="number" value={discountRate || ''} onChange={(e) => setDiscountRate(Math.max(0, parseFloat(e.target.value) || 0))} className="pr-10 text-right" /><Percent className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/60" /></>
                    ) : (
                      <><Input type="number" value={discountVal || ''} onChange={(e) => setDiscountVal(Math.max(0, parseFloat(e.target.value) || 0))} className="pr-10 text-right" /><DollarSign className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/60" /></>
                    )}
                  </div>
                </div>
              </div>
              <Textarea label="Invoice Notes" rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Panel */}
        <div className={`md:col-span-6 md:overflow-y-auto pb-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full ${activeTab === 'edit' ? 'hidden md:block' : 'block'}`}>
          <div className="bg-zinc-100/80 dark:bg-zinc-900/40 rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/60 p-4 sm:p-8 md:min-h-full flex flex-col justify-center items-center relative shadow-inner">
            <Card className="w-full max-w-[600px] shadow-2xl shadow-emerald-500/10 border-emerald-500/20 overflow-hidden bg-white text-zinc-900 aspect-[1/1.414]">
            <div ref={invoiceRef} className="p-8 text-[11px] h-full flex flex-col justify-between bg-white">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-zinc-900">{companyName || 'My Company Inc.'}</h3>
                    <p className="text-[10px] text-zinc-500 whitespace-pre-wrap">{companyAddress || '123 Business Rd.\nCity, State 12345'}</p>
                    <p className="text-[9px] text-zinc-500">{companyEmail}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <h2 className="text-xl font-extrabold tracking-tight uppercase text-emerald-600">Invoice</h2>
                    <p className="font-bold text-zinc-800">{invoiceNumber || 'INV-0001'}</p>
                    <div className="pt-2 text-[9px] text-zinc-500 space-y-0.5">
                      <p>Billed on: <span className="font-semibold text-zinc-700">{issueDate}</span></p>
                      <p>Due by: <span className="font-semibold text-zinc-700">{dueDate}</span></p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-200" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-zinc-400 uppercase text-[9px] tracking-wider mb-1">Bill To:</h4>
                    <p className="font-bold text-zinc-800 text-sm">{selectedClient?.name || 'Client Name'}</p>
                    <p className="text-zinc-500 mt-0.5">{selectedClient?.email || 'client@email.com'}</p>
                    <p className="text-zinc-500 whitespace-pre-wrap mt-0.5">{selectedClient?.address}</p>
                  </div>
                </div>

                <table className="w-full text-left mt-6 border-collapse">
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
                        <td className="py-3 text-zinc-800 font-medium">{item.description || 'Item Description'}</td>
                        <td className="py-3 text-right text-zinc-500">{item.quantity || 1}</td>
                        <td className="py-3 text-right text-zinc-500">{formatCurrencyVal(item.unit_price)}</td>
                        <td className="py-3 text-right font-bold text-zinc-800">{formatCurrencyVal(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-4">
                <div className="border-t-2 border-zinc-200 pt-4 flex justify-between items-start">
                  <div className="max-w-[200px]">
                    <h4 className="font-bold text-zinc-400 uppercase text-[9px] tracking-wider mb-1">Notes & Instructions:</h4>
                    <p className="text-[10px] text-zinc-600 leading-relaxed whitespace-pre-wrap">{notes || 'Thank you for your business!'}</p>
                  </div>
                  <div className="w-48 text-right space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-500"><span>Subtotal:</span><span className="font-medium text-zinc-800">{formatCurrencyVal(subtotal)}</span></div>
                    {discountAmount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount:</span><span className="font-medium">-{formatCurrencyVal(discountAmount)}</span></div>}
                    {taxRate > 0 && <div className="flex justify-between text-zinc-500"><span>Tax ({taxRate}%):</span><span className="font-medium text-zinc-800">{formatCurrencyVal(taxAmount)}</span></div>}
                    <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-extrabold text-zinc-900"><span className="text-emerald-600">Total:</span><span>{formatCurrencyVal(total)}</span></div>
                  </div>
                </div>
                <div className="pt-8 text-center text-[9px] text-zinc-400 font-medium">Generated via <span className="font-bold text-emerald-600">Invoice-Gen.Net</span></div>
              </div>
            </div>
          </Card>
          </div>
        </div>
      </div>

      {/* Quick Add Client Modal */}
      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Add Client" size="sm">
        <form onSubmit={handleQuickAddClient} className="space-y-4">
          <Input label="Client Name" required value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
          <Input label="Email Address" type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
          <Textarea label="Address" rows={2} value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} />
          <div className="flex justify-end pt-2"><Button type="submit">Save to Local Invoice</Button></div>
        </form>
      </Modal>

      {/* The "Moja" Upsell Trap Modal */}
      <Modal isOpen={isUpsellModalOpen} onClose={() => setIsUpsellModalOpen(false)} title="" size="md">
        <div className="text-center space-y-6 py-4">
          <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-full mb-2 shadow-inner">
            <FileText size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Your PDF is ready! 🎉</h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
              You just created a beautiful invoice in seconds. Want to save your clients and track when this gets paid?
            </p>
          </div>
          
          <div className="bg-secondary/50 rounded-xl p-4 text-left space-y-3 border border-border/50">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Unlock Full Platform:</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li className="flex items-center"><Target size={16} className="text-emerald-500 mr-2" /> Save clients to your directory</li>
              <li className="flex items-center"><DollarSign size={16} className="text-emerald-500 mr-2" /> Track payments and revenue analytics</li>
              <li className="flex items-center"><Briefcase size={16} className="text-emerald-500 mr-2" /> Send invoices directly via email</li>
            </ul>
          </div>

          <div className="flex flex-col space-y-3 pt-2">
            <Link href="/login?signup=true" className="w-full">
              <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20">
                Sign up to Save & Track
              </Button>
            </Link>
            <button onClick={() => setIsUpsellModalOpen(false)} className="text-xs text-muted-foreground hover:text-foreground font-semibold">
              No thanks, I'll keep creating them manually
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
