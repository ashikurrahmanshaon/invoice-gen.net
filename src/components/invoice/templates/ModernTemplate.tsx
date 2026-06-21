import React from 'react';
import { InvoiceData } from '../types';

export function ModernTemplate({ data, renderRef }: { data: InvoiceData, renderRef: React.RefObject<HTMLDivElement> }) {
  const fmtSummary = (v: number) => {
    return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div 
      ref={renderRef}
      className="bg-white text-slate-900 font-sans relative"
      style={{ width: '794px', minHeight: '1123px', padding: '60px' }}
    >
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 w-full h-4 bg-blue-600"></div>

      <div className="flex justify-between items-start mb-12 mt-4">
        <div className="w-1/2">
          {data.logoUrl ? (
            <img src={data.logoUrl} alt="Logo" className="max-h-24 object-contain mb-4" />
          ) : (
            <div className="h-16"></div>
          )}
          <h2 className="text-xl font-bold text-slate-800 mb-1">From</h2>
          <p className="text-[14px] text-slate-600 whitespace-pre-wrap leading-relaxed">{data.companyDetails || 'Your Company Details'}</p>
        </div>
        
        <div className="w-1/2 text-right">
          <h1 className="text-5xl font-black text-slate-200 uppercase tracking-widest mb-4">Invoice</h1>
          <div className="text-[18px] font-bold text-slate-800 mb-6">
            <span className="text-slate-400 font-medium mr-1">#</span> {data.invoiceNumber || 'INV-001'}
          </div>
          
          <div className="flex justify-end gap-12 text-left">
            <div>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date Issued</p>
              <p className="text-[14px] font-bold text-slate-800">{data.issueDate || '—'}</p>
            </div>
            <div>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
              <p className="text-[14px] font-bold text-slate-800">{data.dueDate || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bill To</h2>
        <p className="text-[15px] font-semibold text-slate-800 whitespace-pre-wrap leading-relaxed">{data.clientDetails || 'Client Details'}</p>
      </div>

      <div className="mb-12">
        <div className="flex bg-slate-100 rounded-lg p-3 text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">
          <div className="flex-1 pl-2">Description</div>
          <div className="w-[120px] text-right">Rate</div>
          <div className="w-[80px] text-right">Qty</div>
          <div className="w-[140px] text-right pr-2">Amount</div>
        </div>

        <div className="space-y-1">
          {data.items.map((item, idx) => (
            <div key={idx} className="flex py-3 px-3 border-b border-slate-100 text-[14px]">
              <div className="flex-1 font-medium text-slate-800">{item.description || '-'}</div>
              <div className="w-[120px] text-right text-slate-600">{Number(item.unit_price) ? fmtSummary(Number(item.unit_price)) : '-'}</div>
              <div className="w-[80px] text-right text-slate-600">{item.quantity}</div>
              <div className="w-[140px] text-right font-bold text-slate-900 pr-2">{fmtSummary(item.amount)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-end gap-12 mt-auto pt-8">
        <div className="flex-1">
          {data.notes && (
            <div>
              <h2 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">Notes & Terms</h2>
              <p className="text-[14px] text-slate-600 whitespace-pre-wrap leading-relaxed">{data.notes}</p>
            </div>
          )}
        </div>
        
        <div className="w-[320px] bg-slate-50 rounded-xl p-6 border border-slate-100">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-[14px]">
              <span className="text-slate-500 font-medium">Subtotal</span>
              <span className="text-slate-800 font-bold">{fmtSummary(data.subtotal)}</span>
            </div>
            {data.taxAmount > 0 && (
              <div className="flex justify-between text-[14px]">
                <span className="text-slate-500 font-medium">Tax ({data.taxRate}%)</span>
                <span className="text-slate-800 font-bold">{fmtSummary(data.taxAmount)}</span>
              </div>
            )}
            {data.discountAmount > 0 && (
              <div className="flex justify-between text-[14px] text-green-600">
                <span className="font-medium">Discount</span>
                <span className="font-bold">-{fmtSummary(data.discountAmount)}</span>
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            <span className="text-[16px] font-bold text-slate-800">Total</span>
            <span className="text-[28px] font-black text-blue-600">{fmtSummary(data.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
