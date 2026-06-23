'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Calendar as CalIcon, ChevronDown, Check, Type, ArrowRight, Save, Download, Image as ImageIcon } from 'lucide-react';

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

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
];

// --- Design Tool UI Components ---
const SidebarPanel = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
  <div className="mb-6 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
    <div className="flex items-center gap-2 mb-4 text-zinc-800">
      <Icon size={16} className="text-emerald-500" />
      <h3 className="text-[13px] font-bold uppercase tracking-widest">{title}</h3>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
    {children}
  </label>
);

const CleanInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full h-10 rounded-lg bg-zinc-50 border border-zinc-200 px-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all ${props.className || ''}`}
  />
);

const CleanSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="relative group">
    <select
      {...props}
      className={`w-full h-10 rounded-lg bg-zinc-50 border border-zinc-200 pl-3 pr-8 text-[13px] text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer ${props.className || ''}`}
    >
      {props.children}
    </select>
    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-focus-within:text-emerald-500 transition-colors" />
  </div>
);

const CleanTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full rounded-lg bg-zinc-50 border border-zinc-200 p-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none ${props.className || ''}`}
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

  const [clientName, setClientName]       = useState('John Doe');
  const [clientEmail, setClientEmail]     = useState('john@example.com');
  const [clientAddress, setClientAddress] = useState('456 Client St\nNew York, NY 10001');

  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-001');
  const [issueDate, setIssueDate]         = useState('');
  const [dueDate, setDueDate]             = useState('');

  useEffect(() => {
    setIssueDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  }, []);
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

  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading]         = useState(false);
  const [scale, setScale] = useState(1);

  // --- Scale Logic to Fit Screen ---
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w === 0) return;
        const padding = 64;
        const scaleW = (w - padding) / 800;
        setScale(Math.min(scaleW, 1));
      }
    };
    handleResize();
    const timer = setTimeout(handleResize, 100);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [showPreview]);

  // --- Calcs ---
  const subtotal       = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const discountAmount = discountType === 'percent' ? subtotal * (discountRate / 100) : discountVal;
  const taxableAmount  = Math.max(0, subtotal - discountAmount);
  const taxAmount      = taxableAmount * (taxRate / 100);
  const total          = taxableAmount + taxAmount;

  const currentSymbol  = CURRENCIES.find(c => c.code === currency)?.symbol || '$';
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

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setIsDownloading(true);
    
    const currentScale = scale;
    if (scale !== 1) {
      setScale(1);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    try {
      const htmlToImageModule = await import('html-to-image');
      const toPng = htmlToImageModule.toPng;
      
      const jsPDFModule = await import('jspdf') as any;
      const JsPDFClass = jsPDFModule.default?.jsPDF || (typeof jsPDFModule.default === 'function' ? jsPDFModule.default : jsPDFModule.jsPDF);
      
      const imgData = await toPng(invoiceRef.current, { backgroundColor: '#ffffff', pixelRatio: 3 });
      
      const node = invoiceRef.current;
      const pdf     = new JsPDFClass('p', 'mm', 'a4');
      const pw      = pdf.internal.pageSize.getWidth();
      const ph      = (node.offsetHeight * pw) / node.offsetWidth;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pw, ph);
      pdf.save(`${invoiceNumber || 'Invoice'}.pdf`);
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      alert('Failed to generate PDF: ' + (err?.message || err));
    } finally {
      if (scale !== 1) setScale(currentScale);
      setIsDownloading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // PROFESSIONAL TEMPLATES
  // ---------------------------------------------------------------------------

  const renderModernTemplate = () => (
    <div className="bg-white min-h-[1130px] w-full text-[12px] text-zinc-800 font-sans p-16 relative flex flex-col shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-3" style={{ backgroundColor: themeColor.value }} />
      <div className="flex justify-between items-start mb-16 mt-4">
        <div>
          {logoUrl ? <img src={logoUrl} alt="Logo" className="max-h-16 mb-4 object-contain" /> : <h1 className="text-3xl font-bold tracking-tight mb-2 text-zinc-900">{companyName || 'Your Company'}</h1>}
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
          <p className="font-semibold text-lg text-zinc-900">{clientName}</p>
          <p className="text-zinc-600 whitespace-pre-wrap mt-1 leading-relaxed">{clientAddress}</p>
          <p className="text-zinc-500 mt-1">{clientEmail}</p>
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
          {logoUrl && <img src={logoUrl} alt="Logo" className="max-h-20 mb-8 object-contain" />}
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
        <p className="font-bold text-lg text-zinc-900">{clientName}</p>
        <p className="text-zinc-600 whitespace-pre-wrap mt-2 leading-relaxed">{clientAddress}</p>
        <p className="text-zinc-600 mt-1">{clientEmail}</p>
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
          {logoUrl ? <img src={logoUrl} alt="Logo" className="max-h-20 object-contain bg-white rounded-2xl p-3 mb-6 ml-auto" /> : <h1 className="text-3xl font-bold mb-4">{companyName || 'Your Company'}</h1>}
          <p className="text-white/80 whitespace-pre-wrap leading-relaxed text-right">{companyAddress}</p>
          <p className="text-white/80 mt-1">{companyEmail}</p>
        </div>
      </div>
      <div className="p-16 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-16">
          <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100 flex-1 mr-12">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Bill To</p>
            <p className="font-bold text-2xl text-zinc-900 mb-2">{clientName}</p>
            <p className="text-zinc-500 mb-1">{clientEmail}</p>
            <p className="text-zinc-600 whitespace-pre-wrap mt-3 leading-relaxed">{clientAddress}</p>
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
          {logoUrl && <img src={logoUrl} alt="Logo" className="max-h-20 object-contain" />}
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
          <p className="font-bold text-zinc-900 text-sm">{clientName}</p>
          <p className="text-zinc-600 whitespace-pre-wrap mt-2">{clientAddress}</p>
          <p className="text-zinc-600 mt-1">{clientEmail}</p>
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

  if (showPreview) {
    return (
      <div className="w-full flex flex-col items-center bg-zinc-100 py-12 px-4 min-h-screen font-sans">
        <div className="w-full max-w-4xl flex justify-between items-center mb-8">
          <button 
            onClick={() => setShowPreview(false)}
            className="px-6 py-3 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all"
          >
            ← Back to Editor
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isDownloading ? <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><Download size={18} strokeWidth={2.5} /> Download PDF</>}
          </button>
        </div>
        <div ref={containerRef} className="w-full flex justify-center overflow-x-auto pb-24">
          <div 
            className="relative transition-all duration-300 ease-out origin-top"
            style={{ transform: `scale(${scale})` }}
          >
            <div className="absolute inset-0 bg-black/5 blur-2xl rounded-[20px] scale-105 pointer-events-none -z-10" />
            <div className="relative w-[800px] bg-white text-black shadow-2xl rounded-sm overflow-hidden select-text pointer-events-auto border border-zinc-200">
              <div ref={invoiceRef}>
                {template === 'modern' && renderModernTemplate()}
                {template === 'classic' && renderClassicTemplate()}
                {template === 'creative' && renderCreativeTemplate()}
                {template === 'enterprise' && renderEnterpriseTemplate()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto bg-white sm:p-12 p-6 font-sans text-zinc-900">
      
      {/* --- TOP SECTION (2 COLUMNS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-10">
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <Label>Logo</Label>
            <div className="relative border border-zinc-200 rounded-xl p-4 flex items-center gap-4 hover:bg-zinc-50 cursor-pointer transition-colors h-[76px]">
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
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-8 h-8 rounded border border-zinc-200 flex items-center justify-center bg-white text-zinc-500">
                <ImageIcon size={14} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-800 underline decoration-zinc-300 underline-offset-4">Upload file</p>
                <p className="text-[11px] text-zinc-400 mt-1 uppercase tracking-wide">JPG, JPEG, PNG, less than 5MB</p>
              </div>
              {logoUrl && <button type="button" onClick={(e) => { e.preventDefault(); setLogoUrl(''); }} className="absolute right-4 text-xs font-bold text-rose-500 z-20 hover:underline">Clear</button>}
            </div>
          </div>
          <div>
            <Label>Your company details</Label>
            <CleanTextarea 
              value={companyName + (companyAddress ? '\n' + companyAddress : '')} 
              onChange={e => {
                const lines = e.target.value.split('\n');
                setCompanyName(lines[0] || '');
                setCompanyAddress(lines.slice(1).join('\n'));
              }} 
              rows={3} 
              className="resize-none h-[88px]"
            />
          </div>
          <div>
            <Label>Date issued</Label>
            <div className="relative">
              <CleanInput type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="appearance-none" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div>
            <Label>Invoice number</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">#</span>
              <CleanInput value={invoiceNumber.replace('#', '')} onChange={e => setInvoiceNumber(e.target.value)} className="pl-7 h-[76px] text-lg font-medium" />
            </div>
          </div>
          <div>
            <Label>Bill to</Label>
            <CleanTextarea 
              value={clientName + (clientAddress ? '\n' + clientAddress : '')} 
              onChange={e => {
                const lines = e.target.value.split('\n');
                setClientName(lines[0] || '');
                setClientAddress(lines.slice(1).join('\n'));
              }} 
              rows={3}
              className="resize-none h-[88px]" 
            />
          </div>
          <div>
            <Label>Due date</Label>
            <div className="relative">
              <CleanInput type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="appearance-none" />
            </div>
          </div>
        </div>
      </div>

      {/* --- LINE ITEMS --- */}
      <div className="bg-zinc-50/50 rounded-[1.5rem] p-6 mb-10 border border-zinc-100">
        <div className="hidden md:flex items-center gap-4 px-2 pb-3">
          <div className="flex-1 text-xs font-bold text-zinc-400 uppercase tracking-widest">Item</div>
          <div className="w-24 text-xs font-bold text-zinc-400 uppercase tracking-widest text-center">Rate</div>
          <div className="w-20 text-xs font-bold text-zinc-400 uppercase tracking-widest text-center">Qty</div>
          <div className="w-32 text-xs font-bold text-zinc-400 uppercase tracking-widest text-center">Amount</div>
          <div className="w-8"></div>
        </div>
        
        <div className="space-y-4 mb-8">
          <AnimatePresence initial={false}>
            {items.map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-white md:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none border border-zinc-100 md:border-none shadow-sm md:shadow-none relative group">
                <div className="flex-1 w-full">
                  <span className="md:hidden text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block ml-1">Item Description</span>
                  <CleanInput value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} className="bg-zinc-50/50 md:bg-white border-zinc-200 h-12 shadow-sm" placeholder="Item description" />
                </div>
                <div className="w-full md:w-24 relative">
                  <span className="md:hidden text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block ml-1">Rate</span>
                  <span className="absolute left-3 top-1/2 md:top-1/2 md:-translate-y-1/2 translate-y-1 text-zinc-400 font-medium">{currentSymbol}</span>
                  <CleanInput type="number" step="0.01" value={item.unit_price || ''} onChange={e => handleItemChange(idx, 'unit_price', e.target.value)} className="pl-7 bg-zinc-50/50 md:bg-white border-zinc-200 text-center h-12 shadow-sm" placeholder="0.00" />
                </div>
                <div className="w-full md:w-20">
                  <span className="md:hidden text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block ml-1">Quantity</span>
                  <CleanInput type="number" min="1" value={item.quantity || ''} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="bg-zinc-50/50 md:bg-white border-zinc-200 text-center h-12 shadow-sm" placeholder="1" />
                </div>
                <div className="w-full md:w-32 relative">
                   <span className="md:hidden text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block ml-1">Amount</span>
                   <span className="absolute left-3 top-1/2 md:top-1/2 md:-translate-y-1/2 translate-y-1 text-zinc-400 font-medium">{currentSymbol}</span>
                   <CleanInput disabled value={item.amount} className="pl-7 bg-zinc-100 md:bg-zinc-50/50 border-zinc-200 text-center font-semibold h-12 shadow-sm" />
                </div>
                <button onClick={() => removeRow(idx)} disabled={items.length === 1} className="absolute right-2 top-2 md:relative md:right-0 md:top-0 w-8 h-8 flex items-center justify-center text-zinc-300 md:text-zinc-400 hover:text-rose-500 transition-colors disabled:opacity-0"><Trash2 size={18} /></button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="flex flex-col items-center justify-center">
          <button onClick={addRow} className="w-11 h-11 bg-[#2563EB] hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95"><Plus size={22} /></button>
          <span className="text-[#2563EB] text-sm font-bold mt-3">Add Item</span>
        </div>
      </div>

      {/* --- TOTALS & NOTES --- */}
      <div className="flex flex-col md:flex-row gap-12 mb-12">
        <div className="flex-1 space-y-6">
          <div>
            <Label>Notes</Label>
            <CleanTextarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="h-[88px] resize-none" placeholder="Thank you for your business." />
          </div>
          <div>
            <Label>Payment Instructions</Label>
            <CleanTextarea value={paymentDetails} onChange={e => setPaymentDetails(e.target.value)} rows={3} className="h-[88px] resize-none" placeholder="Bank details, payment links, etc." />
          </div>
        </div>
        
        <div className="w-full md:w-80 space-y-4">
          <div className="flex justify-between items-center text-sm px-2">
            <span className="font-bold text-zinc-700">Subtotal</span>
            <span className="font-bold text-zinc-900 text-xl">{fmt(subtotal)}</span>
          </div>
          
          <div className="flex justify-between items-center gap-4 text-sm mt-6">
            <span className="font-medium text-zinc-500 pl-2">Tax</span>
            <div className="relative w-36">
               <CleanInput type="number" min="0" value={taxRate || ''} onChange={e => setTaxRate(Math.max(0, parseFloat(e.target.value) || 0))} placeholder="0.00" className="pr-8 text-right h-11 rounded-xl border-zinc-200 shadow-sm" />
               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">%</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center gap-4 text-sm">
            <span className="font-medium text-zinc-500 pl-2">Discount</span>
            <div className="relative w-36 flex">
              <button type="button" onClick={() => setDiscountType('percent')} className={`px-3 text-xs font-bold rounded-l-xl border-y border-l transition-colors ${discountType === 'percent' ? 'bg-zinc-200 border-zinc-300 text-zinc-900' : 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-zinc-100'}`}>%</button>
              <button type="button" onClick={() => setDiscountType('flat')} className={`px-3 text-xs font-bold border-y border-l transition-colors ${discountType === 'flat' ? 'bg-zinc-200 border-zinc-300 text-zinc-900' : 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-zinc-100'}`}>$</button>
              <CleanInput type="number" value={discountType === 'percent' ? (discountRate || '') : (discountVal || '')} onChange={e => discountType === 'percent' ? setDiscountRate(Math.max(0, parseFloat(e.target.value) || 0)) : setDiscountVal(Math.max(0, parseFloat(e.target.value) || 0))} placeholder="0.00" className="flex-1 rounded-none rounded-r-xl border-zinc-200 text-right h-11 shadow-sm" />
            </div>
          </div>
          
          <div className="pt-6 mt-4 flex justify-between items-center px-2">
            <span className="font-bold text-[#2563EB] text-base">Total</span>
            <span className="font-bold text-[#2563EB] text-2xl">{fmt(total)}</span>
          </div>
        </div>
      </div>

      {/* --- TEMPLATE & SETTINGS SELECTION --- */}
      <section className="pt-8 border-t border-zinc-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Design Style</label>
              <div className="flex gap-2">
                {TEMPLATES.map(t => (
                  <button key={t} type="button" onClick={() => setTemplate(t)} className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${template === t ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Accent Color</label>
              <div className="flex gap-2">
                {THEME_COLORS.map(c => (
                  <button key={c.value} type="button" onClick={() => setThemeColor(c)} className={`w-6 h-6 rounded-full transition-all ${themeColor.value === c.value ? 'ring-2 ring-offset-2 ring-zinc-900' : 'hover:scale-110'}`} style={{ backgroundColor: c.value }} title={c.name} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Currency</label>
              <CleanSelect value={currency} onChange={e => setCurrency(e.target.value)} className="h-[30px] text-xs py-1">
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                ))}
              </CleanSelect>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-8 flex justify-end">
            <button 
              onClick={() => setShowPreview(true)}
              className="w-full md:w-auto px-10 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-base rounded-xl shadow-xl shadow-zinc-900/20 transition-all active:scale-[0.98]"
            >
              Preview & Download PDF
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
