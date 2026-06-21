'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, Plus, X, UploadCloud, ArrowRight } from 'lucide-react';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[13px] font-medium text-zinc-500 mb-2">
    {children}
  </label>
);

const CleanInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full h-11 rounded-lg bg-white border border-zinc-200 px-3 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${props.className || ''}`}
  />
);

const CleanTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full rounded-lg bg-white border border-zinc-200 p-3 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none ${props.className || ''}`}
  />
);

export function FreeInvoiceBuilder() {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- State ---
  const [logoUrl, setLogoUrl] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('#002121');
  const [companyDetails, setCompanyDetails] = useState('Musemind, Road 3, Block B, Banasree,\nDhaka,');
  const [clientDetails, setClientDetails] = useState('Panther, Brooklyn, NY 11207');
  
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    // Format YYYY-MM-DD for input type="date"
    setIssueDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  }, []);

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Ecommerce website redesign', quantity: 5, unit_price: 4000, amount: 20000 },
    { description: 'Logo design', quantity: 1, unit_price: 8000, amount: 8000 },
    { description: 'Dashboard design', quantity: 15, unit_price: 1000, amount: 15000 },
    { description: 'Mobile app design', quantity: 10, unit_price: 500, amount: 5000 },
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

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

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

  // ---------------------------------------------------------------------------
  // PDF PREVIEW TEMPLATE (Minimalist to match the vibe)
  // ---------------------------------------------------------------------------
  const renderPreviewTemplate = () => {
    const [cName, ...cAddr] = companyDetails.split('\n');
    const [clName, ...clAddr] = clientDetails.split('\n');

    return (
      <div className="bg-white min-h-[1130px] w-full text-[13px] text-zinc-800 font-sans p-16 relative flex flex-col shadow-2xl">
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Bill To</p>
            <p className="font-bold text-base text-zinc-900">{clName}</p>
            <p className="text-zinc-600 whitespace-pre-wrap mt-1 leading-relaxed">{clAddr.join('\n')}</p>
          </div>
          <div className="flex gap-16 text-right">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Date Issued</p>
              <p className="font-semibold text-zinc-900">{issueDate}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Due Date</p>
              <p className="font-semibold text-zinc-900">{dueDate}</p>
            </div>
          </div>
        </div>
        <table className="w-full text-left mb-16">
          <thead>
            <tr className="border-b-2 border-zinc-100">
              <th className="py-4 text-[12px] font-semibold text-zinc-500">Item</th>
              <th className="py-4 text-[12px] font-semibold text-zinc-500 text-center w-24">Rate</th>
              <th className="py-4 text-[12px] font-semibold text-zinc-500 text-center w-24">Qty</th>
              <th className="py-4 text-[12px] font-semibold text-zinc-500 text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-5 text-zinc-900 font-medium text-sm">{item.description || 'Item'}</td>
                <td className="py-5 text-zinc-500 text-center">{fmt(item.unit_price)}</td>
                <td className="py-5 text-zinc-500 text-center">{item.quantity}</td>
                <td className="py-5 text-zinc-900 font-semibold text-right">{fmt(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-auto flex justify-between items-start gap-12">
          <div className="flex-1 space-y-8">
            {notes && (<div><p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Notes</p><p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">{notes}</p></div>)}
          </div>
          <div className="w-80">
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-zinc-600 font-medium"><span>Subtotal</span><span className="text-zinc-900">{fmt(subtotal)}</span></div>
              {taxAmount > 0 && <div className="flex justify-between text-zinc-500"><span>Tax</span><span>{fmt(taxAmount)}</span></div>}
              {discountAmount > 0 && <div className="flex justify-between text-zinc-500"><span>Discount</span><span>−{fmt(discountAmount)}</span></div>}
              {shippingAmount > 0 && <div className="flex justify-between text-zinc-500"><span>Shipping</span><span>{fmt(shippingAmount)}</span></div>}
            </div>
            <div className="pt-6 border-t border-zinc-200 flex justify-between items-center">
              <span className="text-base font-bold text-blue-600">Total</span>
              <span className="text-2xl font-bold text-blue-600">{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (showPreview) {
    return (
      <div className="w-full flex flex-col items-center bg-zinc-50 py-12 px-4 min-h-screen font-sans">
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
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
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

  return (
    <div className="w-full max-w-[900px] mx-auto font-sans text-zinc-900">
      
      {/* 1. Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
        <div>
          <Label>Logo</Label>
          <div className="relative h-[84px] w-full border border-zinc-200 rounded-lg flex items-center px-4 hover:bg-zinc-50 transition-colors cursor-pointer group bg-white">
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
                <button type="button" onClick={() => setLogoUrl('')} className="text-zinc-400 hover:text-red-500 z-30 relative px-2">Clear</button>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-zinc-600">
                <UploadCloud size={24} className="text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                <div>
                  <p className="text-[14px] font-semibold text-zinc-800 underline decoration-zinc-300 underline-offset-2">Upload file</p>
                  <p className="text-[12px] text-zinc-500 mt-0.5">JPG, JPEG, PNG, less than 5MB</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <Label>Invoice number</Label>
          <CleanInput value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="h-[84px] text-lg px-4" />
        </div>
      </div>

      {/* 2. Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
        <div>
          <Label>Your company details</Label>
          <CleanTextarea value={companyDetails} onChange={e => setCompanyDetails(e.target.value)} rows={3} className="h-28" />
        </div>
        <div>
          <Label>Bill to</Label>
          <CleanTextarea value={clientDetails} onChange={e => setClientDetails(e.target.value)} rows={3} className="h-28" />
        </div>
      </div>

      {/* 3. Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-10">
        <div>
          <Label>Date issued</Label>
          <CleanInput type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
        </div>
        <div>
          <Label>Due date</Label>
          <CleanInput type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
      </div>

      {/* 4. Line Items Table */}
      <div className="bg-[#F8F9FA] rounded-xl p-6 sm:p-8 mb-10">
        <div className="flex text-[13px] font-semibold text-zinc-500 mb-3 px-1">
          <div className="flex-1">Item</div>
          <div className="w-24 text-center">Rate</div>
          <div className="w-20 text-center">Qty</div>
          <div className="w-28 text-center md:text-right">Amount</div>
          <div className="w-8"></div>
        </div>
        
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 md:gap-4 items-center mb-3">
             <div className="w-full md:flex-1">
               <CleanInput value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} />
             </div>
             <div className="w-[calc(33%-0.5rem)] md:w-24">
               <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                 <CleanInput type="number" value={item.unit_price || ''} onChange={e => handleItemChange(idx, 'unit_price', e.target.value)} className="text-center pl-6" />
               </div>
             </div>
             <div className="w-[calc(33%-0.5rem)] md:w-20">
               <CleanInput type="number" value={item.quantity || ''} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="text-center" />
             </div>
             <div className="w-[calc(33%-0.5rem)] md:w-28">
               <CleanInput value={`$${item.amount.toLocaleString()}`} readOnly className="text-center md:text-right font-medium text-zinc-900 bg-white" />
             </div>
             <button onClick={() => removeRow(idx)} disabled={items.length === 1} className="w-8 flex justify-center text-zinc-400 hover:text-zinc-700 disabled:opacity-0 transition-colors">
               <X size={20} />
             </button>
          </div>
        ))}
        
        <div className="flex justify-center mt-8">
          <button onClick={addRow} className="flex flex-col items-center gap-2 text-[#3b82f6] hover:text-blue-700 transition-colors group">
            <div className="h-10 w-10 rounded-full bg-[#3b82f6] text-white flex items-center justify-center shadow-md group-hover:bg-blue-700 transition-colors">
              <Plus size={20} />
            </div>
            <span className="text-[14px] font-semibold">Add Item</span>
          </button>
        </div>
      </div>

      {/* 5. Notes & Totals */}
      <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
        <div className="flex-1">
          <Label>Notes</Label>
          <CleanTextarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="h-32" />
        </div>
        
        <div className="w-full md:w-[320px] space-y-4 pt-4 md:pt-0">
          <div className="flex justify-between items-center">
            <span className="text-[15px] font-semibold text-zinc-800">Subtotal</span>
            <span className="text-[20px] font-bold text-zinc-900">{fmt(subtotal)}</span>
          </div>
          
          <div className="flex justify-between items-center text-[14px]">
            <span className="text-zinc-500 font-medium">Tax</span>
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
              <CleanInput type="number" value={taxAmount || ''} onChange={e => setTaxAmount(parseFloat(e.target.value) || 0)} className="text-right pl-6 h-10" />
            </div>
          </div>
          
          <div className="flex justify-between items-center text-[14px]">
            <span className="text-zinc-500 font-medium">Discount</span>
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
              <CleanInput type="number" value={discountAmount || ''} onChange={e => setDiscountAmount(parseFloat(e.target.value) || 0)} className="text-right pl-6 h-10" />
            </div>
          </div>
          
          <div className="flex justify-between items-center text-[14px]">
            <span className="text-zinc-500 font-medium">Shipping free</span>
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
              <CleanInput type="number" value={shippingAmount || ''} onChange={e => setShippingAmount(parseFloat(e.target.value) || 0)} className="text-right pl-6 h-10" />
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-6 mt-4">
            <span className="text-[16px] font-bold text-[#3b82f6]">Total</span>
            <span className="text-[20px] font-bold text-[#3b82f6]">{fmt(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-zinc-100 pt-8 pb-20">
         <button 
           onClick={() => setShowPreview(true)}
           className="px-8 py-3.5 bg-[#3b82f6] hover:bg-blue-700 text-white font-medium text-[15px] rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
         >
           Preview & Download
           <ArrowRight size={18} />
         </button>
      </div>

    </div>
  );
}
