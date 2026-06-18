'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  Plus, Trash2, Download, ChevronDown,
  Image as ImageIcon, CreditCard,
  Check, DollarSign, Building2, User, FileText,
  Calendar, Layers, Paintbrush, FileBadge, Settings2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Types ---
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

// --- Constants ---
const THEME_COLORS = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Blue',    value: '#3b82f6' },
  { name: 'Violet',  value: '#8b5cf6' },
  { name: 'Rose',    value: '#f43f5e' },
  { name: 'Amber',   value: '#f59e0b' },
  { name: 'Zinc',    value: '#18181b' },
];

const TEMPLATES = ['modern', 'classic', 'creative', 'enterprise'] as const;

// --- Design Tool UI Components ---
const SidebarPanel = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
  <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-inner">
    <div className="flex items-center gap-2 mb-4 text-white/90">
      <Icon size={16} className="text-white/50" />
      <h3 className="text-[13px] font-bold uppercase tracking-widest">{title}</h3>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
    {children}
  </label>
);

const GlassInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full h-10 rounded-xl bg-black/40 border border-white/10 px-3 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:ring-[3px] focus:ring-white/10 transition-all ${props.className || ''}`}
  />
);

const GlassSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="relative group">
    <select
      {...props}
      className={`w-full h-10 rounded-xl bg-black/40 border border-white/10 pl-3 pr-8 text-[13px] text-white focus:outline-none focus:border-white/30 focus:ring-[3px] focus:ring-white/10 transition-all appearance-none cursor-pointer ${props.className || ''}`}
    >
      {props.children}
    </select>
    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none group-focus-within:text-white transition-colors" />
  </div>
);

const GlassTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full rounded-xl bg-black/40 border border-white/10 p-3 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:ring-[3px] focus:ring-white/10 transition-all resize-none ${props.className || ''}`}
  />
);


