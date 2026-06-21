'use client';

import React, { useState, useRef } from 'react';
import { Download, Plus, X, UploadCloud, Calendar } from 'lucide-react';

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
      
      // PREPARE FOR PRINT: Hide UI elements
      const uiElements = invoiceRef.current.querySelectorAll('.hide-on-print');
      uiElements.forEach(el => (el as HTMLElement).style.display = 'none');
      
      // PREPARE FOR PRINT: Remove borders to make it look like a real document
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
         // Only hide labels that are meant to be hidden on print (like mobile headers)
         if (el.classList.contains('hide-on-print-label')) {
            (el as HTMLElement).style.display = 'none';
         }
      });

      const imgData = await toPng(invoiceRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      
      // RESTORE AFTER PRINT
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

  // Very clear box styling for user understanding
  const boxStyle = "print-input w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none rounded-lg px-3 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 shadow-sm transition-all";
  const labelStyle = "block text-[13px] font-bold text-slate-700 mb-1.5";

  return (
    <div className="w-full flex justify-center bg-slate-50 py-8 px-2 md:px-6">
      
      {/* Container */}
      <div 
        ref={invoiceRef}
        className="w-full max-w-[850px] bg-white shadow-xl rounded-2xl border border-slate-200 p-5 md:p-12 relative"
      >
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
          {/* Logo */}
          <div className="w-full md:w-1/2">
            <label className={labelStyle}>Company Logo</label>
            <div className="mb-4">
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
                <div className="relative inline-block border border-slate-200 rounded-lg p-2">
                  <img src={logoUrl} alt="Logo" className="max-h-20 object-contain" />
                  <button onClick={() => setLogoUrl('')} className="hide-on-print absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                    <X size={14} strokeWidth={3} />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="hide-on-print w-[180px] h-[80px] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all bg-slate-50">
                  <UploadCloud size={24} className="mb-1" />
                  <span className="text-[12px] font-bold">Upload Logo</span>
                </button>
              )}
            </div>

            <label className={labelStyle}>Your Details (From)</label>
            <textarea 
              value={companyDetails} 
              onChange={e => setCompanyDetails(e.target.value)} 
              placeholder="Your Company Name&#10;Address&#10;City, State" 
              rows={3} 
              className={boxStyle} 
            />
          </div>

          {/* Invoice Info */}
          <div className="w-full md:w-1/2 flex flex-col md:items-end">
            <h1 className="text-4xl md:text-5xl font-black text-slate-200 uppercase tracking-widest mb-6">Invoice</h1>
            <div className="w-full md:max-w-[220px]">
              <label className={`${labelStyle} md:text-right`}>Invoice Number</label>
              <div className="flex items-center">
                <span className="text-slate-400 font-bold text-lg mr-2">#</span>
                <input 
                  value={invoiceNumber} 
                  onChange={e => setInvoiceNumber(e.target.value)} 
                  placeholder="INV-001" 
                  className={`${boxStyle} text-lg font-bold md:text-right`} 
                />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-slate-100 mb-8 hide-on-print" />

        {/* Client & Dates */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
          <div className="w-full md:w-1/2">
            <label className={labelStyle}>Bill To (Client Details)</label>
            <textarea 
              value={clientDetails} 
              onChange={e => setClientDetails(e.target.value)} 
              placeholder="Client Name&#10;Address&#10;City, State" 
              rows={3} 
              className={boxStyle} 
            />
          </div>
          
          <div className="w-full md:w-1/2 flex flex-col sm:flex-row gap-4 md:justify-end">
            <div className="w-full sm:w-[150px]">
              <label className={labelStyle}>Date Issued</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={issueDate} 
                  onChange={e => setIssueDate(e.target.value)} 
                  className={`${boxStyle} [&::-webkit-calendar-picker-indicator]:opacity-0 z-10 relative bg-transparent cursor-pointer`} 
                />
                <Calendar size={16} className="hide-on-print absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 z-0" />
              </div>
            </div>
            <div className="w-full sm:w-[150px]">
              <label className={labelStyle}>Due Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                  className={`${boxStyle} [&::-webkit-calendar-picker-indicator]:opacity-0 z-10 relative bg-transparent cursor-pointer`} 
                />
                <Calendar size={16} className="hide-on-print absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 z-0" />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-slate-100 mb-8 hide-on-print" />

        {/* Line Items */}
        <div className="mb-12">
          <label className={`${labelStyle} mb-4 text-lg`}>Invoice Items</label>
          
          {/* Desktop Headers */}
          <div className="hidden md:flex bg-slate-100 rounded-t-lg border border-slate-200 border-b-0 p-3 text-[12px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="flex-1">Description</div>
            <div className="w-[120px] text-right">Rate</div>
            <div className="w-[90px] text-right">Qty</div>
            <div className="w-[120px] text-right">Amount</div>
            <div className="w-10 hide-on-print"></div>
          </div>
          
          <div className="space-y-4 md:space-y-0">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-4 md:gap-0 items-start md:items-center bg-slate-50 md:bg-white p-4 md:p-3 border border-slate-200 rounded-xl md:rounded-none md:border-t-0 md:last:rounded-b-lg">
                 
                 {/* Mobile Label & Input */}
                 <div className="w-full md:flex-1 md:pr-4">
                   <label className="print-label hide-on-print-label md:hidden text-[11px] font-bold text-slate-500 uppercase mb-1 block">Description</label>
                   <input 
                     value={item.description} 
                     onChange={e => handleItemChange(idx, 'description', e.target.value)} 
                     placeholder="Item description" 
                     className={boxStyle} 
                   />
                 </div>
                 
                 <div className="flex w-full md:w-auto gap-4">
                   <div className="flex-1 md:w-[120px] md:pr-4">
                     <label className="print-label hide-on-print-label md:hidden text-[11px] font-bold text-slate-500 uppercase mb-1 block">Rate</label>
                     <input 
                       type="number" placeholder="0.00" 
                       value={item.unit_price} 
                       onChange={e => handleItemChange(idx, 'unit_price', e.target.value)} 
                       className={`${boxStyle} md:text-right`} 
                     />
                   </div>
                   
                   <div className="flex-1 md:w-[90px] md:pr-4">
                     <label className="print-label hide-on-print-label md:hidden text-[11px] font-bold text-slate-500 uppercase mb-1 block">Qty</label>
                     <input 
                       type="number" placeholder="1" 
                       value={item.quantity} 
                       onChange={e => handleItemChange(idx, 'quantity', e.target.value)} 
                       className={`${boxStyle} md:text-right`} 
                     />
                   </div>
                 </div>
                 
                 <div className="w-full md:w-[120px] flex flex-col justify-center">
                   <label className="print-label hide-on-print-label md:hidden text-[11px] font-bold text-slate-500 uppercase mb-1 block">Amount</label>
                   <input 
                     value={item.amount > 0 ? item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''} 
                     readOnly placeholder="0.00" 
                     className="print-input w-full bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3 text-right text-[15px] font-bold text-slate-900 cursor-default" 
                   />
                 </div>

                 <div className="hide-on-print w-full md:w-10 flex justify-end md:justify-center mt-2 md:mt-0">
                   <button 
                     onClick={() => removeRow(idx)} disabled={items.length === 1} 
                     className="text-slate-400 hover:text-red-500 bg-white md:bg-transparent border border-slate-300 md:border-transparent p-2 rounded-lg transition-all disabled:opacity-30"
                   >
                     <X size={18} strokeWidth={2.5} />
                   </button>
                 </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={addRow} 
            className="hide-on-print mt-6 flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-[14px] rounded-lg transition-colors"
          >
            <Plus size={16} strokeWidth={3} /> Add Line Item
          </button>
        </div>

        {/* Footer Notes & Total */}
        <div className="flex flex-col-reverse md:flex-row justify-between gap-10">
          <div className="w-full md:w-1/2">
            <label className={labelStyle}>Notes / Payment Terms</label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="Thank you for your business! Payment is due within 15 days." 
              rows={4} 
              className={boxStyle} 
            />
          </div>
          
          <div className="w-full md:w-[320px]">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                <span className="text-[15px] font-bold text-slate-600">Subtotal</span>
                <span className="text-[16px] font-bold text-slate-900">{fmtSummary(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[18px] font-bold text-slate-900">Total</span>
                <span className="text-[32px] font-black text-blue-600">{fmtSummary(total)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50">
        <button 
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="px-6 py-4 md:px-8 md:py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] rounded-full shadow-[0_10px_40px_-10px_rgba(37,99,235,0.8)] transition-all active:scale-[0.95] flex items-center gap-3 disabled:opacity-50"
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
