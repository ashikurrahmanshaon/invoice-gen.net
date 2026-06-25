'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Download, Image as ImageIcon, Settings, CheckCircle2 } from 'lucide-react';

// --- Types ---
interface InvoiceItem {
  id: string;
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

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
  { code: 'AUD', symbol: 'A$' },
];

// --- Inline Editable Components ---
const InlineInput = ({ value, onChange, className, placeholder, align = 'left', type = 'text', readOnly = false }: any) => (
  <input
    type={type}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    readOnly={readOnly}
    className={`bg-zinc-50/50 hover:bg-zinc-100 focus:bg-white outline-none border border-transparent hover:border-zinc-200 focus:border-zinc-300 transition-colors w-full px-2 py-1 -ml-2 rounded-md ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'} ${readOnly ? 'pointer-events-none bg-transparent' : ''} ${className}`}
  />
);

const InlineTextarea = ({ value, onChange, className, placeholder, align = 'left' }: any) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className={`bg-zinc-50/50 hover:bg-zinc-100 focus:bg-white outline-none border border-transparent hover:border-zinc-200 focus:border-zinc-300 transition-colors w-full px-2 py-1 -ml-2 rounded-md resize-none overflow-hidden ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'} ${className}`}
    />
  );
};

export function FreeInvoiceBuilder() {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- State ---
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
    { id: '1', description: 'Premium Web Design', quantity: 1, unit_price: 3500, amount: 3500 },
    { id: '2', description: 'Hosting & Maintenance', quantity: 1, unit_price: 600, amount: 600 },
  ]);

  const [isDownloading, setIsDownloading] = useState(false);
  const [scale, setScale] = useState(1);

  // --- Scale Logic to Fit Screen ---
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w === 0) return;
        const padding = 32;
        const scaleW = (w - padding) / 800; // 800px is our ideal canvas width
        setScale(Math.min(scaleW, 1));
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

  const currentSymbol  = CURRENCIES.find(c => c.code === currency)?.symbol || '$';
  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(v);

  const handleItemChange = (id: string, field: keyof Omit<InvoiceItem, 'amount'|'id'>, v: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item };
        if (field === 'quantity')        updated.quantity   = parseFloat(v) || 0;
        else if (field === 'unit_price') updated.unit_price = parseFloat(v) || 0;
        else                             updated.description = v;
        updated.amount = updated.quantity * updated.unit_price;
        return updated;
      }
      return item;
    }));
  };

  const addRow    = () => setItems([...items, { id: Math.random().toString(), description: '', quantity: 1, unit_price: 0, amount: 0 }]);
  const removeRow = (id: string) => { if (items.length > 1) setItems(items.filter(i => i.id !== id)); };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setIsDownloading(true);
    
    // Reset scale temporarily for high quality capture
    const currentScale = scale;
    if (scale !== 1) {
      setScale(1);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Force blur on any active inputs to remove cursors/focus borders
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    try {
      const htmlToImageModule = await import('html-to-image');
      const toPng = htmlToImageModule.toPng;
      
      const jsPDFModule = await import('jspdf') as any;
      const JsPDFClass = jsPDFModule.default?.jsPDF || (typeof jsPDFModule.default === 'function' ? jsPDFModule.default : jsPDFModule.jsPDF);
      
      const imgData = await toPng(invoiceRef.current, { 
        backgroundColor: '#ffffff', 
        pixelRatio: 3,
        filter: (node) => !node.classList?.contains('no-print') // Exclude delete buttons
      });
      
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

  return (
    <div className="w-full h-full flex flex-col items-center justify-center font-sans text-zinc-900 pb-20">
      
      {/* THE CANVAS */}
      <div ref={containerRef} className="w-full flex justify-center">
        <div 
          className="relative origin-top bg-white rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] dark:shadow-black overflow-hidden transition-transform duration-200 group/canvas"
          style={{ transform: `scale(${scale})` }}
        >
          {/* Subtle colored accent bar on top */}
          <div className="absolute top-0 left-0 w-full h-2 transition-colors duration-500" style={{ backgroundColor: themeColor.value }} />
          
          <div ref={invoiceRef} className="w-[800px] min-h-[1131px] bg-white text-zinc-900 p-[4rem] relative">
            
            {/* --- HEADER --- */}
            <div className="flex justify-between items-start mb-20 mt-4">
              <div className="flex-1 max-w-[50%]">
                <div className="group relative mb-4 inline-block">
                  {logoUrl ? (
                    <div className="relative">
                      <img src={logoUrl} alt="Logo" className="max-h-20 object-contain" />
                      <button onClick={() => setLogoUrl('')} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity no-print"><Trash2 size={12}/></button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex items-center justify-center w-24 h-24 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-emerald-500 text-zinc-400 hover:text-emerald-500 transition-colors no-print">
                      <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload = ev => setLogoUrl(ev.target?.result as string); r.readAsDataURL(f); } }} className="hidden" />
                      <ImageIcon size={24} />
                    </label>
                  )}
                  {!logoUrl && <h1 className="text-3xl font-bold tracking-tight mt-4 text-zinc-900 focus-within:ring-0"><InlineInput value={companyName} onChange={setCompanyName} placeholder="Company Name" className="font-bold text-3xl text-zinc-900 placeholder:text-zinc-300" /></h1>}
                </div>
                {logoUrl && <InlineInput value={companyName} onChange={setCompanyName} placeholder="Company Name" className="font-bold text-xl text-zinc-900 mb-1" />}
                <InlineTextarea value={companyAddress} onChange={setCompanyAddress} placeholder="Company Address" className="text-zinc-500 text-sm leading-relaxed" />
                <InlineInput value={companyEmail} onChange={setCompanyEmail} placeholder="Company Email" className="text-zinc-500 text-sm mt-1" />
              </div>
              
              <div className="text-right flex-1 max-w-[40%]">
                <h2 className="text-6xl font-black tracking-tighter text-zinc-100 uppercase mb-4 pointer-events-none">Invoice</h2>
                <div className="flex justify-end items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">NO.</span>
                  <div className="w-32"><InlineInput value={invoiceNumber} onChange={setInvoiceNumber} placeholder="INV-001" align="right" className="font-bold text-lg text-zinc-900" /></div>
                </div>
              </div>
            </div>

            {/* --- BILL TO & DATES --- */}
            <div className="flex justify-between items-end mb-16">
              <div className="flex-1 max-w-[45%]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Bill To</p>
                <InlineInput value={clientName} onChange={setClientName} placeholder="Client Name" className="font-bold text-lg text-zinc-900 mb-1" />
                <InlineTextarea value={clientAddress} onChange={setClientAddress} placeholder="Client Address" className="text-zinc-600 text-sm leading-relaxed" />
                <InlineInput value={clientEmail} onChange={setClientEmail} placeholder="Client Email" className="text-zinc-500 text-sm mt-1" />
              </div>
              <div className="flex gap-12 text-right">
                <div className="w-28">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3 text-right">Issue Date</p>
                  <InlineInput type="date" value={issueDate} onChange={setIssueDate} align="right" className="font-semibold text-zinc-900 text-sm" />
                </div>
                <div className="w-28">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3 text-right">Due Date</p>
                  <InlineInput type="date" value={dueDate} onChange={setDueDate} align="right" className="font-semibold text-zinc-900 text-sm" />
                </div>
              </div>
            </div>

            {/* --- ITEMS TABLE --- */}
            <div className="mb-12">
              <div className="flex border-b-2 border-zinc-900 pb-3 mb-4">
                <div className="flex-1 text-[11px] font-bold uppercase tracking-widest text-zinc-900">Description</div>
                <div className="w-24 text-[11px] font-bold uppercase tracking-widest text-zinc-900 text-center">Qty</div>
                <div className="w-32 text-[11px] font-bold uppercase tracking-widest text-zinc-900 text-right">Price</div>
                <div className="w-32 text-[11px] font-bold uppercase tracking-widest text-zinc-900 text-right">Total</div>
              </div>
              
              <AnimatePresence>
                {items.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start py-4 border-b border-zinc-100 group/row relative"
                  >
                    <div className="flex-1 pr-4">
                      <InlineTextarea value={item.description} onChange={(v: string) => handleItemChange(item.id, 'description', v)} placeholder="Item description" className="font-medium text-zinc-900 text-sm" />
                    </div>
                    <div className="w-24">
                      <InlineInput type="number" value={item.quantity || ''} onChange={(v: string) => handleItemChange(item.id, 'quantity', v)} align="center" className="text-zinc-600 text-sm" placeholder="1" />
                    </div>
                    <div className="w-32 flex items-center justify-end">
                      <span className="text-zinc-400 text-xs mr-1">{currentSymbol}</span>
                      <InlineInput type="number" value={item.unit_price || ''} onChange={(v: string) => handleItemChange(item.id, 'unit_price', v)} align="right" className="text-zinc-600 text-sm" placeholder="0.00" />
                    </div>
                    <div className="w-32 text-right font-semibold text-zinc-900 text-sm flex items-center justify-end">
                      {fmt(item.amount)}
                    </div>
                    
                    {/* Delete Row Button */}
                    <button 
                      onClick={() => removeRow(item.id)}
                      disabled={items.length === 1}
                      className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity disabled:hidden no-print"
                    >
                      <Trash2 size={12} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <button 
                onClick={addRow}
                className="mt-4 flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors no-print px-2 py-1 rounded-md hover:bg-zinc-50"
              >
                <Plus size={14} /> Add Line Item
              </button>
            </div>

            {/* --- BOTTOM SECTION --- */}
            <div className="flex justify-between items-end mt-auto pt-12">
              
              {/* Notes & Payment */}
              <div className="flex-1 max-w-[50%] space-y-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Payment Details</p>
                  <InlineTextarea value={paymentDetails} onChange={setPaymentDetails} placeholder="Bank details, transfer routing..." className="text-zinc-700 text-sm leading-relaxed" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Notes</p>
                  <InlineTextarea value={notes} onChange={setNotes} placeholder="Thank you for your business!" className="text-zinc-500 text-sm leading-relaxed italic" />
                </div>
              </div>

              {/* Totals Box */}
              <div className="w-80 bg-zinc-50 rounded-3xl p-8 border border-zinc-100">
                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between text-zinc-500">
                    <span>Subtotal</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  
                  {/* Interactive Discount */}
                  <div className="flex justify-between items-center group/disc">
                    <span className="text-zinc-500 flex items-center gap-1 cursor-pointer no-print relative" onClick={() => setDiscountType(t => t === 'percent' ? 'flat' : 'percent')}>
                      Discount <span className="bg-zinc-200 text-zinc-600 px-1 rounded text-[10px] font-bold">{discountType === 'percent' ? '%' : '$'}</span>
                    </span>
                    <span className="text-zinc-500 hidden print-only">Discount</span>
                    <div className="flex items-center text-rose-500 font-medium">
                      −<InlineInput type="number" value={discountType === 'percent' ? discountRate||'' : discountVal||''} onChange={(v:string) => discountType==='percent' ? setDiscountRate(parseFloat(v)||0) : setDiscountVal(parseFloat(v)||0)} align="right" placeholder="0" className="w-16 text-rose-500 mx-1" />
                      {discountType === 'percent' && '%'}
                    </div>
                  </div>

                  {/* Interactive Tax */}
                  <div className="flex justify-between items-center text-zinc-500">
                    <span className="flex items-center gap-1">Tax <InlineInput type="number" value={taxRate||''} onChange={(v:string)=>setTaxRate(parseFloat(v)||0)} align="right" placeholder="0" className="w-8 text-zinc-500" />%</span>
                    <span>{fmt(taxAmount)}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-200 flex justify-between items-center transition-colors duration-500">
                  <span className="text-base font-bold text-zinc-900">Total Due</span>
                  <span className="text-3xl font-black tracking-tight" style={{ color: themeColor.value }}>{fmt(total)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FLOATING ACTION DOCK */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 no-print flex items-center gap-2">
        <div className="bg-white/10 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 p-2 rounded-full shadow-2xl flex items-center gap-1">
          
          {/* Colors */}
          <div className="flex gap-1 pr-3 border-r border-white/10 dark:border-white/20">
            {THEME_COLORS.map(c => (
              <button 
                key={c.value} 
                onClick={() => setThemeColor(c)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${themeColor.value === c.value ? 'scale-110 shadow-lg ring-2 ring-white/50' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              >
                {themeColor.value === c.value && <CheckCircle2 size={16} className="text-white drop-shadow-md" />}
              </button>
            ))}
          </div>

          {/* Currency */}
          <div className="px-2 relative group">
            <select 
              value={currency} 
              onChange={e => setCurrency(e.target.value)}
              className="appearance-none bg-transparent text-black dark:text-white font-bold text-sm px-3 py-2 cursor-pointer outline-none hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              {CURRENCIES.map(c => <option key={c.code} value={c.code} className="text-black">{c.code} {c.symbol}</option>)}
            </select>
          </div>

          {/* Download */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="ml-1 pl-4 pr-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-bold text-sm rounded-full flex items-center gap-2 shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {isDownloading ? <span className="w-4 h-4 rounded-full border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black animate-spin" /> : <Download size={16} strokeWidth={2.5} />}
            Export PDF
          </button>
        </div>
      </div>

    </div>
  );
}
