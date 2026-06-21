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

  // Common premium input styles
  const premiumInput = "w-full bg-transparent border-b-2 border-transparent hover:border-zinc-200 focus:border-zinc-900 focus:outline-none transition-all py-2 text-zinc-900 placeholder:text-zinc-300";
  const labelClass = "block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1";

  return (
    <div className="w-full max-w-5xl mx-auto font-sans bg-white sm:p-14 p-6 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-zinc-100 mt-8 mb-24 relative overflow-hidden">
      
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-zinc-100 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

      {/* 1. Header Area */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-start gap-8 mb-16 relative z-10">
        <div className="flex-1">
          <h1 className="text-5xl font-black tracking-tighter text-zinc-900 mb-4 flex items-center gap-3">
            Invoice <Sparkles className="text-zinc-300" size={32} />
          </h1>
          <div className="max-w-xs">
            <label className={labelClass}>Invoice Number</label>
            <input 
              value={invoiceNumber} 
              onChange={e => setInvoiceNumber(e.target.value)} 
              placeholder="#INV-001" 
              className="w-full text-xl font-semibold text-zinc-900 bg-transparent border-b-2 border-zinc-100 focus:border-zinc-900 focus:outline-none transition-all py-2 placeholder:text-zinc-200" 
            />
          </div>
        </div>
        
        {/* Premium Logo Upload */}
        <div className="w-full md:w-64">
          <label className={labelClass}>Company Logo</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative h-28 w-full border-2 border-dashed border-zinc-200 rounded-2xl flex items-center justify-center hover:bg-zinc-50 hover:border-zinc-300 transition-all cursor-pointer group bg-white overflow-hidden"
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
                <img src={logoUrl} alt="Logo" className="h-16 w-full object-contain mb-2" />
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); setLogoUrl(''); }} 
                  className="absolute inset-0 bg-black/50 text-white font-medium opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                >
                  Remove Logo
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-400 group-hover:text-zinc-600 transition-colors">
                <UploadCloud size={24} strokeWidth={1.5} />
                <span className="text-xs font-semibold">Upload Image</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. From / To & Dates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 relative z-10">
        {/* From */}
        <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 hover:shadow-lg hover:shadow-zinc-100 transition-all duration-300">
          <label className={labelClass}>Your Details (From)</label>
          <textarea 
            value={companyDetails} 
            onChange={e => setCompanyDetails(e.target.value)} 
            placeholder="Your Company Name&#10;123 Business Avenue&#10;City, State, Zip" 
            rows={4} 
            className="w-full bg-transparent resize-y text-zinc-900 placeholder:text-zinc-400 focus:outline-none text-[15px] leading-relaxed mt-2" 
          />
        </div>
        
        {/* To */}
        <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 hover:shadow-lg hover:shadow-zinc-100 transition-all duration-300">
          <label className={labelClass}>Client Details (Bill To)</label>
          <textarea 
            value={clientDetails} 
            onChange={e => setClientDetails(e.target.value)} 
            placeholder="Client Name&#10;456 Client Street&#10;City, State, Zip" 
            rows={4} 
            className="w-full bg-transparent resize-y text-zinc-900 placeholder:text-zinc-400 focus:outline-none text-[15px] leading-relaxed mt-2" 
          />
        </div>

        {/* Dates */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className={labelClass}>Date Issued</label>
            <div className="relative group">
              <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className={`${premiumInput} text-lg [&::-webkit-calendar-picker-indicator]:opacity-0 z-10 relative bg-transparent cursor-pointer`} />
              <Calendar size={20} className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-300 group-hover:text-zinc-500 transition-colors pointer-events-none z-0" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Due Date</label>
            <div className="relative group">
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={`${premiumInput} text-lg [&::-webkit-calendar-picker-indicator]:opacity-0 z-10 relative bg-transparent cursor-pointer`} />
              <Calendar size={20} className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-300 group-hover:text-zinc-500 transition-colors pointer-events-none z-0" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Line Items (Borderless premium table) */}
      <div className="mb-16 relative z-10">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-6">Line Items</h2>
        
        <div className="hidden md:flex text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4 px-2">
          <div className="flex-1">Description</div>
          <div className="w-[120px] text-right">Rate</div>
          <div className="w-[100px] text-right">Qty</div>
          <div className="w-[140px] text-right">Amount</div>
          <div className="w-10"></div>
        </div>
        
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="group flex flex-col md:flex-row gap-4 items-center bg-white border border-zinc-100 hover:border-zinc-300 hover:shadow-md rounded-2xl p-4 transition-all duration-300">
               <div className="w-full md:flex-1 relative">
                 <span className="md:hidden block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Description</span>
                 <input 
                   value={item.description} 
                   onChange={e => handleItemChange(idx, 'description', e.target.value)} 
                   placeholder="Item description" 
                   className="w-full bg-transparent text-zinc-900 font-medium text-[15px] focus:outline-none placeholder:text-zinc-300" 
                 />
               </div>
               
               <div className="flex w-full md:w-auto gap-4 md:gap-4">
                 <div className="flex-1 md:w-[120px] relative">
                   <span className="md:hidden block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Rate</span>
                   <div className="relative">
                     <span className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">$</span>
                     <input 
                       type="number" 
                       placeholder="0.00" 
                       value={item.unit_price} 
                       onChange={e => handleItemChange(idx, 'unit_price', e.target.value)} 
                       className="w-full pl-5 bg-transparent text-left md:text-right text-zinc-900 font-medium focus:outline-none placeholder:text-zinc-300" 
                     />
                   </div>
                 </div>
                 
                 <div className="flex-1 md:w-[100px]">
                   <span className="md:hidden block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Qty</span>
                   <input 
                     type="number" 
                     placeholder="1" 
                     value={item.quantity} 
                     onChange={e => handleItemChange(idx, 'quantity', e.target.value)} 
                     className="w-full bg-transparent text-left md:text-right text-zinc-900 font-medium focus:outline-none placeholder:text-zinc-300" 
                   />
                 </div>
                 
                 <div className="flex-1 md:w-[140px] relative">
                   <span className="md:hidden block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Amount</span>
                   <div className="relative">
                     <span className="absolute left-0 md:left-auto md:right-24 top-1/2 -translate-y-1/2 text-zinc-400 font-medium opacity-0 md:opacity-100">$</span>
                     <input 
                       value={item.amount > 0 ? '$' + item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''} 
                       readOnly 
                       placeholder="$0.00" 
                       className="w-full bg-transparent text-left md:text-right font-bold text-zinc-900 focus:outline-none placeholder:text-zinc-200 cursor-default" 
                     />
                   </div>
                 </div>
               </div>

               <div className="w-full md:w-10 flex justify-end md:justify-center mt-2 md:mt-0">
                 <button 
                   onClick={() => removeRow(idx)} 
                   disabled={items.length === 1} 
                   className="text-zinc-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full disabled:opacity-0 transition-all"
                 >
                   <X size={18} strokeWidth={2} />
                 </button>
               </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={addRow} 
          className="mt-6 flex items-center gap-2 text-zinc-900 font-semibold text-sm hover:text-zinc-600 transition-colors group"
        >
          <div className="h-8 w-8 rounded-full bg-zinc-100 group-hover:bg-zinc-200 text-zinc-900 flex items-center justify-center transition-colors">
            <Plus size={16} strokeWidth={2.5} />
          </div>
          Add new item
        </button>
      </div>

      {/* 4. Footer (Notes & Totals) */}
      <div className="flex flex-col md:flex-row justify-between gap-12 relative z-10">
        
        {/* Notes */}
        <div className="flex-1">
          <label className={labelClass}>Notes / Terms</label>
          <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            placeholder="Thank you for your business! Payment is due within 15 days." 
            rows={5} 
            className="w-full bg-transparent border-2 border-zinc-100 hover:border-zinc-200 focus:border-zinc-900 rounded-2xl p-4 text-[15px] text-zinc-900 placeholder:text-zinc-300 focus:outline-none transition-all resize-y" 
          />
        </div>
        
        {/* Totals */}
        <div className="w-full md:w-[380px]">
          <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100">
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-[15px] font-semibold text-zinc-500">Subtotal</span>
                <span className="text-[16px] font-bold text-zinc-900">{fmtSummary(subtotal)}</span>
              </div>
              
              <div className="flex justify-between items-center group">
                <span className="text-[15px] font-semibold text-zinc-500">Tax</span>
                <div className="relative w-32 border-b-2 border-zinc-200 group-focus-within:border-zinc-900 transition-colors">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">$</span>
                  <input type="number" placeholder="0.00" value={taxAmount > 0 ? taxAmount : ''} onChange={e => setTaxAmount(parseFloat(e.target.value) || 0)} className="w-full bg-transparent text-right font-semibold text-zinc-900 focus:outline-none py-1" />
                </div>
              </div>
              
              <div className="flex justify-between items-center group">
                <span className="text-[15px] font-semibold text-zinc-500">Discount</span>
                <div className="relative w-32 border-b-2 border-zinc-200 group-focus-within:border-zinc-900 transition-colors">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">$</span>
                  <input type="number" placeholder="0.00" value={discountAmount > 0 ? discountAmount : ''} onChange={e => setDiscountAmount(parseFloat(e.target.value) || 0)} className="w-full bg-transparent text-right font-semibold text-zinc-900 focus:outline-none py-1" />
                </div>
              </div>
              
              <div className="flex justify-between items-center group">
                <span className="text-[15px] font-semibold text-zinc-500">Shipping</span>
                <div className="relative w-32 border-b-2 border-zinc-200 group-focus-within:border-zinc-900 transition-colors">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">$</span>
                  <input type="number" placeholder="0.00" value={shippingAmount > 0 ? shippingAmount : ''} onChange={e => setShippingAmount(parseFloat(e.target.value) || 0)} className="w-full bg-transparent text-right font-semibold text-zinc-900 focus:outline-none py-1" />
                </div>
              </div>
            </div>
            
            {/* Hero Total */}
            <div className="bg-zinc-900 rounded-2xl p-6 flex justify-between items-center shadow-xl shadow-zinc-900/10">
              <span className="text-[18px] font-bold text-white">Total</span>
              <span className="text-[28px] font-black text-white">{fmtSummary(total)}</span>
            </div>
          </div>

          <button 
            onClick={() => setShowPreview(true)}
            className="w-full mt-6 px-8 py-5 bg-zinc-900 hover:bg-black text-white font-bold text-[16px] rounded-2xl shadow-xl shadow-zinc-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            Preview & Download
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

    </div>
  );
}
