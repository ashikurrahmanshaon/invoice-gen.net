import React from 'react';
import { InvoiceData } from '../types';

export function MinimalTemplate({ data, renderRef }: { data: InvoiceData, renderRef: React.RefObject<HTMLDivElement> }) {
  const fmtSummary = (v: number) => {
    return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div 
      ref={renderRef}
      className="bg-white text-black font-sans relative"
      style={{ width: '794px', minHeight: '1123px', padding: '60px' }}
    >
      <div className="flex justify-between items-start mb-16 border-b-2 border-black pb-8">
        <div className="w-1/2">
          {data.logoUrl && <img src={data.logoUrl} alt="Logo" className="max-h-20 object-contain mb-6 grayscale" />}
          <h1 className="text-4xl font-black uppercase tracking-widest mb-2">INVOICE</h1>
          <p className="text-[16px] font-bold"># {data.invoiceNumber || 'INV-001'}</p>
        </div>
        
        <div className="w-1/2 text-right">
          <p className="text-[14px] whitespace-pre-wrap leading-relaxed">{data.companyDetails || 'Your Company Details'}</p>
        </div>
      </div>

      <div className="flex justify-between mb-16">
        <div className="w-1/2">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">Billed To</h2>
          <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{data.clientDetails || 'Client Details'}</p>
        </div>
        <div className="w-1/3">
          <div className="flex justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Date Issued</span>
            <span className="text-[14px] font-medium">{data.issueDate || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Due Date</span>
            <span className="text-[14px] font-medium">{data.dueDate || '—'}</span>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <div className="flex border-b-2 border-black pb-2 text-[11px] font-bold uppercase tracking-widest mb-4">
          <div className="flex-1">Description</div>
          <div className="w-[120px] text-right">Rate</div>
          <div className="w-[80px] text-right">Qty</div>
          <div className="w-[140px] text-right">Amount</div>
        </div>

        <div className="space-y-4">
          {data.items.map((item, idx) => (
            <div key={idx} className="flex text-[14px] pb-4 border-b border-gray-200">
              <div className="flex-1">{item.description || '-'}</div>
              <div className="w-[120px] text-right">{Number(item.unit_price) ? fmtSummary(Number(item.unit_price)) : '-'}</div>
              <div className="w-[80px] text-right">{item.quantity}</div>
              <div className="w-[140px] text-right font-medium">{fmtSummary(item.amount)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-start gap-12 mt-auto">
        <div className="flex-1">
          {data.notes && (
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">Notes</h2>
              <p className="text-[13px] whitespace-pre-wrap leading-relaxed text-gray-800">{data.notes}</p>
            </div>
          )}
        </div>
        
        <div className="w-[280px]">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-[14px]">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{fmtSummary(data.subtotal)}</span>
            </div>
            {data.taxAmount > 0 && (
              <div className="flex justify-between text-[14px]">
                <span className="text-gray-600">Tax ({data.taxRate}%)</span>
                <span className="font-medium">{fmtSummary(data.taxAmount)}</span>
              </div>
            )}
            {data.discountAmount > 0 && (
              <div className="flex justify-between text-[14px]">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium">-{fmtSummary(data.discountAmount)}</span>
              </div>
            )}
          </div>
          <div className="pt-2 border-t-2 border-black flex justify-between items-center">
            <span className="text-[14px] font-bold uppercase tracking-widest">Total</span>
            <span className="text-[24px] font-black">{fmtSummary(data.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
