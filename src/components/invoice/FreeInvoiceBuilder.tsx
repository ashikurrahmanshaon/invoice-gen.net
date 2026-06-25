'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronDown, Download, Image as ImageIcon } from 'lucide-react';

// --- Types ---
interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
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

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[10px] font-bold text-zinc-450 dark:text-zinc-500 mb-1.5 uppercase tracking-wider">
    {children}
  </label>
);

const CleanInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full h-10 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/80 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 px-3.5 text-[13px] font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 placeholder:font-normal focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200 ${props.className || ''}`}
  />
);

const CleanSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="relative group w-full">
    <select
      {...props}
      className={`w-full h-10 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/80 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 pl-3.5 pr-9 text-[13px] font-medium text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200 appearance-none cursor-pointer ${props.className || ''}`}
    >
      {props.children}
    </select>
    <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none group-focus-within:text-emerald-500 transition-colors" />
  </div>
);

const CleanTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/80 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 p-3 text-[13px] font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 placeholder:font-normal focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200 resize-none ${props.className || ''}`}
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

  const [mobileTab, setMobileTab] = useState<'info' | 'items' | 'payment'>('info');

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [scale, setScale] = useState(1);

  // --- Scale Logic to Fit Screen ---
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w === 0) return;
        const padding = 32;
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
    <div className="bg-white min-h-[1120px] w-full text-[12px] text-zinc-800 font-sans p-16 relative flex flex-col">
      <div className="absolute top-0 left-0 w-full h-3" style={{ backgroundColor: themeColor.value }} />
      <div className="flex justify-between items-start mb-16 mt-4">
        <div>
          {logoUrl ? <img src={logoUrl} alt="Logo" className="max-h-16 mb-4 object-contain" /> : <h1 className="text-3xl font-bold tracking-tight mb-2 text-zinc-900">{companyName || 'Your Company'}</h1>}
          <p className="text-zinc-505 whitespace-pre-wrap leading-relaxed">{companyAddress}</p>
          <p className="text-zinc-505 mt-1">{companyEmail}</p>
        </div>
        <div className="text-right">
          <h2 className="text-5xl font-light tracking-tight text-zinc-200 uppercase mb-2">Invoice</h2>
          <p className="font-semibold text-zinc-900 text-xl">{invoiceNumber}</p>
        </div>
      </div>
      <div className="flex justify-between items-end mb-16">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Billed To</p>
          <p className="font-semibold text-lg text-zinc-900">{clientName}</p>
          <p className="text-zinc-600 whitespace-pre-wrap mt-1 leading-relaxed">{clientAddress}</p>
          <p className="text-zinc-505 mt-1">{clientEmail}</p>
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
              <td className="py-5 text-zinc-505 text-center">{item.quantity}</td>
              <td className="py-5 text-zinc-550 text-right">{fmt(item.unit_price)}</td>
              <td className="py-5 text-zinc-900 font-semibold text-right">{fmt(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-auto flex justify-between items-start gap-12">
        <div className="flex-1 space-y-8">
          {paymentDetails && (<div><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Payment Instructions</p><p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">{paymentDetails}</p></div>)}
          {notes && (<div><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Notes</p><p className="text-zinc-505 leading-relaxed whitespace-pre-wrap">{notes}</p></div>)}
        </div>
        <div className="w-80 bg-zinc-50 rounded-2xl p-8 border border-zinc-100">
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-zinc-505"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            {discountAmount > 0 && <div className="flex justify-between text-zinc-505"><span>Discount</span><span>−{fmt(discountAmount)}</span></div>}
            {taxRate > 0 && <div className="flex justify-between text-zinc-505"><span>Tax ({taxRate}%)</span><span>{fmt(taxAmount)}</span></div>}
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
    <div className="bg-white min-h-[1120px] w-full text-[12px] text-zinc-900 font-serif p-16 flex flex-col border-[1px] border-zinc-200">
      <div className="flex justify-between items-start mb-16">
        <div className="w-1/2">
          {logoUrl && <img src={logoUrl} alt="Logo" className="max-h-20 mb-8 object-contain" />}
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">{companyName || 'Your Company'}</h1>
          <p className="text-zinc-650 whitespace-pre-wrap leading-relaxed">{companyAddress}</p>
          <p className="text-zinc-650 mt-1">{companyEmail}</p>
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
          <tr className="border-y-2 border-zinc-900 bg-zinc-55">
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
              {discountAmount > 0 && <tr><td className="py-2 text-zinc-600">Discount</td><td className="py-2 text-red-650 font-medium">−{fmt(discountAmount)}</td></tr>}
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
    <div className="bg-white min-h-[1120px] w-full text-[12px] text-zinc-900 font-sans flex flex-col overflow-hidden">
      <div className="p-16 flex justify-between items-end" style={{ backgroundColor: themeColor.value }}>
        <div className="text-white">
          <h2 className="text-[60px] font-black tracking-tighter leading-none mb-4 animate-fade-in">INVOICE</h2>
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
            <p className="text-zinc-505 mb-1">{clientEmail}</p>
            <p className="text-zinc-605 whitespace-pre-wrap mt-3 leading-relaxed">{clientAddress}</p>
          </div>
          <div className="w-72 space-y-5 pt-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <span className="text-[12px] font-semibold text-zinc-550 uppercase">Issue Date</span><span className="font-bold text-zinc-900">{issueDate}</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <span className="text-[12px] font-semibold text-zinc-550 uppercase">Due Date</span><span className="font-bold text-zinc-900">{dueDate}</span>
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
                <td className="py-6 text-zinc-505 text-center">{item.quantity}</td>
                <td className="py-6 text-zinc-505 text-right">{fmt(item.unit_price)}</td>
                <td className="py-6 text-zinc-900 font-bold text-right text-sm">{fmt(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-auto flex justify-between items-end gap-12">
          <div className="flex-1 space-y-8">
            {paymentDetails && (<div><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Payment Details</p><p className="text-zinc-700 whitespace-pre-wrap leading-relaxed">{paymentDetails}</p></div>)}
            {notes && (<div><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Notes</p><p className="text-zinc-505 whitespace-pre-wrap leading-relaxed">{notes}</p></div>)}
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
    <div className="bg-white min-h-[1120px] w-full text-[11px] text-zinc-800 font-sans p-16 border-[12px] border-zinc-50 flex flex-col">
      <div className="flex justify-between items-start border-b-2 border-zinc-200 pb-10 mb-10">
        <div className="flex items-center gap-8">
          {logoUrl && <img src={logoUrl} alt="Logo" className="max-h-20 object-contain" />}
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 uppercase tracking-wide">{companyName || 'Your Company'}</h1>
            <p className="text-zinc-505 mt-1">{companyEmail}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-black tracking-tight text-zinc-900 uppercase">Invoice</h2>
          <p className="font-bold text-zinc-505 mt-2 text-lg">{invoiceNumber}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-10 mb-10">
        <div className="col-span-1 border border-zinc-200 p-5 rounded-xl bg-zinc-50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">From</p>
          <p className="font-bold text-zinc-900 text-sm">{companyName}</p>
          <p className="text-zinc-606 whitespace-pre-wrap mt-2">{companyAddress}</p>
        </div>
        <div className="col-span-1 border border-zinc-200 p-5 rounded-xl bg-zinc-50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Bill To</p>
          <p className="font-bold text-zinc-900 text-sm">{clientName}</p>
          <p className="text-zinc-606 whitespace-pre-wrap mt-2">{clientAddress}</p>
          <p className="text-zinc-606 mt-1">{clientEmail}</p>
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
              <td className="p-4 text-zinc-606 text-center border-r border-zinc-200">{item.quantity}</td>
              <td className="p-4 text-zinc-606 text-right border-r border-zinc-200">{fmt(item.unit_price)}</td>
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
      <div className="w-full bg-zinc-50/50 dark:bg-zinc-950/20 p-4 sm:p-8 flex flex-col items-center min-h-[500px]">
        <div className="w-full max-w-3xl flex justify-between items-center mb-6 no-print">
          <button 
            type="button"
            onClick={() => setShowPreview(false)}
            className="px-4 py-2.5 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            ← Edit Invoice
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            style={{ backgroundColor: themeColor.value }}
            className="px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50 hover:brightness-105"
          >
            {isDownloading ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><Download size={14} strokeWidth={2.5} /> Download PDF</>}
          </button>
        </div>
        
        {/* Invoice Page Container */}
        <div ref={containerRef} className="w-full flex justify-center overflow-x-auto pb-8 select-none">
          <div 
            className="relative transition-all duration-300 ease-out origin-top"
            style={{ transform: `scale(${scale})` }}
          >
            <div className="absolute inset-0 bg-black/5 dark:bg-black/20 blur-xl rounded-xl pointer-events-none -z-10" />
            <div className="relative w-[800px] bg-white text-black shadow-lg rounded-sm overflow-hidden select-text pointer-events-auto border border-zinc-200/50">
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
    <div className="w-full bg-white dark:bg-[#0B0B0B] p-4 sm:p-6 md:p-8 font-sans text-zinc-900 dark:text-zinc-150 rounded-2xl relative pb-20 md:pb-8">
      
      {/* Mobile Tab Navigation */}
      <div className="md:hidden flex p-1 bg-zinc-100 dark:bg-zinc-900/90 backdrop-blur-md rounded-xl mb-5 border border-zinc-200/50 dark:border-zinc-800/55 sticky top-[56px] z-30">
        <button
          type="button"
          onClick={() => setMobileTab('info')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
            mobileTab === 'info'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          📄 Info
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('items')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
            mobileTab === 'items'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          📋 Items ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('payment')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
            mobileTab === 'payment'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          ⚙️ Config
        </button>
      </div>

      {/* --- TOP SECTION (2 COLUMNS) --- */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6 ${mobileTab === 'info' ? 'block' : 'hidden md:grid'}`}>
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <Label>Logo</Label>
            <div className="relative rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/80 hover:bg-zinc-100/55 dark:hover:bg-zinc-800/40 p-3.5 flex items-center gap-3.5 cursor-pointer transition-all duration-200 h-[68px] group">
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
              <div className="w-9 h-9 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-105 transition-transform duration-300">
                <ImageIcon size={16} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">Upload Logo</p>
                <p className="text-[9px] text-zinc-400 dark:text-zinc-550 mt-0.5 uppercase tracking-wider font-medium">JPG, PNG &lt; 5MB</p>
              </div>
              {logoUrl && <button type="button" onClick={(e) => { e.preventDefault(); setLogoUrl(''); }} className="absolute right-4 text-[10px] font-black uppercase tracking-wider text-rose-500 z-20 hover:text-rose-600">Clear</button>}
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
              className="resize-none h-[80px]"
              placeholder="Your Company Name&#10;Address Line 1&#10;Address Line 2"
            />
          </div>
          <div>
            <Label>Date issued</Label>
            <CleanInput type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="appearance-none" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <Label>Invoice number</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-450 dark:text-zinc-500 font-medium text-[13px]">#</span>
              <CleanInput value={invoiceNumber.replace('#', '')} onChange={e => setInvoiceNumber(e.target.value)} className="pl-7 h-10 text-[13px] font-medium" />
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
              className="resize-none h-[80px]" 
              placeholder="Client Name&#10;Address Line 1&#10;Address Line 2"
            />
          </div>
          <div>
            <Label>Due date</Label>
            <CleanInput type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="appearance-none" />
          </div>
        </div>
      </div>

      {/* --- LINE ITEMS --- */}
      <div className={`bg-zinc-50/40 dark:bg-zinc-950/20 rounded-2xl p-3 sm:p-5 mb-8 border border-zinc-200/55 dark:border-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.01)] ${mobileTab === 'items' ? 'block' : 'hidden md:block'}`}>
        <div className="hidden md:flex items-center gap-3 px-2 pb-2">
          <div className="flex-1 text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Item Description</div>
          <div className="w-24 text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider text-center">Rate</div>
          <div className="w-20 text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider text-center">Qty</div>
          <div className="w-28 text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider text-center">Amount</div>
          <div className="w-8"></div>
        </div>
        
        <div className="space-y-3 mb-6">
          <AnimatePresence initial={false}>
            {items.map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }} 
                className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white dark:bg-zinc-900/40 md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none border border-zinc-200/60 dark:border-zinc-800/80 md:border-none shadow-sm md:shadow-none relative group"
              >
                <div className="flex-1 w-full">
                  <span className="md:hidden text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1 block ml-1">Item Description</span>
                  <CleanInput value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} className="bg-zinc-50/30 md:bg-white dark:md:bg-zinc-950/40 border-zinc-200 dark:border-zinc-850 h-9" placeholder="Item description" />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="w-1/2 md:w-24 relative">
                    <span className="md:hidden text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1 block ml-1">Rate</span>
                    <span className="absolute left-3 top-[26px] md:top-1/2 md:-translate-y-1/2 text-zinc-400 dark:text-zinc-500 text-xs font-semibold">{currentSymbol}</span>
                    <CleanInput type="number" step="0.01" value={item.unit_price || ''} onChange={e => handleItemChange(idx, 'unit_price', e.target.value)} className="pl-6 bg-zinc-50/30 md:bg-white dark:md:bg-zinc-950/40 border-zinc-200 dark:border-zinc-855 text-right md:text-center h-9" placeholder="0.00" />
                  </div>
                  <div className="w-1/2 md:w-20">
                    <span className="md:hidden text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1 block ml-1">Qty</span>
                    <CleanInput type="number" min="1" value={item.quantity || ''} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="bg-zinc-50/30 md:bg-white dark:md:bg-zinc-950/40 border-zinc-200 dark:border-zinc-855 text-center h-9" placeholder="1" />
                  </div>
                </div>
                <div className="w-full md:w-28 relative">
                   <span className="md:hidden text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1 block ml-1">Amount</span>
                   <span className="absolute left-3 top-[26px] md:top-1/2 md:-translate-y-1/2 text-zinc-450 dark:text-zinc-550 text-xs font-semibold">{currentSymbol}</span>
                   <CleanInput disabled value={fmt(item.amount).replace(currentSymbol, '').trim()} className="pl-6 bg-zinc-100/65 dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800/85 text-right md:text-center font-bold h-9 opacity-80" />
                </div>
                <button 
                  type="button"
                  onClick={() => removeRow(idx)} 
                  disabled={items.length === 1} 
                  className="absolute right-2 top-2 md:relative md:right-0 md:top-0 w-7 h-7 flex items-center justify-center text-zinc-450 dark:text-zinc-550 hover:text-rose-500 dark:hover:text-rose-400 transition-colors disabled:opacity-0"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="flex flex-col items-center justify-center">
          <button 
            type="button"
            onClick={addRow} 
            style={{ backgroundColor: themeColor.value }}
            className="w-9 h-9 text-white rounded-full flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
          <span className="text-[11px] font-bold mt-2" style={{ color: themeColor.value }}>Add Item</span>
        </div>
      </div>

      {/* --- TOTALS & NOTES --- */}
      <div className={`flex flex-col md:flex-row gap-8 mb-8 ${mobileTab === 'payment' ? 'flex' : 'hidden md:flex'}`}>
        <div className="flex-1 space-y-4">
          <div>
            <Label>Notes</Label>
            <CleanTextarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="h-[76px] resize-none" placeholder="Thank you for your business." />
          </div>
          <div>
            <Label>Payment Instructions</Label>
            <CleanTextarea value={paymentDetails} onChange={e => setPaymentDetails(e.target.value)} rows={3} className="h-[76px] resize-none" placeholder="Bank details, payment links, etc." />
          </div>
        </div>
        
        <div className="w-full md:w-80 space-y-3 animate-fade-in">
          <div className="flex justify-between items-center text-sm px-2">
            <span className="font-bold text-zinc-550 dark:text-zinc-450">Subtotal</span>
            <span className="font-bold text-zinc-900 dark:text-white text-base">{fmt(subtotal)}</span>
          </div>
          
          <div className="flex justify-between items-center gap-4 text-sm">
            <span className="font-medium text-zinc-455 dark:text-zinc-500 pl-2">Tax (%)</span>
            <div className="relative w-28">
               <CleanInput type="number" min="0" value={taxRate || ''} onChange={e => setTaxRate(Math.max(0, parseFloat(e.target.value) || 0))} placeholder="0.00" className="pr-6 text-right h-9 rounded-xl border-zinc-200 dark:border-zinc-800" />
               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-450 dark:text-zinc-550 font-medium">%</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center gap-4 text-sm">
            <span className="font-medium text-zinc-455 dark:text-zinc-500 pl-2">Discount</span>
            <div className="relative w-36 flex">
              <button type="button" onClick={() => setDiscountType('percent')} className={`px-2 text-[10px] font-bold rounded-l-xl border-y border-l transition-colors ${discountType === 'percent' ? 'bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-650 text-zinc-900 dark:text-white' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-450 dark:text-zinc-550 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>%</button>
              <button type="button" onClick={() => setDiscountType('flat')} className={`px-2 text-[10px] font-bold border-y border-l transition-colors ${discountType === 'flat' ? 'bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-650 text-zinc-900 dark:text-white' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-450 dark:text-zinc-550 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>$</button>
              <CleanInput type="number" value={discountType === 'percent' ? (discountRate || '') : (discountVal || '')} onChange={e => discountType === 'percent' ? setDiscountRate(Math.max(0, parseFloat(e.target.value) || 0)) : setDiscountVal(Math.max(0, parseFloat(e.target.value) || 0))} placeholder="0.00" className="flex-1 rounded-none rounded-r-xl border-zinc-200 dark:border-zinc-800 text-right h-9 shadow-sm" />
            </div>
          </div>
          
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center px-2">
            <span className="font-bold text-zinc-900 dark:text-white text-base">Total</span>
            <span className="font-extrabold text-xl animate-pulse-once" style={{ color: themeColor.value }}>{fmt(total)}</span>
          </div>
        </div>
      </div>

      {/* --- TEMPLATE & SETTINGS SELECTION --- */}
      <section className={`pt-6 border-t border-zinc-200/50 dark:border-zinc-900/50 ${mobileTab === 'payment' ? 'block' : 'hidden md:block'}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 block">Design Style</label>
              <div className="flex gap-1.5">
                {TEMPLATES.map(t => (
                  <button key={t} type="button" onClick={() => setTemplate(t)} className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${template === t ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/80'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 block">Accent Color</label>
              <div className="flex gap-1.5">
                {THEME_COLORS.map(c => (
                  <button key={c.value} type="button" onClick={() => setThemeColor(c)} className={`w-5 h-5 rounded-full transition-all ${themeColor.value === c.value ? 'ring-2 ring-offset-2 ring-zinc-900 dark:ring-white scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: c.value }} title={c.name} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 block">Currency</label>
              <CleanSelect value={currency} onChange={e => setCurrency(e.target.value)} className="h-8 text-xs py-0.5">
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                ))}
              </CleanSelect>
            </div>
          </div>
          
          {/* Actions */}
          <div className="w-full md:w-auto flex justify-end">
            <button 
              type="button"
              onClick={() => setShowPreview(true)}
              style={{ backgroundColor: themeColor.value }}
              className="w-full md:w-auto px-8 py-3 text-white font-bold text-sm rounded-xl shadow-lg shadow-zinc-900/10 hover:brightness-105 transition-all active:scale-[0.98]"
            >
              Preview & Download PDF
            </button>
          </div>
        </div>
      </section>

      {/* Sticky Bottom Bar on Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-3.5 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-200/50 dark:border-zinc-900/80 flex items-center justify-between z-40 md:hidden no-print">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-zinc-450 dark:text-zinc-500 font-bold">Total Due</span>
          <span className="text-lg font-black" style={{ color: themeColor.value }}>{fmt(total)}</span>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          style={{ backgroundColor: themeColor.value }}
          className="px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.97]"
        >
          Preview PDF
        </button>
      </div>

    </div>
  );
}
