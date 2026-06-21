'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, Plus, X, Upload, Calendar, RefreshCw, ArrowRight } from 'lucide-react';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export function FreeInvoiceBuilder() {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- State ---
  const [logoUrl, setLogoUrl] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('#002121');
  const [companyDetails, setCompanyDetails] = useState('Musemind, Road 3, Block B, Banasree,\nDhaka,');
  const [clientDetails, setClientDetails] = useState('Panther, Brooklyn, NY 11207');
  
  const [issueDate, setIssueDate] = useState('10/04/2023');
  const [dueDate, setDueDate] = useState('20/06/2023');

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Ecommerce website redesign', quantity: 5, unit_price: 4000, amount: 20000 },
    { description: 'Logo design', quantity: 1, unit_price: 8000, amount: 8000 },
    { description: 'Dashboard design', quantity: 15, unit_price: 1000, amount: 15000 },
    { description: 'Mobile app design', quantity: 10, unit_price: 500, amount: 10000 },
  ]);

  const [notes, setNotes] = useState('Pay within 15 days, Thank you for your business');
  
  const [taxAmount, setTaxAmount] = useState<number>(200);
  const [discountAmount, setDiscountAmount] = useState<number>(100);
  const [shippingAmount, setShippingAmount] = useState<number>(80);

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

  const fmt = (v: number) => {
    return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };
  const fmtSummary = (v: number) => {
    return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleItemChange = (i: number, field: keyof Omit<InvoiceItem, 'amount'>, v: any) => {
    const u = [...items];
    if (field === 'quantity')        u[i].quantity   = parseInt(v, 10) || 0;
    else if (field === 'unit_price') u[i].unit_price = parseFloat(v.toString().replace(/[^0-9.]/g, ''))  || 0;
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
              {shippingAmount > 0 && <div className="flex justify-between text-zinc-500"><span>Shipping free</span><span>{fmtSummary(shippingAmount)}</span></div>}
            </div>
            <div className="pt-6 border-t border-zinc-200 flex justify-between items-center">
              <span className="text-lg font-bold text-[#3b82f6]">Total</span>
              <span className="text-3xl font-bold text-[#3b82f6]">{fmtSummary(total)}</span>
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
            className="px-6 py-2.5 bg-[#3b82f6] hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
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

  // Common input styles matching the screenshot
  const inputClass = "w-full min-h-[44px] rounded-lg bg-white border border-[#E5E7EB] px-3.5 py-2.5 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all";
  const labelClass = "block text-[14px] font-medium text-[#9CA3AF] mb-1.5";

  return (
    <div className="w-full max-w-[850px] mx-auto font-sans bg-white pb-20">
      
      {/* 1. Logo & Invoice Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-5">
        <div>
          <label className={labelClass}>Logo</label>
          <div className="relative h-[72px] w-full border border-[#E5E7EB] rounded-lg flex items-center px-4 hover:bg-zinc-50 transition-colors cursor-pointer group bg-white">
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
            {logoUrl ? (
              <div className="flex items-center justify-between w-full z-20">
                <img src={logoUrl} alt="Logo" className="h-12 object-contain" />
                <button type="button" onClick={() => setLogoUrl('')} className="text-zinc-400 hover:text-red-500 z-30 relative px-2 text-sm font-medium">Clear</button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-zinc-600">
                <Upload size={20} className="text-[#374151]" strokeWidth={1.5} />
                <div className="mt-0.5">
                  <p className="text-[14px] font-bold text-[#111827] underline decoration-zinc-300 underline-offset-2 mb-0.5">Upload file</p>
                  <p className="text-[13px] font-medium text-[#9CA3AF]">JPG, JPEG, PNG, less than 5MB</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <label className={labelClass}>Invoice number</label>
          <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* 2. Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-5">
        <div>
          <label className={labelClass}>Your company details</label>
          <div className="relative">
            <textarea value={companyDetails} onChange={e => setCompanyDetails(e.target.value)} rows={3} className={`${inputClass} resize-y pr-10 leading-relaxed`} />
            <RefreshCw size={14} className="absolute top-3 right-3 text-[#60A5FA] cursor-pointer" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Bill to</label>
          <div className="relative">
            <textarea value={clientDetails} onChange={e => setClientDetails(e.target.value)} rows={3} className={`${inputClass} resize-y pr-10 leading-relaxed`} />
          </div>
        </div>
      </div>

      {/* 3. Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
        <div>
          <label className={labelClass}>Date issued</label>
          <div className="relative">
            <input type="text" value={issueDate} onChange={e => setIssueDate(e.target.value)} className={inputClass} />
            <Calendar size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Due date</label>
          <div className="relative">
            <input type="text" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClass} />
            <Calendar size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Line Items Table */}
      <div className="bg-[#F8F9FA] rounded-xl p-5 sm:p-7 mb-8">
        <div className="flex text-[14px] font-medium text-[#9CA3AF] mb-3 px-1">
          <div className="flex-1">Item</div>
          <div className="w-[100px] text-center">Rate</div>
          <div className="w-[70px] text-center">Qty</div>
          <div className="w-[110px] text-center">Amount</div>
          <div className="w-8"></div>
        </div>
        
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-3 items-center mb-3">
             <div className="flex-1 relative">
               <input value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} className={`${inputClass} font-medium text-[#111827] pr-10`} />
               <RefreshCw size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-[#60A5FA] cursor-pointer" />
             </div>
             <div className="w-[100px]">
               <input type="text" value={item.unit_price > 0 ? fmt(item.unit_price) : ''} onChange={e => handleItemChange(idx, 'unit_price', e.target.value)} className={`${inputClass} text-center font-medium text-[#111827]`} />
             </div>
             <div className="w-[70px]">
               <input type="number" value={item.quantity || ''} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className={`${inputClass} text-center font-medium text-[#111827] px-1`} />
             </div>
             <div className="w-[110px]">
               <input value={fmt(item.amount)} readOnly className={`${inputClass} text-center font-medium text-[#111827] bg-white cursor-default`} />
             </div>
             <button onClick={() => removeRow(idx)} disabled={items.length === 1} className="w-8 flex justify-center text-[#9CA3AF] hover:text-[#111827] disabled:opacity-0 transition-colors">
               <X size={20} strokeWidth={1.5} />
             </button>
          </div>
        ))}
        
        <div className="flex justify-center mt-6">
          <button onClick={addRow} className="flex flex-col items-center gap-1.5 text-[#3b82f6] hover:text-blue-700 transition-colors">
            <div className="h-[34px] w-[34px] rounded-full bg-[#3b82f6] text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Plus size={20} strokeWidth={2} />
            </div>
            <span className="text-[14px] font-semibold tracking-wide">Add Item</span>
          </button>
        </div>
      </div>

      {/* 5. Notes & Totals */}
      <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
        <div className="flex-1">
          <label className={labelClass}>Notes</label>
          <div className="relative">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className={`${inputClass} resize-y pr-10 font-medium text-[#111827]`} />
            <RefreshCw size={14} className="absolute top-3 right-3 text-[#60A5FA] cursor-pointer" />
          </div>
        </div>
        
        <div className="w-full md:w-[320px] pt-1">
          <div className="flex justify-between items-center mb-5">
            <span className="text-[15px] font-bold text-[#111827]">Subtotal</span>
            <span className="text-[18px] font-bold text-[#111827]">{fmtSummary(subtotal)}</span>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-[#6B7280] font-medium">Tax</span>
              <input type="text" value={fmtSummary(taxAmount)} onChange={e => setTaxAmount(parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0)} className={`${inputClass} w-[130px] h-[38px] text-right font-medium text-[#111827]`} />
            </div>
            
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-[#6B7280] font-medium">Discount</span>
              <input type="text" value={fmtSummary(discountAmount)} onChange={e => setDiscountAmount(parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0)} className={`${inputClass} w-[130px] h-[38px] text-right font-medium text-[#111827]`} />
            </div>
            
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-[#6B7280] font-medium">Shipping free</span>
              <input type="text" value={fmtSummary(shippingAmount)} onChange={e => setShippingAmount(parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0)} className={`${inputClass} w-[130px] h-[38px] text-right font-medium text-[#111827]`} />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-[16px] font-bold text-[#3b82f6]">Total</span>
            <span className="text-[20px] font-bold text-[#3b82f6]">{fmtSummary(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-12">
         <button 
           onClick={() => setShowPreview(true)}
           className="px-8 py-3.5 bg-[#3b82f6] hover:bg-blue-700 text-white font-medium text-[15px] rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
         >
           Preview & Download
           <ArrowRight size={18} />
         </button>
      </div>

    </div>
  );
}