export function FreeInvoiceBuilder() {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- State ---
  const [template, setTemplate] = useState<typeof TEMPLATES[number]>('modern');
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0]);
  const [logoUrl, setLogoUrl] = useState('');

  const [companyName, setCompanyName]       = useState('Acme Corp');
  const [companyAddress, setCompanyAddress] = useState('123 Innovation Way\nSan Francisco, CA 94103');
  const [companyEmail, setCompanyEmail]     = useState('billing@acme.com');

  const [clients, setClients]   = useState<Client[]>([]);
  const [clientId, setClientId] = useState('');

  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-001');
  const [issueDate, setIssueDate]         = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate]             = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [currency, setCurrency]         = useState('USD');
  const [taxRate, setTaxRate]           = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
  const [discountRate, setDiscountRate] = useState(0);
  const [discountVal, setDiscountVal]   = useState(0);
  const [paymentDetails, setPaymentDetails] = useState('Bank Transfer\nAcct: 987654321\nRouting: 123456789');
  const [notes, setNotes]               = useState('Thank you for your business. Payment is due within 14 days.');
  const [items, setItems]               = useState<InvoiceItem[]>([
    { description: 'Premium Web Design', quantity: 1, unit_price: 3500, amount: 3500 },
    { description: 'Hosting & Maintenance', quantity: 1, unit_price: 600, amount: 600 },
  ]);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClient, setNewClient]                 = useState({ name: '', email: '', address: '' });
  const [isDownloading, setIsDownloading]         = useState(false);
  const [scale, setScale] = useState(1);

  // --- Scale Logic to Fit Screen ---
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // Assume document is ~800px wide, and we have ~700px height.
        // We want it to fit perfectly in the center stage.
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        const scaleW = (w - 100) / 800; // 800 is approx A4 width
        const scaleH = (h - 100) / 1130; // 1130 is approx A4 height
        setScale(Math.min(scaleW, scaleH, 1));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Calcs ---
  const subtotal       = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const discountAmount = discountType === 'percent' ? subtotal * (discountRate / 100) : discountVal;
  const taxableAmount  = Math.max(0, subtotal - discountAmount);
  const taxAmount      = taxableAmount * (taxRate / 100);
  const total          = taxableAmount + taxAmount;
  const selectedClient = clients.find(c => c.id === clientId);

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(v);

  const handleItemChange = (i: number, field: keyof Omit<InvoiceItem, 'amount'>, v: any) => {
    const u = [...items];
    if (field === 'quantity')        u[i].quantity   = parseInt(v, 10) || 0;
    else if (field === 'unit_price') u[i].unit_price = parseFloat(v)  || 0;
    else                             u[i].description = v;
    u[i].amount = u[i].quantity * u[i].unit_price;
    setItems(u);
  };

  const addRow    = () => setItems([...items, { description: '', quantity: 1, unit_price: 0, amount: 0 }]);
  const removeRow = (i: number) => { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)); };

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
      const canvas  = await html2canvas(invoiceRef.current, { scale: 3, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf     = new jsPDF('p', 'mm', 'a4');
      const pw      = pdf.internal.pageSize.getWidth();
      const ph      = (canvas.height * pw) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pw, ph);
      pdf.save(`${invoiceNumber || 'Invoice'}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // PROFESSIONAL TEMPLATES (Unchanged designs, beautifully rendered)
  // ---------------------------------------------------------------------------

  const renderModernTemplate = () => (
    <div className="bg-white min-h-[1130px] w-full text-[12px] text-zinc-800 font-sans p-16 relative flex flex-col shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-3" style={{ backgroundColor: themeColor.value }} />
      <div className="flex justify-between items-start mb-16 mt-4">
        <div>
          {logoUrl ? <img src={logoUrl} alt="Logo" className="max-h-16 mb-4 object-contain" crossOrigin="anonymous" /> : <h1 className="text-3xl font-bold tracking-tight mb-2 text-zinc-900">{companyName || 'Your Company'}</h1>}
          <p className="text-zinc-500 whitespace-pre-wrap leading-relaxed">{companyAddress}</p>
          <p className="text-zinc-500 mt-1">{companyEmail}</p>
        </div>
        <div className="text-right">
          <h2 className="text-5xl font-light tracking-tight text-zinc-200 uppercase mb-2">Invoice</h2>
          <p className="font-medium text-zinc-900 text-xl">{invoiceNumber}</p>
        </div>
      </div>
      <div className="flex justify-between items-end mb-16">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Billed To</p>
          <p className="font-semibold text-lg text-zinc-900">{selectedClient?.name || 'Client Name'}</p>
          {selectedClient?.address && <p className="text-zinc-600 whitespace-pre-wrap mt-1 leading-relaxed">{selectedClient.address}</p>}
          <p className="text-zinc-500 mt-1">{selectedClient?.email || 'client@email.com'}</p>
        </div>
        <div className="flex gap-16 text-right">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Issue Date</p>
            <p className="font-semibold text-zinc-900">{issueDate}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Due Date</p>
            <p className="font-semibold text-zinc-900">{dueDate}</p>
          </div>
        </div>
      </div>
      <table className="w-full text-left mb-16">
        <thead>
          <tr className="border-b-2 border-zinc-100">
            <th className="py-4 text-[11px] font-semibold text-zinc-500">Description</th>
            <th className="py-4 text-[11px] font-semibold text-zinc-500 text-center w-24">Qty</th>
            <th className="py-4 text-[11px] font-semibold text-zinc-500 text-right w-32">Price</th>
            <th className="py-4 text-[11px] font-semibold text-zinc-500 text-right w-32">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-5 text-zinc-900 font-medium text-sm">{item.description || 'Item'}</td>
              <td className="py-5 text-zinc-500 text-center">{item.quantity}</td>
              <td className="py-5 text-zinc-500 text-right">{fmt(item.unit_price)}</td>
              <td className="py-5 text-zinc-900 font-semibold text-right">{fmt(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-auto flex justify-between items-start gap-12">
        <div className="flex-1 space-y-8">
          {paymentDetails && (<div><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Payment Instructions</p><p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">{paymentDetails}</p></div>)}
          {notes && (<div><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Notes</p><p className="text-zinc-500 leading-relaxed whitespace-pre-wrap">{notes}</p></div>)}
        </div>
        <div className="w-80 bg-zinc-50 rounded-2xl p-8 border border-zinc-100">
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-zinc-500"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            {discountAmount > 0 && <div className="flex justify-between text-zinc-500"><span>Discount</span><span>−{fmt(discountAmount)}</span></div>}
            {taxRate > 0 && <div className="flex justify-between text-zinc-500"><span>Tax ({taxRate}%)</span><span>{fmt(taxAmount)}</span></div>}
          </div>
          <div className="pt-6 border-t border-zinc-200 flex justify-between items-center">
            <span className="text-base font-bold text-zinc-900">Total Due</span>
            <span className="text-3xl font-bold" style={{ color: themeColor.value }}>{fmt(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClassicTemplate = () => (
    <div className="bg-white min-h-[1130px] w-full text-[12px] text-zinc-900 font-serif p-16 flex flex-col shadow-2xl border-[1px] border-zinc-200">
      <div className="flex justify-between items-start mb-16">
        <div className="w-1/2">
          {logoUrl && <img src={logoUrl} alt="Logo" className="max-h-20 mb-8 object-contain" crossOrigin="anonymous" />}
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">{companyName || 'Your Company'}</h1>
          <p className="text-zinc-600 whitespace-pre-wrap leading-relaxed">{companyAddress}</p>
          <p className="text-zinc-600 mt-1">{companyEmail}</p>
        </div>
        <div className="text-right">
          <h2 className="text-6xl uppercase tracking-widest text-zinc-900 mb-8 font-light">Invoice</h2>
          <table className="ml-auto text-right text-[12px] font-sans">
            <tbody>
              <tr><td className="pr-6 py-2 text-zinc-500 uppercase tracking-wider font-semibold">Invoice No.</td><td className="font-semibold text-zinc-900">{invoiceNumber}</td></tr>
              <tr><td className="pr-6 py-2 text-zinc-500 uppercase tracking-wider font-semibold">Date</td><td>{issueDate}</td></tr>
              <tr><td className="pr-6 py-2 text-zinc-500 uppercase tracking-wider font-semibold">Due Date</td><td>{dueDate}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="mb-12 font-sans">
        <div className="border-b border-zinc-800 pb-2 mb-4 w-1/2"><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Bill To</p></div>
        <p className="font-bold text-lg text-zinc-900">{selectedClient?.name || 'Client Name'}</p>
        {selectedClient?.address && <p className="text-zinc-600 whitespace-pre-wrap mt-2 leading-relaxed">{selectedClient.address}</p>}
        <p className="text-zinc-600 mt-1">{selectedClient?.email || 'client@email.com'}</p>
      </div>
      <table className="w-full text-left mb-12 border-collapse font-sans">
        <thead>
          <tr className="border-y-2 border-zinc-900 bg-zinc-50">
            <th className="py-4 px-6 text-[12px] font-bold text-zinc-800">Description</th>
            <th className="py-4 px-6 text-[12px] font-bold text-zinc-800 text-center w-24">Qty</th>
            <th className="py-4 px-6 text-[12px] font-bold text-zinc-800 text-right w-32">Price</th>
            <th className="py-4 px-6 text-[12px] font-bold text-zinc-800 text-right w-32">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-b border-zinc-200">
              <td className="py-5 px-6 text-zinc-900">{item.description || 'Item'}</td>
              <td className="py-5 px-6 text-zinc-600 text-center">{item.quantity}</td>
              <td className="py-5 px-6 text-zinc-600 text-right">{fmt(item.unit_price)}</td>
              <td className="py-5 px-6 text-zinc-900 font-semibold text-right">{fmt(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-auto flex justify-between items-start gap-12 font-sans">
        <div className="flex-1 space-y-8">
          {paymentDetails && (<div><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-200 pb-1 mb-2">Payment Terms</p><p className="text-zinc-700 whitespace-pre-wrap leading-relaxed">{paymentDetails}</p></div>)}
          {notes && (<div><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-200 pb-1 mb-2">Remarks</p><p className="text-zinc-600 whitespace-pre-wrap italic leading-relaxed">{notes}</p></div>)}
        </div>
        <div className="w-80">
          <table className="w-full text-right text-[13px]">
            <tbody>
              <tr><td className="py-2 text-zinc-600">Subtotal</td><td className="py-2 font-medium">{fmt(subtotal)}</td></tr>
              {discountAmount > 0 && <tr><td className="py-2 text-zinc-600">Discount</td><td className="py-2 text-red-600 font-medium">−{fmt(discountAmount)}</td></tr>}
              {taxRate > 0 && <tr><td className="py-2 text-zinc-600">Tax ({taxRate}%)</td><td className="py-2 font-medium">{fmt(taxAmount)}</td></tr>}
              <tr className="border-t-2 border-zinc-900 text-[18px] font-bold">
                <td className="py-6 uppercase tracking-widest">Total Due</td>
                <td className="py-6" style={{ color: themeColor.value }}>{fmt(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCreativeTemplate = () => (
    <div className="bg-white min-h-[1130px] w-full text-[12px] text-zinc-900 font-sans flex flex-col overflow-hidden shadow-2xl">
      <div className="p-16 flex justify-between items-end" style={{ backgroundColor: themeColor.value }}>
        <div className="text-white">
          <h2 className="text-[60px] font-black tracking-tighter leading-none mb-4">INVOICE</h2>
          <p className="text-white/80 font-medium tracking-widest uppercase text-base">#{invoiceNumber}</p>
        </div>
        <div className="text-right text-white">
          {logoUrl ? <img src={logoUrl} alt="Logo" className="max-h-20 object-contain bg-white rounded-2xl p-3 mb-6 ml-auto" crossOrigin="anonymous" /> : <h1 className="text-3xl font-bold mb-4">{companyName || 'Your Company'}</h1>}
          <p className="text-white/80 whitespace-pre-wrap leading-relaxed text-right">{companyAddress}</p>
          <p className="text-white/80 mt-1">{companyEmail}</p>
        </div>
      </div>
      <div className="p-16 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-16">
          <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100 flex-1 mr-12">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Bill To</p>
            <p className="font-bold text-2xl text-zinc-900 mb-2">{selectedClient?.name || 'Client Name'}</p>
            <p className="text-zinc-500 mb-1">{selectedClient?.email || 'client@email.com'}</p>
            {selectedClient?.address && <p className="text-zinc-600 whitespace-pre-wrap mt-3 leading-relaxed">{selectedClient.address}</p>}
          </div>
          <div className="w-72 space-y-5 pt-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <span className="text-[12px] font-semibold text-zinc-500 uppercase">Issue Date</span><span className="font-bold text-zinc-900">{issueDate}</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <span className="text-[12px] font-semibold text-zinc-500 uppercase">Due Date</span><span className="font-bold text-zinc-900">{dueDate}</span>
            </div>
          </div>
        </div>
        <table className="w-full text-left mb-16">
          <thead>
            <tr>
              <th className="py-5 border-b-2 border-zinc-900 text-[12px] font-bold uppercase tracking-widest text-zinc-900">Description</th>
              <th className="py-5 border-b-2 border-zinc-900 text-[12px] font-bold uppercase tracking-widest text-zinc-900 text-center w-24">Qty</th>
              <th className="py-5 border-b-2 border-zinc-900 text-[12px] font-bold uppercase tracking-widest text-zinc-900 text-right w-32">Price</th>
              <th className="py-5 border-b-2 border-zinc-900 text-[12px] font-bold uppercase tracking-widest text-zinc-900 text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-6 text-zinc-900 font-semibold text-sm">{item.description || 'Item'}</td>
                <td className="py-6 text-zinc-500 text-center">{item.quantity}</td>
                <td className="py-6 text-zinc-500 text-right">{fmt(item.unit_price)}</td>
                <td className="py-6 text-zinc-900 font-bold text-right text-sm">{fmt(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-auto flex justify-between items-end gap-12">
          <div className="flex-1 space-y-8">
            {paymentDetails && (<div><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Payment Details</p><p className="text-zinc-700 whitespace-pre-wrap leading-relaxed">{paymentDetails}</p></div>)}
            {notes && (<div><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Notes</p><p className="text-zinc-500 whitespace-pre-wrap leading-relaxed">{notes}</p></div>)}
          </div>
          <div className="w-96 bg-zinc-900 text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="space-y-4 mb-8 text-sm">
              <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span className="text-white">{fmt(subtotal)}</span></div>
              {discountAmount > 0 && <div className="flex justify-between text-zinc-400"><span>Discount</span><span className="text-white">−{fmt(discountAmount)}</span></div>}
              {taxRate > 0 && <div className="flex justify-between text-zinc-400"><span>Tax ({taxRate}%)</span><span className="text-white">{fmt(taxAmount)}</span></div>}
            </div>
            <div className="pt-8 border-t border-zinc-800 flex justify-between items-end">
              <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Total</span>
              <span className="text-4xl font-black leading-none" style={{ color: themeColor.value }}>{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEnterpriseTemplate = () => (
    <div className="bg-white min-h-[1130px] w-full text-[11px] text-zinc-800 font-sans p-16 border-[12px] border-zinc-50 flex flex-col shadow-2xl">
      <div className="flex justify-between items-start border-b-2 border-zinc-200 pb-10 mb-10">
        <div className="flex items-center gap-8">
          {logoUrl && <img src={logoUrl} alt="Logo" className="max-h-20 object-contain" crossOrigin="anonymous" />}
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 uppercase tracking-wide">{companyName || 'Your Company'}</h1>
            <p className="text-zinc-500 mt-1">{companyEmail}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-black tracking-tight text-zinc-900 uppercase">Invoice</h2>
          <p className="font-bold text-zinc-500 mt-2 text-lg">{invoiceNumber}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-10 mb-10">
        <div className="col-span-1 border border-zinc-200 p-5 rounded-xl bg-zinc-50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">From</p>
          <p className="font-bold text-zinc-900 text-sm">{companyName}</p>
          <p className="text-zinc-600 whitespace-pre-wrap mt-2">{companyAddress}</p>
        </div>
        <div className="col-span-1 border border-zinc-200 p-5 rounded-xl bg-zinc-50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Bill To</p>
          <p className="font-bold text-zinc-900 text-sm">{selectedClient?.name || 'Client Name'}</p>
          <p className="text-zinc-600 whitespace-pre-wrap mt-2">{selectedClient?.address}</p>
          <p className="text-zinc-600 mt-1">{selectedClient?.email}</p>
        </div>
        <div className="col-span-1 border border-zinc-200 rounded-xl overflow-hidden flex flex-col">
          <div className="flex-1 border-b border-zinc-200 p-5 flex justify-between items-center bg-white">
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Date</span><span className="font-bold text-zinc-900">{issueDate}</span>
          </div>
          <div className="flex-1 p-5 flex justify-between items-center bg-white">
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Due</span><span className="font-bold text-zinc-900">{dueDate}</span>
          </div>
        </div>
      </div>
      <table className="w-full text-left mb-10 border border-zinc-200">
        <thead>
          <tr className="bg-zinc-100 border-b border-zinc-200">
            <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-zinc-600 border-r border-zinc-200">Description</th>
            <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-zinc-600 text-center w-24 border-r border-zinc-200">Qty</th>
            <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-zinc-600 text-right w-32 border-r border-zinc-200">Price</th>
            <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-zinc-600 text-right w-36">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-b border-zinc-200 last:border-0">
              <td className="p-4 text-zinc-900 font-medium border-r border-zinc-200">{item.description || 'Item'}</td>
              <td className="p-4 text-zinc-600 text-center border-r border-zinc-200">{item.quantity}</td>
              <td className="p-4 text-zinc-600 text-right border-r border-zinc-200">{fmt(item.unit_price)}</td>
              <td className="p-4 text-zinc-900 font-bold text-right">{fmt(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-auto flex gap-10">
        <div className="flex-1 space-y-6">
          {paymentDetails && (<div className="border border-zinc-200 p-5 rounded-xl"><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Payment Details</p><p className="text-zinc-700 whitespace-pre-wrap">{paymentDetails}</p></div>)}
          {notes && (<div className="border border-zinc-200 p-5 rounded-xl bg-zinc-50"><p className="text-zinc-600 whitespace-pre-wrap italic">{notes}</p></div>)}
        </div>
        <div className="w-96 border border-zinc-200 rounded-xl overflow-hidden self-end">
          <div className="p-6 space-y-4 bg-white text-sm">
            <div className="flex justify-between text-zinc-600"><span>Subtotal</span><span className="font-medium">{fmt(subtotal)}</span></div>
            {discountAmount > 0 && <div className="flex justify-between text-zinc-600"><span>Discount</span><span className="font-medium">−{fmt(discountAmount)}</span></div>}
            {taxRate > 0 && <div className="flex justify-between text-zinc-600"><span>Tax ({taxRate}%)</span><span className="font-medium">{fmt(taxAmount)}</span></div>}
          </div>
          <div className="p-6 border-t border-zinc-200 flex justify-between items-center transition-colors duration-500" style={{ backgroundColor: themeColor.value }}>
            <span className="text-sm font-bold text-white uppercase tracking-widest">Total Due</span>
            <span className="text-2xl font-bold text-white">{fmt(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    // FULL SCREEN DESIGN TOOL WORKSPACE
    <div className="relative w-full h-[850px] bg-[#0A0A0A] overflow-hidden font-sans text-white flex select-none rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_-20px_rgba(16,185,129,0.2)]">
      
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-transparent to-[#10b981]/5 blur-[150px]"></div>

      {/* ══ LEFT PANEL: Data Entry ═══════════════════════════════════════ */}
      <div className="absolute left-6 top-6 bottom-6 w-[360px] z-20 flex flex-col pointer-events-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 px-2 text-white">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <FileBadge size={16} />
          </div>
          <h2 className="font-bold tracking-widest uppercase text-xs">Data Explorer</h2>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 pr-2">
          <SidebarPanel title="Your Business" icon={Building2}>
            <div><Label>Business Name</Label><GlassInput value={companyName} onChange={e => setCompanyName(e.target.value)} /></div>
            <div><Label>Email</Label><GlassInput type="email" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} /></div>
            <div><Label>Address</Label><GlassTextarea value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} rows={2} /></div>
            <div>
              <Label>Logo <span className="opacity-50 lowercase tracking-normal">(optional)</span></Label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => { setLogoUrl(ev.target?.result as string); };
                      reader.readAsDataURL(file);
                    } else { setLogoUrl(''); }
                  }}
                  className="w-full h-10 rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-[12px] text-white/50 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer focus:outline-none"
                />
                {logoUrl && <button type="button" onClick={() => setLogoUrl('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-rose-400 text-[10px] font-bold">Clear</button>}
              </div>
            </div>
          </SidebarPanel>

          <SidebarPanel title="Client Details" icon={User}>
            <div className="flex justify-between items-center mb-2">
              <Label>Select Client</Label>
              <button onClick={() => setIsClientModalOpen(true)} className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Plus size={10} /> Add New</button>
            </div>
            <GlassSelect value={clientId} onChange={e => setClientId(e.target.value)}>
              <option value="" disabled className="bg-zinc-900">Select client…</option>
              {clients.map(c => <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>)}
            </GlassSelect>
          </SidebarPanel>

          <SidebarPanel title="Line Items" icon={Layers}>
            <div className="space-y-2">
              <AnimatePresence>
                {items.map((item, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-2 relative group">
                    <input value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} placeholder="Description" className="w-full bg-transparent text-[13px] text-white placeholder:text-white/30 focus:outline-none font-medium" />
                    <div className="flex gap-2">
                      <div className="flex-1"><span className="text-[9px] uppercase tracking-wider text-white/30 ml-1">Qty</span><GlassInput type="number" min="1" value={item.quantity || ''} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="h-8 text-center" /></div>
                      <div className="flex-1"><span className="text-[9px] uppercase tracking-wider text-white/30 ml-1">Price</span><GlassInput type="number" step="0.01" value={item.unit_price || ''} onChange={e => handleItemChange(idx, 'unit_price', e.target.value)} className="h-8 text-right" /></div>
                    </div>
                    <button onClick={() => removeRow(idx)} disabled={items.length === 1} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-white/30 hover:text-rose-500 transition-opacity disabled:hidden"><Trash2 size={14} /></button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <button onClick={addRow} className="w-full h-10 mt-2 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest"><Plus size={14} /> Add Item</button>
            </div>
          </SidebarPanel>
        </div>
      </div>

      {/* ══ RIGHT PANEL: Properties ═══════════════════════════════════════ */}
      <div className="absolute right-6 top-6 bottom-6 w-[320px] z-20 flex flex-col pointer-events-auto">
        <div className="flex items-center gap-3 mb-6 px-2 text-white">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Settings2 size={16} />
          </div>
          <h2 className="font-bold tracking-widest uppercase text-xs">Properties</h2>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 pl-2">
          <SidebarPanel title="Invoice Settings" icon={FileText}>
            <div><Label>Invoice #</Label><GlassInput value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Issue Date</Label><GlassInput type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} /></div>
              <div><Label>Due Date</Label><GlassInput type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
            </div>
            <div>
              <Label>Currency</Label>
              <GlassSelect value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="USD" className="bg-zinc-900">USD ($)</option>
                <option value="EUR" className="bg-zinc-900">EUR (€)</option>
                <option value="GBP" className="bg-zinc-900">GBP (£)</option>
                <option value="BDT" className="bg-zinc-900">BDT (৳)</option>
              </GlassSelect>
            </div>
          </SidebarPanel>

          <SidebarPanel title="Payments" icon={CreditCard}>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tax (%)</Label><GlassInput type="number" min="0" max="100" step="0.01" value={taxRate || ''} onChange={e => setTaxRate(Math.max(0, parseFloat(e.target.value) || 0))} placeholder="0.0" /></div>
              <div>
                <Label>Discount</Label>
                <div className="flex h-10 rounded-xl bg-black/40 border border-white/10 overflow-hidden focus-within:border-white/30 transition-all">
                  <button onClick={() => setDiscountType('percent')} className={`px-3 text-[11px] font-bold transition-colors ${discountType === 'percent' ? 'bg-white/20 text-white' : 'text-white/40'}`}>%</button>
                  <button onClick={() => setDiscountType('flat')} className={`px-3 text-[11px] font-bold transition-colors border-l border-white/10 ${discountType === 'flat' ? 'bg-white/20 text-white' : 'text-white/40'}`}>$</button>
                  <input type="number" value={discountType === 'percent' ? (discountRate || '') : (discountVal || '')} onChange={e => discountType === 'percent' ? setDiscountRate(Math.max(0, parseFloat(e.target.value) || 0)) : setDiscountVal(Math.max(0, parseFloat(e.target.value) || 0))} className="flex-1 bg-transparent px-2 text-[13px] text-white focus:outline-none" placeholder="0" />
                </div>
              </div>
            </div>
            <div><Label>Payment Details</Label><GlassTextarea value={paymentDetails} onChange={e => setPaymentDetails(e.target.value)} rows={3} /></div>
            <div><Label>Footer Notes</Label><GlassTextarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} /></div>
          </SidebarPanel>
        </div>
      </div>

      {/* ══ TOP FLOATING TOOLBAR: Design Controls ═════════════════════════ */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <div className="h-[60px] p-2 pl-6 bg-[#18181B]/95 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
          
          {/* Templates */}
          <div className="flex items-center gap-3">
            <Paintbrush size={14} className="text-white/30" />
            <div className="flex bg-black/40 rounded-full p-1 border border-white/5">
              {TEMPLATES.map(t => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${template === t ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-white/10 mx-2"></div>

          {/* Colors */}
          <div className="flex items-center gap-2">
            {THEME_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => setThemeColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${themeColor.value === c.value ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-transparent hover:scale-110 hover:border-white/40'}`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-white/10 mx-2"></div>

          {/* Export */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="h-10 px-6 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_15px_-3px_rgba(16,185,129,0.3)] hover:from-emerald-300 hover:to-emerald-400 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 text-[#022c22] font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 ring-1 ring-black/10"
          >
            {isDownloading ? <span className="h-4 w-4 rounded-full border-2 border-[#022c22]/30 border-t-[#022c22] animate-spin" /> : <><Download size={15} strokeWidth={2.5} /> Export PDF</>}
          </button>
        </div>
      </div>


      {/* ══ CENTER STAGE: PDF Canvas ═══════════════════════════════════════ */}
      <div 
        ref={containerRef}
        className="flex-1 h-full flex items-center justify-center p-20 z-10 pointer-events-auto"
      >
        <div 
          className="relative transition-all duration-500 ease-out origin-center"
          style={{ transform: `scale(${scale})` }}
        >
          {/* Decorative glows behind the paper */}
          <div className="absolute inset-0 bg-white/5 blur-3xl rounded-[20px] scale-105 pointer-events-none" />
          <div className="absolute -inset-10 bg-black/50 blur-3xl -z-10 pointer-events-none" />
          
          <div className="relative w-[800px] bg-white text-black shadow-[0_20px_100px_-20px_rgba(0,0,0,1)] rounded-sm overflow-hidden select-text pointer-events-auto">
            <div ref={invoiceRef}>
              {template === 'modern' && renderModernTemplate()}
              {template === 'classic' && renderClassicTemplate()}
              {template === 'creative' && renderCreativeTemplate()}
              {template === 'enterprise' && renderEnterpriseTemplate()}
            </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="New Client" size="sm">
        <form onSubmit={handleQuickAddClient} className="space-y-4 pt-2 text-zinc-900">
          <div><label className="block text-xs font-bold text-zinc-500 mb-1">Client Name</label><input required value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} className="w-full h-10 px-3 border border-zinc-200 rounded-lg text-sm" /></div>
          <div><label className="block text-xs font-bold text-zinc-500 mb-1">Email</label><input type="email" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} className="w-full h-10 px-3 border border-zinc-200 rounded-lg text-sm" /></div>
          <div><label className="block text-xs font-bold text-zinc-500 mb-1">Address</label><textarea rows={3} value={newClient.address} onChange={e => setNewClient({ ...newClient, address: e.target.value })} className="w-full p-3 border border-zinc-200 rounded-lg text-sm resize-none" /></div>
          <div className="flex justify-end pt-4"><Button type="submit">Save Client</Button></div>
        </form>
      </Modal>

    </div>
  );
}
