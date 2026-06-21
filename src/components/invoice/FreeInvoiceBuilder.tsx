'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, Plus, X, UploadCloud, Calendar, FileText, Sparkles, ArrowRight } from 'lucide-react';

interface InvoiceItem {
  description: string;
  quantity: string | number;
  unit_price: string | number;
  amount: number;
}

export function FreeInvoiceBuilder() {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- State ---
  const [logoUrl, setLogoUrl] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [companyDetails, setCompanyDetails] = useState('');
  const [clientDetails, setClientDetails] = useState('');
  
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unit_price: '', amount: 0 },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notes, setNotes] = useState('');
  
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [shippingAmount, setShippingAmount] = useState<number>(0);

  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [scale, setScale] = useState(1);

  // --- Scale Logic ---
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w === 0) return;
        const scaleW = (w - 64) / 800; 
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
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const total = subtotal + (taxAmount || 0) - (discountAmount || 0) + (shippingAmount || 0);

  const fmt = (v: number | string) => {
    const num = typeof v === 'string' ? parseFloat(v) || 0 : v;
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };
  const fmtSummary = (v: number) => {
    return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleItemChange = (i: number, field: keyof Omit<InvoiceItem, 'amount'>, v: any) => {
    const u = [...items];
    u[i][field] = v;
    
    // Calculate amount
    const qty = parseFloat(u[i].quantity.toString()) || 0;
    const price = parseFloat(u[i].unit_price.toString()) || 0;
    u[i].amount = qty * price;
    
    setItems(u);
  };

  const addRow    = () => setItems([...items, { description: '', quantity: 1, unit_price: '', amount: 0 }]);
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
      const pdf = new JsPDFClass('p', 'mm', 'a4');
      const pw = pdf.internal.pageSize.getWidth();
      const ph = (node.offsetHeight * pw) / node.offsetWidth;
      
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

  const renderPreviewTemplate = () => {
    const [cName, ...cAddr] = companyDetails.split('\n');
    const [clName, ...clAddr] = clientDetails.split('\n');

    return (
      <div className="bg-white min-h-[1130px] w-full text-[14px] text-zinc-800 font-sans p-16 relative flex flex-col shadow-2xl">
        <div className="flex justify-between items-start mb-16">
          <div>
            {logoUrl ? <img src={logoUrl} alt="Logo" className="max-h-16 mb-4 object-contain" /> : null}
            <h1 className="text-2xl font-bold tracking-tight mb-1 text-zinc-900">{cName || 'Your Company'}</h1>
            <p className="text-zinc-500 whitespace-pre-wrap leading-relaxed">{cAddr.join('\n')}</p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black tracking-tight text-zinc-200 uppercase mb-2">Invoice</h2>
            <p className="font-semibold text-zinc-900 text-lg">{invoiceNumber}</p>
          </div>
        </div>
        <div className="flex justify-between items-end mb-16">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Bill To</p>
            <p className="font-bold text-base text-zinc-900">{clName}</p>
            <p className="text-zinc-600 whitespace-pre-wrap mt-1 leading-relaxed">{clAddr.join('\n')}</p>
          </div>
          <div className="flex gap-16 text-right">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Date Issued</p>
              <p className="font-semibold text-zinc-900">{issueDate}</p>
            </div>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Due Date</p>
              <p className="font-semibold text-zinc-900">{dueDate}</p>
            </div>
          </div>
        </div>
        <table className="w-full text-left mb-16">
          <thead>
            <tr className="border-b-2 border-zinc-100">
              <th className="py-4 text-[13px] font-semibold text-zinc-500">Item</th>
              <th className="py-4 text-[13px] font-semibold text-zinc-500 text-center w-28">Rate</th>
              <th className="py-4 text-[13px] font-semibold text-zinc-500 text-center w-24">Qty</th>
              <th className="py-4 text-[13px] font-semibold text-zinc-500 text-right w-36">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-5 text-zinc-900 font-medium text-[14px]">{item.description || 'Item'}</td>
                <td className="py-5 text-zinc-600 text-center">{fmt(item.unit_price)}</td>
                <td className="py-5 text-zinc-600 text-center">{item.quantity}</td>
                <td className="py-5 text-zinc-900 font-semibold text-right">{fmt(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-auto flex justify-between items-start gap-12">
          <div className="flex-1 space-y-8">
            {notes && (<div><p className="text-[12px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Notes</p><p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">{notes}</p></div>)}
          </div>
          <div className="w-80">
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-zinc-600 font-medium"><span>Subtotal</span><span className="text-zinc-900">{fmtSummary(subtotal)}</span></div>
              {taxAmount > 0 && <div className="flex justify-between text-zinc-500"><span>Tax</span><span>{fmtSummary(taxAmount)}</span></div>}
              {discountAmount > 0 && <div className="flex justify-between text-zinc-500"><span>Discount</span><span>−{fmtSummary(discountAmount)}</span></div>}
              {shippingAmount > 0 && <div className="flex justify-between text-zinc-500"><span>Shipping</span><span>{fmtSummary(shippingAmount)}</span></div>}
            </div>
            <div className="pt-6 border-t border-zinc-200 flex justify-between items-center">
              <span className="text-lg font-bold text-[#111827]">Total</span>
              <span className="text-3xl font-bold text-[#111827]">{fmtSummary(total)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (showPreview) {
    return (
      <div className="w-full flex flex-col items-center bg-[#F8F9FA] py-12 px-4 min-h-screen font-sans">
        <div className="w-full max-w-4xl flex justify-between items-center mb-8">
          <button 
            onClick={() => setShowPreview(false)}
            className="px-6 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium rounded-lg transition-all"
          >
            Back to Editor
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="px-6 py-2.5 bg-[#111827] hover:bg-black text-white font-medium rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isDownloading ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><Download size={16} /> Download PDF</>}
          </button>
        </div>
        <div ref={containerRef} className="w-full flex justify-center overflow-x-auto pb-24">
          <div className="relative transition-all duration-300 ease-out origin-top" style={{ transform: `scale(${scale})` }}>
            <div className="relative w-[800px] bg-white text-black shadow-2xl rounded-md overflow-hidden select-text pointer-events-auto border border-zinc-200">
              <div ref={invoiceRef}>
                {renderPreviewTemplate()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = "w-full min-h-[44px] rounded-xl bg-white border border-zinc-200 px-4 py-3 text-[14px] text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all";
  const labelClass = "block text-[13px] font-semibold text-zinc-700 mb-2";

  return (
    <div className="w-full max-w-4xl mx-auto font-sans bg-white sm:p-12 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 mt-8 mb-24 relative">
      
      {/* 1. Header Area */}
      <div className="flex justify-between items-center mb-10 border-b border-zinc-100 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Invoice Details
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
        {/* Logo Upload */}
        <div>
          <label className={labelClass}>Company Logo</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative h-24 w-full border-2 border-dashed border-zinc-200 rounded-xl flex items-center justify-center hover:bg-zinc-50 hover:border-zinc-300 transition-all cursor-pointer bg-white overflow-hidden group"
          >
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => { setLogoUrl(ev.target?.result as string); };
                  reader.readAsDataURL(file);
                } else { setLogoUrl(''); }
                e.target.value = '';
              }}
              className="hidden"
            />
            {logoUrl ? (
              <div className="absolute inset-0 p-4 bg-white flex flex-col items-center justify-center group">
                <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); setLogoUrl(''); }} 
                  className="absolute inset-0 bg-black/40 text-white font-medium opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                >
                  Clear Logo
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-500">
                <UploadCloud size={20} strokeWidth={2} />
                <span className="text-[13px] font-medium">Upload Image</span>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Number */}
        <div>
          <label className={labelClass}>Invoice Number</label>
          <input 
            value={invoiceNumber} 
            onChange={e => setInvoiceNumber(e.target.value)} 
            placeholder="#INV-001" 
            className={inputClass} 
          />
        </div>
      </div>

      {/* 2. From / To Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
        <div>
          <label className={labelClass}>Your Details (From)</label>
          <textarea 
            value={companyDetails} 
            onChange={e => setCompanyDetails(e.target.value)} 
            placeholder="Your Company Name&#10;123 Business Avenue&#10;City, State, Zip" 
            rows={4} 
            className={`${inputClass} resize-y leading-relaxed`} 
          />
        </div>
        
        <div>
          <label className={labelClass}>Client Details (Bill To)</label>
          <textarea 
            value={clientDetails} 
            onChange={e => setClientDetails(e.target.value)} 
            placeholder="Client Name&#10;456 Client Street&#10;City, State, Zip" 
            rows={4} 
            className={`${inputClass} resize-y leading-relaxed`} 
          />
        </div>
      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-12">
        <div>
          <label className={labelClass}>Date Issued</label>
          <div className="relative">
            <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className={`${inputClass} [&::-webkit-calendar-picker-indicator]:opacity-0 z-10 relative bg-transparent`} />
            <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none z-0" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Due Date</label>
          <div className="relative">
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={`${inputClass} [&::-webkit-calendar-picker-indicator]:opacity-0 z-10 relative bg-transparent`} />
            <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none z-0" />
          </div>
        </div>
      </div>

      {/* 3. Line Items */}
      <div className="mb-12">
        <label className={labelClass}>Line Items</label>
        <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-4 sm:p-6 shadow-sm">
          <div className="hidden md:flex text-[13px] font-semibold text-zinc-500 mb-3 px-1">
            <div className="flex-1">Description</div>
            <div className="w-[120px] text-left ml-3">Rate</div>
            <div className="w-[80px] text-left ml-3">Qty</div>
            <div className="w-[120px] text-left ml-3">Amount</div>
            <div className="w-10 ml-3"></div>
          </div>
          
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-3 items-center">
                 <div className="w-full md:flex-1">
                   <span className="md:hidden block text-[12px] font-semibold text-zinc-500 mb-1">Description</span>
                   <input 
                     value={item.description} 
                     onChange={e => handleItemChange(idx, 'description', e.target.value)} 
                     placeholder="Item description" 
                     className={inputClass} 
                   />
                 </div>
                 
                 <div className="w-full md:w-[120px] relative">
                   <span className="md:hidden block text-[12px] font-semibold text-zinc-500 mb-1">Rate</span>
                   <span className="absolute left-3 top-[34px] md:top-1/2 -translate-y-1/2 text-zinc-500 font-medium">$</span>
                   <input 
                     type="number" 
                     placeholder="0.00" 
                     value={item.unit_price} 
                     onChange={e => handleItemChange(idx, 'unit_price', e.target.value)} 
                     className={`${inputClass} pl-7`} 
                   />
                 </div>
                 
                 <div className="w-full md:w-[80px]">
                   <span className="md:hidden block text-[12px] font-semibold text-zinc-500 mb-1">Qty</span>
                   <input 
                     type="number" 
                     placeholder="1" 
                     value={item.quantity} 
                     onChange={e => handleItemChange(idx, 'quantity', e.target.value)} 
                     className={inputClass} 
                   />
                 </div>
                 
                 <div className="w-full md:w-[120px] relative">
                   <span className="md:hidden block text-[12px] font-semibold text-zinc-500 mb-1">Amount</span>
                   <span className="absolute left-3 top-[34px] md:top-1/2 -translate-y-1/2 text-zinc-500 font-medium">$</span>
                   <input 
                     value={item.amount > 0 ? item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''} 
                     readOnly 
                     placeholder="0.00" 
                     className={`${inputClass} pl-7 bg-zinc-100 cursor-default focus:ring-0 focus:border-zinc-200`} 
                   />
                 </div>

                 <div className="w-full md:w-10 flex justify-end md:justify-center mt-2 md:mt-0">
                   <button 
                     onClick={() => removeRow(idx)} 
                     disabled={items.length === 1} 
                     className="text-zinc-400 hover:text-red-500 p-2 rounded-full disabled:opacity-0 transition-all bg-white shadow-sm border border-zinc-200"
                   >
                     <X size={16} strokeWidth={2} />
                   </button>
                 </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={addRow} 
            className="mt-6 flex items-center gap-2 text-blue-600 font-semibold text-[14px] hover:text-blue-700 transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center transition-colors">
              <Plus size={16} strokeWidth={2.5} />
            </div>
            Add Line Item
          </button>
        </div>
      </div>

      {/* 4. Footer (Notes & Totals) */}
      <div className="flex flex-col md:flex-row justify-between gap-10">
        
        {/* Notes */}
        <div className="flex-1">
          <label className={labelClass}>Notes / Terms</label>
          <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            placeholder="Thank you for your business! Payment is due within 15 days." 
            rows={5} 
            className={`${inputClass} resize-y`} 
          />
        </div>
        
        {/* Totals */}
        <div className="w-full md:w-[340px]">
          <div className="space-y-4 mb-6 pt-2">
            <div className="flex justify-between items-center px-2">
              <span className="text-[14px] font-semibold text-zinc-600">Subtotal</span>
              <span className="text-[16px] font-bold text-zinc-900">{fmtSummary(subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center gap-4">
              <span className="text-[14px] font-semibold text-zinc-600 pl-2">Tax</span>
              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">$</span>
                <input type="number" placeholder="0.00" value={taxAmount > 0 ? taxAmount : ''} onChange={e => setTaxAmount(parseFloat(e.target.value) || 0)} className={`${inputClass} pl-7 py-2 h-auto`} />
              </div>
            </div>
            
            <div className="flex justify-between items-center gap-4">
              <span className="text-[14px] font-semibold text-zinc-600 pl-2">Discount</span>
              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">$</span>
                <input type="number" placeholder="0.00" value={discountAmount > 0 ? discountAmount : ''} onChange={e => setDiscountAmount(parseFloat(e.target.value) || 0)} className={`${inputClass} pl-7 py-2 h-auto`} />
              </div>
            </div>
            
            <div className="flex justify-between items-center gap-4">
              <span className="text-[14px] font-semibold text-zinc-600 pl-2">Shipping</span>
              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">$</span>
                <input type="number" placeholder="0.00" value={shippingAmount > 0 ? shippingAmount : ''} onChange={e => setShippingAmount(parseFloat(e.target.value) || 0)} className={`${inputClass} pl-7 py-2 h-auto`} />
              </div>
            </div>
          </div>
          
          {/* Hero Total */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex justify-between items-center mb-6">
            <span className="text-[16px] font-bold text-blue-900">Total</span>
            <span className="text-[24px] font-black text-blue-600">{fmtSummary(total)}</span>
          </div>

          <button 
            onClick={() => setShowPreview(true)}
            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Preview & Download
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

    </div>
  );
}
