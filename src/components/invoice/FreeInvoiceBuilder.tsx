'use client';

import React, { useState, useRef } from 'react';
import { Download, Plus, X, UploadCloud, Calendar, Building2, UserCircle2, Sparkles, Hash, FileText, CheckCircle2 } from 'lucide-react';
import { InvoiceData, InvoiceItem } from './types';
import { ModernTemplate } from './templates/ModernTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';

type TemplateType = 'modern' | 'minimal' | 'classic';

export function FreeInvoiceBuilder() {
  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- State ---
  const [logoUrl, setLogoUrl] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-001');
  const [companyDetails, setCompanyDetails] = useState('');
  const [clientDetails, setClientDetails] = useState('');
  
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unit_price: '', amount: 0 },
  ]);

  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');

  // --- Calcs ---
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount - discountAmount;

  const invoiceData: InvoiceData = {
    logoUrl, invoiceNumber, companyDetails, clientDetails, issueDate, dueDate,
    items, notes, taxRate, discountAmount, subtotal, taxAmount, total
  };

  const fmtSummary = (v: number) => {
    return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleItemChange = (i: number, field: keyof Omit<InvoiceItem, 'amount'>, v: any) => {
    const u = [...items];
    u[i][field] = v;
    
    const qty = parseFloat(u[i].quantity.toString()) || 0;
    const price = parseFloat(u[i].unit_price.toString()) || 0;
    u[i].amount = qty * price;
    
    setItems(u);
  };

  const addRow = () => setItems([...items, { description: '', quantity: 1, unit_price: '', amount: 0 }]);
  const removeRow = (i: number) => { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)); };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsDownloading(true);

    try {
      const htmlToImageModule = await import('html-to-image');
      const toPng = htmlToImageModule.toPng;
      const jsPDFModule = await import('jspdf') as any;
      const JsPDFClass = jsPDFModule.default?.jsPDF || (typeof jsPDFModule.default === 'function' ? jsPDFModule.default : jsPDFModule.jsPDF);
      
      // We capture the hidden printRef directly. It is already perfectly formatted!
      // We need to briefly ensure it's visible in the DOM (though offscreen) for html2image to work properly
      printRef.current.style.display = 'block';
      
      const imgData = await toPng(printRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      
      printRef.current.style.display = 'none';

      const pdf = new JsPDFClass('p', 'mm', 'a4');
      const pw = pdf.internal.pageSize.getWidth();
      const ph = (printRef.current.offsetHeight * pw) / printRef.current.offsetWidth;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pw, ph);
      pdf.save(`${invoiceNumber || 'Invoice'}.pdf`);
    } catch (err: any) {
      console.error('PDF Error:', err);
      alert('Failed to generate PDF');
      if (printRef.current) printRef.current.style.display = 'none';
    } finally {
      setIsDownloading(false);
    }
  };

  // Modern, premium styling for the dashboard
  const boxStyle = "w-full bg-white border border-indigo-100 hover:border-indigo-200 focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/20 rounded-2xl px-4 py-3 text-[15px] font-medium text-slate-800 placeholder:text-slate-400 transition-all duration-300 shadow-sm outline-none";
  const labelStyle = "flex items-center gap-2 text-[13px] font-bold text-indigo-900/70 mb-2 uppercase tracking-wide";
  const cardStyle = "bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_40px_-15px_rgba(79,70,229,0.1)] rounded-[2rem] p-6 sm:p-10 relative overflow-hidden";

  return (
    <div className="w-full min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-blue-50 py-12 px-2 sm:px-6 flex justify-center font-sans">
      
      {/* Hidden Print Container - Always perfectly 794px wide for A4 */}
      <div className="absolute top-0 left-[-9999px] overflow-hidden" style={{ width: '794px' }}>
         <div ref={printRef} style={{ display: 'none' }}>
           {selectedTemplate === 'modern' && <ModernTemplate data={invoiceData} renderRef={null as any} />}
           {selectedTemplate === 'minimal' && <MinimalTemplate data={invoiceData} renderRef={null as any} />}
           {selectedTemplate === 'classic' && <ClassicTemplate data={invoiceData} renderRef={null as any} />}
         </div>
      </div>

      {/* Master Container */}
      <div className="w-full max-w-[900px] mb-24">
        
        {/* Template Selector */}
        <div className="mb-8 flex flex-col sm:flex-row items-center gap-4 bg-white/60 backdrop-blur-xl border border-white p-2 rounded-full shadow-sm mx-auto max-w-fit">
           {(['modern', 'minimal', 'classic'] as TemplateType[]).map((t) => (
             <button
               key={t}
               onClick={() => setSelectedTemplate(t)}
               className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all capitalize ${selectedTemplate === t ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-white'}`}
             >
               {selectedTemplate === t && <CheckCircle2 size={16} />}
               {t} Design
             </button>
           ))}
        </div>

        <div className={cardStyle}>
          {/* Subtle decorative blob */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header Row */}
          <div className="flex flex-col-reverse md:flex-row justify-between items-start gap-8 mb-10 relative z-10">
            {/* Logo */}
            <div className="w-full md:w-1/2">
              <div className="mb-2">
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => { setLogoUrl(ev.target?.result as string); };
                    reader.readAsDataURL(file);
                  } else { setLogoUrl(''); }
                  e.target.value = '';
                }} />
                {logoUrl ? (
                  <div className="relative inline-block border-2 border-indigo-50 rounded-2xl p-2 bg-white shadow-sm group">
                    <img src={logoUrl} alt="Logo" className="h-20 object-contain" />
                    <button onClick={() => setLogoUrl('')} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="group w-[180px] h-[80px] border-2 border-dashed border-indigo-200 rounded-2xl flex flex-col items-center justify-center text-indigo-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all bg-white/50">
                    <UploadCloud size={24} className="mb-1 group-hover:-translate-y-1 transition-transform" />
                    <span className="text-[12px] font-bold">Upload Logo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Title & Number */}
            <div className="w-full md:w-1/2 flex flex-col md:items-end">
              <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-br from-indigo-900 to-indigo-600 bg-clip-text text-transparent tracking-tighter mb-4">
                INVOICE
              </h1>
              <div className="flex items-center w-full md:max-w-[240px] bg-white border border-indigo-100 rounded-2xl shadow-sm overflow-hidden focus-within:border-indigo-500 focus-within:ring-[3px] focus-within:ring-indigo-500/20 transition-all">
                <div className="bg-indigo-50 text-indigo-400 font-bold px-4 py-3 border-r border-indigo-100 flex items-center justify-center">
                  <Hash size={16} strokeWidth={3} />
                </div>
                <input 
                  value={invoiceNumber} 
                  onChange={e => setInvoiceNumber(e.target.value)} 
                  placeholder="INV-2026-001" 
                  className="w-full bg-transparent border-none outline-none px-3 py-3 text-[15px] font-bold text-slate-800" 
                />
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-100 to-transparent mb-10"></div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 relative z-10">
            <div className="bg-indigo-50/30 rounded-3xl p-5 sm:p-6 border border-indigo-50">
              <label className={labelStyle}><Building2 size={16} className="text-indigo-500" /> From</label>
              <textarea 
                value={companyDetails} 
                onChange={e => setCompanyDetails(e.target.value)} 
                placeholder="Your Company Name&#10;123 Business Rd.&#10;City, State, Zip" 
                rows={3} 
                className={`${boxStyle} bg-white/80`} 
              />
            </div>
            
            <div className="bg-blue-50/30 rounded-3xl p-5 sm:p-6 border border-blue-50">
              <label className={labelStyle}><UserCircle2 size={16} className="text-blue-500" /> Bill To</label>
              <textarea 
                value={clientDetails} 
                onChange={e => setClientDetails(e.target.value)} 
                placeholder="Client Name&#10;456 Client St.&#10;City, State, Zip" 
                rows={3} 
                className={`${boxStyle} bg-white/80`} 
              />
            </div>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 relative z-10">
            <div>
              <label className={labelStyle}><Calendar size={16} className="text-indigo-400" /> Date Issued</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={issueDate} 
                  onChange={e => setIssueDate(e.target.value)} 
                  className={`${boxStyle} [&::-webkit-calendar-picker-indicator]:opacity-0 z-10 relative bg-white cursor-pointer`} 
                />
                <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-300 z-0 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelStyle}><Calendar size={16} className="text-indigo-400" /> Due Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                  className={`${boxStyle} [&::-webkit-calendar-picker-indicator]:opacity-0 z-10 relative bg-white cursor-pointer`} 
                />
                <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-300 z-0 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="mb-10 relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-indigo-100 p-2 rounded-xl"><FileText size={18} className="text-indigo-600" /></div>
              <h2 className="text-xl font-bold text-slate-800">Invoice Items</h2>
            </div>
            
            <div className="hidden sm:flex bg-indigo-900 text-indigo-50 rounded-2xl p-4 text-[12px] font-bold uppercase tracking-widest shadow-md mb-4">
              <div className="flex-1 pl-2">Description</div>
              <div className="w-[120px] text-right pr-2">Rate</div>
              <div className="w-[100px] text-right pr-2">Qty</div>
              <div className="w-[140px] text-right pr-2">Amount</div>
              <div className="w-10"></div>
            </div>
            
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white p-5 sm:p-2 border border-indigo-50 rounded-3xl sm:rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                   <div className="w-full sm:flex-1 sm:pl-2">
                     <label className="sm:hidden text-[11px] font-bold text-indigo-400 uppercase mb-2 block">Description</label>
                     <input 
                       value={item.description} 
                       onChange={e => handleItemChange(idx, 'description', e.target.value)} 
                       placeholder="Service or product description" 
                       className={boxStyle} 
                     />
                   </div>
                   
                   <div className="flex w-full sm:w-auto gap-4">
                     <div className="flex-1 sm:w-[120px]">
                       <label className="sm:hidden text-[11px] font-bold text-indigo-400 uppercase mb-2 block">Rate</label>
                       <input 
                         type="number" placeholder="0.00" 
                         value={item.unit_price} 
                         onChange={e => handleItemChange(idx, 'unit_price', e.target.value)} 
                         className={`${boxStyle} sm:text-right`} 
                       />
                     </div>
                     
                     <div className="flex-1 sm:w-[100px]">
                       <label className="sm:hidden text-[11px] font-bold text-indigo-400 uppercase mb-2 block">Qty</label>
                       <input 
                         type="number" placeholder="1" 
                         value={item.quantity} 
                         onChange={e => handleItemChange(idx, 'quantity', e.target.value)} 
                         className={`${boxStyle} sm:text-right`} 
                       />
                     </div>
                   </div>
                   
                   <div className="w-full sm:w-[140px]">
                     <label className="sm:hidden text-[11px] font-bold text-indigo-400 uppercase mb-2 block">Amount</label>
                     <input 
                       value={item.amount > 0 ? item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''} 
                       readOnly placeholder="0.00" 
                       className="w-full bg-indigo-50/50 border border-transparent rounded-2xl py-3 px-4 text-right text-[15px] font-bold text-indigo-950 cursor-default" 
                     />
                   </div>

                   <div className="w-full sm:w-10 flex justify-end sm:justify-center mt-2 sm:mt-0">
                     <button 
                       onClick={() => removeRow(idx)} disabled={items.length === 1} 
                       className="text-slate-300 hover:text-red-500 hover:bg-red-50 bg-white border border-slate-200 sm:border-transparent p-2.5 rounded-xl transition-all disabled:opacity-0"
                     >
                       <X size={18} strokeWidth={3} />
                     </button>
                   </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={addRow} 
              className="mt-6 flex items-center gap-2 px-5 py-3 bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 font-bold text-[14px] rounded-2xl transition-all shadow-sm"
            >
              <Plus size={18} strokeWidth={3} /> Add Another Item
            </button>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-100 to-transparent mb-10"></div>

          {/* Footer Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
            
            <div className="lg:col-span-7">
              <label className={labelStyle}><Sparkles size={16} className="text-amber-500" /> Notes & Payment Terms</label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="Thank you for your business! Please make payment within 15 days." 
                rows={5} 
                className={`${boxStyle} bg-amber-50/30 border-amber-100 focus:border-amber-400 focus:ring-amber-400/20`} 
              />
            </div>
            
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-8 shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center text-[15px]">
                      <span className="font-medium text-slate-300">Subtotal</span>
                      <span className="font-bold">{fmtSummary(subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[15px]">
                      <span className="font-medium text-slate-300">Tax (%)</span>
                      <input 
                        type="number" 
                        value={taxRate || ''} 
                        onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} 
                        placeholder="0" 
                        className="w-20 bg-slate-700/50 border border-slate-600 rounded-xl text-right px-3 py-1.5 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition-all"
                      />
                    </div>
                    {taxAmount > 0 && (
                      <div className="flex justify-between items-center text-[15px]">
                        <span className="font-medium text-slate-300">Tax</span>
                        <span className="font-bold">{fmtSummary(taxAmount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-[15px]">
                      <span className="font-medium text-slate-300">Discount ($)</span>
                      <input 
                        type="number" 
                        value={discountAmount || ''} 
                        onChange={e => setDiscountAmount(parseFloat(e.target.value) || 0)} 
                        placeholder="0" 
                        className="w-24 bg-slate-700/50 border border-slate-600 rounded-xl text-right px-3 py-1.5 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition-all"
                      />
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-[15px] text-emerald-400">
                        <span className="font-medium">Discount</span>
                        <span className="font-bold">-{fmtSummary(discountAmount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-700/50 flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</span>
                    <span className="text-[40px] font-black text-white tracking-tight">{fmtSummary(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="group px-8 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[16px] rounded-full shadow-[0_20px_40px_-10px_rgba(79,70,229,0.8)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3 disabled:opacity-50 border border-indigo-400/30 overflow-hidden relative"
        >
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          {isDownloading ? (
            <span className="h-5 w-5 rounded-full border-4 border-white/30 border-t-white animate-spin relative z-10" />
          ) : (
            <><Download size={22} className="relative z-10" /> <span className="relative z-10">Download PDF</span></>
          )}
        </button>
      </div>

    </div>
  );
}
