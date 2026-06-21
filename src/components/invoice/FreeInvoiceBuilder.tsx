'use client';

import React, { useState, useRef } from 'react';
import { Download, Plus, X, UploadCloud, Calendar, Building, User, FileText, FileSignature, Calculator, LayoutList } from 'lucide-react';

interface InvoiceItem {
  description: string;
  quantity: string | number;
  unit_price: string | number;
  amount: number;
}

export function FreeInvoiceBuilder() {
  const invoiceRef = useRef<HTMLDivElement>(null);

  // --- State ---
  const [logoUrl, setLogoUrl] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-001');
  const [companyDetails, setCompanyDetails] = useState('');
  const [clientDetails, setClientDetails] = useState('');
  
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unit_price: '', amount: 0 },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // --- Calcs ---
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount - discountAmount;

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
    if (!invoiceRef.current) return;
    setIsDownloading(true);

    try {
      const htmlToImageModule = await import('html-to-image');
      const toPng = htmlToImageModule.toPng;
      const jsPDFModule = await import('jspdf') as any;
      const JsPDFClass = jsPDFModule.default?.jsPDF || (typeof jsPDFModule.default === 'function' ? jsPDFModule.default : jsPDFModule.jsPDF);
      
      const uiElements = invoiceRef.current.querySelectorAll('.hide-on-print');
      uiElements.forEach(el => (el as HTMLElement).style.display = 'none');
      
      const inputs = invoiceRef.current.querySelectorAll('.print-input');
      inputs.forEach(el => {
        (el as HTMLElement).style.border = 'none';
        (el as HTMLElement).style.background = 'transparent';
        (el as HTMLElement).style.boxShadow = 'none';
        (el as HTMLElement).style.padding = '0';
        (el as HTMLElement).style.resize = 'none';
      });
      
      const labels = invoiceRef.current.querySelectorAll('.print-label');
      labels.forEach(el => {
         if (el.classList.contains('hide-on-print-label')) {
            (el as HTMLElement).style.display = 'none';
         }
      });

      const imgData = await toPng(invoiceRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      
      uiElements.forEach(el => (el as HTMLElement).style.display = '');
      inputs.forEach(el => {
        (el as HTMLElement).style.border = '';
        (el as HTMLElement).style.background = '';
        (el as HTMLElement).style.boxShadow = '';
        (el as HTMLElement).style.padding = '';
        (el as HTMLElement).style.resize = '';
      });
      labels.forEach(el => {
         if (el.classList.contains('hide-on-print-label')) {
            (el as HTMLElement).style.display = '';
         }
      });

      const pdf = new JsPDFClass('p', 'mm', 'a4');
      const pw = pdf.internal.pageSize.getWidth();
      const ph = (invoiceRef.current.offsetHeight * pw) / invoiceRef.current.offsetWidth;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pw, ph);
      pdf.save(`${invoiceNumber || 'Invoice'}.pdf`);
    } catch (err: any) {
      console.error('PDF Error:', err);
      alert('Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  // Ultra-compact, beautiful box styling
  const boxStyle = "print-input w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white rounded-md px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all shadow-sm";
  const labelStyle = "flex items-center gap-1.5 text-[13px] font-bold text-slate-700 mb-1.5";

  return (
    <div className="w-full flex justify-center bg-slate-50 py-4 px-2 sm:px-4 pb-28">
      
      {/* Compact Dashboard Container */}
      <div 
        ref={invoiceRef}
        className="w-full max-w-[850px] bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden relative"
      >
        {/* Top Accent Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hide-on-print"></div>
        
        <div className="p-4 sm:p-6 md:p-8">
          
          {/* Header Row: Logo & Invoice Title/Number */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div className="w-full sm:w-1/2">
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
                  <div className="relative inline-block border border-slate-200 rounded p-1">
                    <img src={logoUrl} alt="Logo" className="h-16 object-contain" />
                    <button onClick={() => setLogoUrl('')} className="hide-on-print absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600">
                      <X size={12} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="hide-on-print w-[140px] h-[60px] border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all">
                    <UploadCloud size={20} className="mb-1" />
                    <span className="text-[11px] font-bold">Add Logo</span>
                  </button>
                )}
              </div>
            </div>

            <div className="w-full sm:w-1/2 flex flex-col sm:items-end">
              <h1 className="text-3xl font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText className="text-blue-600 hide-on-print" size={28} />
                INVOICE
              </h1>
              <div className="flex items-center w-full sm:max-w-[180px] bg-slate-50 border border-slate-200 rounded-md overflow-hidden">
                <span className="bg-slate-100 text-slate-500 font-bold px-3 py-1.5 border-r border-slate-200 text-sm">#</span>
                <input 
                  value={invoiceNumber} 
                  onChange={e => setInvoiceNumber(e.target.value)} 
                  placeholder="INV-001" 
                  className="print-input w-full bg-transparent border-none focus:ring-0 outline-none px-2 py-1.5 text-sm font-bold text-slate-900 sm:text-right" 
                />
              </div>
            </div>
          </div>

          <div className="border-b border-slate-100 mb-6 hide-on-print"></div>

          {/* Details Row: From, To, Dates */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
            
            {/* From */}
            <div className="md:col-span-4">
              <label className={labelStyle}><Building size={14} className="text-blue-500 hide-on-print" /> From (Your Details)</label>
              <textarea 
                value={companyDetails} 
                onChange={e => setCompanyDetails(e.target.value)} 
                placeholder="Company Name&#10;Address&#10;City, State" 
                rows={3} 
                className={boxStyle} 
              />
            </div>
            
            {/* Bill To */}
            <div className="md:col-span-4">
              <label className={labelStyle}><User size={14} className="text-blue-500 hide-on-print" /> Bill To</label>
              <textarea 
                value={clientDetails} 
                onChange={e => setClientDetails(e.target.value)} 
                placeholder="Client Name&#10;Address&#10;City, State" 
                rows={3} 
                className={boxStyle} 
              />
            </div>

            {/* Dates */}
            <div className="md:col-span-4 flex flex-row md:flex-col gap-3">
              <div className="flex-1">
                <label className={labelStyle}><Calendar size={14} className="text-blue-500 hide-on-print" /> Date Issued</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={issueDate} 
                    onChange={e => setIssueDate(e.target.value)} 
                    className={`${boxStyle} [&::-webkit-calendar-picker-indicator]:opacity-0 z-10 relative bg-transparent cursor-pointer`} 
                  />
                  <Calendar size={14} className="hide-on-print absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-0" />
                </div>
              </div>
              <div className="flex-1">
                <label className={labelStyle}><Calendar size={14} className="text-blue-500 hide-on-print" /> Due Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={dueDate} 
                    onChange={e => setDueDate(e.target.value)} 
                    className={`${boxStyle} [&::-webkit-calendar-picker-indicator]:opacity-0 z-10 relative bg-transparent cursor-pointer`} 
                  />
                  <Calendar size={14} className="hide-on-print absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-6">
            <label className={`${labelStyle} mb-3 text-[14px]`}><LayoutList size={16} className="text-blue-500 hide-on-print" /> Line Items</label>
            
            {/* Table Headers */}
            <div className="hidden sm:flex bg-slate-800 text-white rounded-t-md p-2 text-[11px] font-bold uppercase tracking-wider">
              <div className="flex-1 pl-2">Description</div>
              <div className="w-[100px] text-right pr-2">Rate</div>
              <div className="w-[80px] text-right pr-2">Qty</div>
              <div className="w-[100px] text-right pr-2">Amount</div>
              <div className="w-8 hide-on-print"></div>
            </div>
            
            <div className="space-y-3 sm:space-y-0">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-0 items-start sm:items-center bg-slate-50 sm:bg-white p-3 sm:p-2 border border-slate-200 rounded-lg sm:rounded-none sm:border-t-0 sm:last:rounded-b-md">
                   
                   <div className="w-full sm:flex-1 sm:pr-2">
                     <label className="print-label hide-on-print-label sm:hidden text-[10px] font-bold text-slate-500 uppercase mb-1 block">Description</label>
                     <input 
                       value={item.description} 
                       onChange={e => handleItemChange(idx, 'description', e.target.value)} 
                       placeholder="Item description" 
                       className={boxStyle} 
                     />
                   </div>
                   
                   <div className="flex w-full sm:w-auto gap-2">
                     <div className="flex-1 sm:w-[100px] sm:pr-2">
                       <label className="print-label hide-on-print-label sm:hidden text-[10px] font-bold text-slate-500 uppercase mb-1 block">Rate</label>
                       <input 
                         type="number" placeholder="0.00" 
                         value={item.unit_price} 
                         onChange={e => handleItemChange(idx, 'unit_price', e.target.value)} 
                         className={`${boxStyle} sm:text-right`} 
                       />
                     </div>
                     
                     <div className="flex-1 sm:w-[80px] sm:pr-2">
                       <label className="print-label hide-on-print-label sm:hidden text-[10px] font-bold text-slate-500 uppercase mb-1 block">Qty</label>
                       <input 
                         type="number" placeholder="1" 
                         value={item.quantity} 
                         onChange={e => handleItemChange(idx, 'quantity', e.target.value)} 
                         className={`${boxStyle} sm:text-right`} 
                       />
                     </div>
                   </div>
                   
                   <div className="w-full sm:w-[100px] sm:pr-2">
                     <label className="print-label hide-on-print-label sm:hidden text-[10px] font-bold text-slate-500 uppercase mb-1 block">Amount</label>
                     <input 
                       value={item.amount > 0 ? item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''} 
                       readOnly placeholder="0.00" 
                       className="print-input w-full bg-slate-100 border border-slate-200 rounded-md py-1.5 px-3 text-right text-sm font-bold text-slate-900 cursor-default" 
                     />
                   </div>

                   <div className="hide-on-print w-full sm:w-8 flex justify-end sm:justify-center mt-1 sm:mt-0">
                     <button 
                       onClick={() => removeRow(idx)} disabled={items.length === 1} 
                       className="text-slate-400 hover:text-red-500 bg-white sm:bg-transparent border border-slate-300 sm:border-transparent p-1.5 rounded-md transition-all disabled:opacity-30"
                     >
                       <X size={16} strokeWidth={2.5} />
                     </button>
                   </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={addRow} 
              className="hide-on-print mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-[12px] rounded-md transition-colors border border-blue-100"
            >
              <Plus size={14} strokeWidth={3} /> Add Item
            </button>
          </div>

          <div className="border-b border-slate-100 mb-6 hide-on-print"></div>

          {/* Footer Notes & Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
            
            {/* Notes */}
            <div className="sm:col-span-7">
              <label className={labelStyle}><FileSignature size={14} className="text-blue-500 hide-on-print" /> Notes / Payment Terms</label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="Thank you for your business! Payment is due within 15 days." 
                rows={4} 
                className={boxStyle} 
              />
            </div>
            
            {/* Totals */}
            <div className="sm:col-span-5">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm">
                <label className={`${labelStyle} mb-3`}><Calculator size={14} className="text-blue-500 hide-on-print" /> Summary</label>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-500">Subtotal</span>
                    <span className="font-bold text-slate-800">{fmtSummary(subtotal)}</span>
                  </div>
                  
                  {/* Tax & Discount Inputs to fill space nicely */}
                  <div className="flex justify-between items-center text-sm hide-on-print">
                    <span className="font-semibold text-slate-500">Tax (%)</span>
                    <input 
                      type="number" 
                      value={taxRate || ''} 
                      onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} 
                      placeholder="0" 
                      className="w-16 bg-white border border-slate-300 rounded text-right px-2 py-0.5 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  {taxAmount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-500">Tax</span>
                      <span className="font-bold text-slate-800">{fmtSummary(taxAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm hide-on-print">
                    <span className="font-semibold text-slate-500">Discount ($)</span>
                    <input 
                      type="number" 
                      value={discountAmount || ''} 
                      onChange={e => setDiscountAmount(parseFloat(e.target.value) || 0)} 
                      placeholder="0" 
                      className="w-20 bg-white border border-slate-300 rounded text-right px-2 py-0.5 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span className="font-semibold">Discount</span>
                      <span className="font-bold">-{fmtSummary(discountAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-[16px] font-bold text-slate-900">Total</span>
                  <span className="text-[24px] font-black text-blue-600">{fmtSummary(total)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[14px] rounded-full shadow-[0_8px_30px_-5px_rgba(37,99,235,0.8)] transition-all active:scale-[0.95] flex items-center gap-2 disabled:opacity-50"
        >
          {isDownloading ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <><Download size={18} /> Download PDF</>
          )}
        </button>
      </div>

    </div>
  );
}
