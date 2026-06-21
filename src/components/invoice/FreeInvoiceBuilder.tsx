'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, Plus, X, UploadCloud, Calendar } from 'lucide-react';

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

  const [isDownloading, setIsDownloading] = useState(false);

  // --- Calcs ---
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const total = subtotal;

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

    try {
      const htmlToImageModule = await import('html-to-image');
      const toPng = htmlToImageModule.toPng;
      
      const jsPDFModule = await import('jspdf') as any;
      const JsPDFClass = jsPDFModule.default?.jsPDF || (typeof jsPDFModule.default === 'function' ? jsPDFModule.default : jsPDFModule.jsPDF);
      
      // Temporarily hide UI elements for printing
      const uiElements = invoiceRef.current.querySelectorAll('.hide-on-print');
      uiElements.forEach(el => (el as HTMLElement).style.opacity = '0');
      
      // Remove borders and backgrounds temporarily for a clean print
      const inputs = invoiceRef.current.querySelectorAll('input, textarea');
      inputs.forEach(el => {
        (el as HTMLElement).style.background = 'transparent';
        (el as HTMLElement).style.border = 'none';
        (el as HTMLElement).style.boxShadow = 'none';
        (el as HTMLElement).style.padding = '0';
      });

      const imgData = await toPng(invoiceRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      
      // Restore UI elements
      uiElements.forEach(el => (el as HTMLElement).style.opacity = '1');
      inputs.forEach(el => {
        (el as HTMLElement).style.background = '';
        (el as HTMLElement).style.border = '';
        (el as HTMLElement).style.boxShadow = '';
        (el as HTMLElement).style.padding = '';
      });

      const pdf = new JsPDFClass('p', 'mm', 'a4');
      const pw = pdf.internal.pageSize.getWidth();
      const ph = (invoiceRef.current.offsetHeight * pw) / invoiceRef.current.offsetWidth;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pw, ph);
      pdf.save(`${invoiceNumber || 'Invoice'}.pdf`);
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      alert('Failed to generate PDF: ' + (err?.message || err));
    } finally {
      setIsDownloading(false);
    }
  };

  const inputStyles = "w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all rounded-lg py-2 px-3 text-zinc-900 placeholder:text-zinc-400 shadow-[0_1px_2px_rgba(0,0,0,0.02)]";
  const textStyles = "w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all rounded-lg py-2 px-3 resize-none text-zinc-900 placeholder:text-zinc-400 shadow-[0_1px_2px_rgba(0,0,0,0.02)]";
  const rightInputStyles = "w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all rounded-lg py-2 px-3 text-right text-zinc-900 placeholder:text-zinc-400 shadow-[0_1px_2px_rgba(0,0,0,0.02)]";

  return (
    <div className="w-full flex flex-col items-center justify-center font-sans pb-24">
      
      {/* Editor Container (Looks like an A4 paper) */}
      <div 
        ref={invoiceRef}
        className="w-full max-w-[850px] bg-white sm:p-16 p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-sm my-12 border border-zinc-200 relative"
        style={{ minHeight: '1100px' }}
      >
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div className="w-full md:w-1/2">
            {/* Logo Upload */}
            <div className="mb-6">
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
                <div className="relative group inline-block">
                  <img src={logoUrl} alt="Logo" className="max-h-20 object-contain" />
                  <button 
                    onClick={() => setLogoUrl('')}
                    className="absolute inset-0 bg-black/50 text-white text-xs font-semibold rounded opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all hide-on-print"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-20 w-48 border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center text-zinc-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 transition-all hide-on-print"
                >
                  <UploadCloud size={24} strokeWidth={1.5} className="mb-1" />
                  <span className="text-xs font-semibold">Upload Logo</span>
                </button>
              )}
            </div>

            {/* From Details */}
            <textarea 
              value={companyDetails} 
              onChange={e => setCompanyDetails(e.target.value)} 
              placeholder="Your Company Name&#10;123 Business Rd&#10;City, State, Zip" 
              rows={4} 
              className={`${textStyles} text-[15px] font-medium leading-relaxed`} 
            />
          </div>

          <div className="w-full md:w-1/2 flex flex-col items-start md:items-end md:text-right">
            <h1 className="text-5xl font-black tracking-widest text-zinc-200 uppercase mb-6">Invoice</h1>
            <div className="flex items-center justify-end w-full max-w-[200px]">
              <span className="text-zinc-400 font-bold text-xl mr-2">#</span>
              <input 
                value={invoiceNumber} 
                onChange={e => setInvoiceNumber(e.target.value)} 
                placeholder="INV-001" 
                className={`${rightInputStyles} text-xl font-bold placeholder:font-normal`} 
              />
            </div>
          </div>
        </div>

        {/* Bill To & Dates */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-16">
          <div className="w-full md:w-1/2">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-zinc-400 mb-3 px-2">Bill To</h3>
            <textarea 
              value={clientDetails} 
              onChange={e => setClientDetails(e.target.value)} 
              placeholder="Client Name&#10;456 Client St&#10;City, State, Zip" 
              rows={4} 
              className={`${textStyles} text-[15px] leading-relaxed`} 
            />
          </div>
          <div className="w-full md:w-1/2 flex gap-8 md:justify-end">
            <div className="w-32">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-zinc-400 mb-3 md:text-right px-2 md:px-0">Date Issued</h3>
              <div className="relative">
                <input 
                  type="date" 
                  value={issueDate} 
                  onChange={e => setIssueDate(e.target.value)} 
                  className={`${rightInputStyles} text-[15px] font-medium [&::-webkit-calendar-picker-indicator]:opacity-0 z-10 relative bg-transparent cursor-pointer`} 
                />
                <Calendar size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none z-0 hide-on-print md:hidden" />
              </div>
            </div>
            <div className="w-32">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-zinc-400 mb-3 md:text-right px-2 md:px-0">Due Date</h3>
              <div className="relative">
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                  className={`${rightInputStyles} text-[15px] font-medium [&::-webkit-calendar-picker-indicator]:opacity-0 z-10 relative bg-transparent cursor-pointer`} 
                />
                <Calendar size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none z-0 hide-on-print md:hidden" />
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-12">
          <div className="flex border-b-2 border-zinc-100 pb-3 mb-3 px-2 text-[12px] font-bold uppercase tracking-widest text-zinc-400">
            <div className="flex-1">Description</div>
            <div className="w-24 text-right">Rate</div>
            <div className="w-20 text-right">Qty</div>
            <div className="w-28 text-right">Amount</div>
            <div className="w-8 ml-2 hide-on-print"></div>
          </div>
          
          <div className="space-y-1">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center group">
                 <div className="flex-1">
                   <input 
                     value={item.description} 
                     onChange={e => handleItemChange(idx, 'description', e.target.value)} 
                     placeholder="Item description" 
                     className={`${inputStyles} text-[15px] font-medium`} 
                   />
                 </div>
                 
                 <div className="w-24 relative">
                   <input 
                     type="number" 
                     placeholder="0.00" 
                     value={item.unit_price} 
                     onChange={e => handleItemChange(idx, 'unit_price', e.target.value)} 
                     className={`${rightInputStyles} text-[15px]`} 
                   />
                 </div>
                 
                 <div className="w-20">
                   <input 
                     type="number" 
                     placeholder="1" 
                     value={item.quantity} 
                     onChange={e => handleItemChange(idx, 'quantity', e.target.value)} 
                     className={`${rightInputStyles} text-[15px]`} 
                   />
                 </div>
                 
                 <div className="w-28">
                   <input 
                     value={item.amount > 0 ? item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''} 
                     readOnly 
                     placeholder="0.00" 
                     className="w-full bg-slate-50 border border-transparent text-right py-2 px-3 rounded-lg text-[15px] font-semibold text-zinc-900 cursor-default" 
                   />
                 </div>

                 <div className="w-8 flex justify-center hide-on-print opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => removeRow(idx)} 
                     disabled={items.length === 1} 
                     className="text-zinc-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded disabled:opacity-0 transition-colors"
                   >
                     <X size={16} strokeWidth={2.5} />
                   </button>
                 </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={addRow} 
            className="mt-4 flex items-center gap-2 text-blue-500 font-semibold text-[13px] hover:text-blue-600 transition-colors px-2 hide-on-print"
          >
            <div className="h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center transition-colors">
              <Plus size={14} strokeWidth={3} />
            </div>
            Add Line Item
          </button>
        </div>

        {/* Footer: Notes & Totals */}
        <div className="flex flex-col md:flex-row justify-between gap-16 mt-auto">
          {/* Notes */}
          <div className="flex-1">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-zinc-400 mb-3 px-2">Notes</h3>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="Thank you for your business! Payment is due within 15 days." 
              rows={4} 
              className={`${textStyles} text-[14px] leading-relaxed`} 
            />
          </div>
          
          {/* Totals */}
          <div className="w-full md:w-[320px]">
            <div className="space-y-3 mb-6 px-2">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-[15px] font-semibold text-slate-500">Subtotal</span>
                <span className="text-[16px] font-semibold text-slate-900">{fmtSummary(subtotal)}</span>
              </div>
            </div>
            
            {/* Grand Total */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex justify-between items-center shadow-sm">
              <span className="text-[16px] font-bold text-slate-800">Total</span>
              <span className="text-[32px] font-black text-blue-600 tracking-tight">{fmtSummary(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Download */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] rounded-full shadow-[0_10px_40px_-10px_rgba(37,99,235,0.6)] hover:shadow-[0_10px_40px_-10px_rgba(37,99,235,0.8)] transition-all active:scale-[0.95] flex items-center gap-3 disabled:opacity-50"
        >
          {isDownloading ? (
            <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <><Download size={20} /> Download PDF</>
          )}
        </button>
      </div>

    </div>
  );
}
