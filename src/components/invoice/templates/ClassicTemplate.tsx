import React from 'react';
import { InvoiceData } from '../types';

export function ClassicTemplate({ data, renderRef }: { data: InvoiceData, renderRef: React.RefObject<HTMLDivElement> }) {
  const fmtSummary = (v: number) => {
    return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div 
      ref={renderRef}
      className="bg-white text-gray-900 font-serif relative border-8 border-double border-gray-300"
      style={{ width: '794px', minHeight: '1123px', padding: '50px' }}
    >
      <div className="text-center mb-10 border-b border-gray-300 pb-8">
        {data.logoUrl && <img src={data.logoUrl} alt="Logo" className="max-h-24 object-contain mx-auto mb-4" />}
        <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">Invoice</h1>
        <p className="text-[14px] text-gray-600">Invoice No. {data.invoiceNumber || '001'}</p>
      </div>

      <div className="flex justify-between mb-12">
        <div className="w-1/2">
          <h2 className="text-[14px] font-bold text-gray-800 mb-2 border-b border-gray-200 inline-block">From:</h2>
          <p className="text-[14px] whitespace-pre-wrap leading-relaxed">{data.companyDetails || 'Your Company Name\nAddress'}</p>
        </div>
        <div className="w-1/2 text-right">
          <h2 className="text-[14px] font-bold text-gray-800 mb-2 border-b border-gray-200 inline-block">To:</h2>
          <p className="text-[14px] whitespace-pre-wrap leading-relaxed">{data.clientDetails || 'Client Name\nAddress'}</p>
        </div>
      </div>

      <div className="flex justify-center mb-12 text-[14px]">
        <div className="px-6 py-2 border border-gray-300 mr-4">
          <span className="font-bold mr-2">Date Issued:</span> {data.issueDate || '—'}
        </div>
        <div className="px-6 py-2 border border-gray-300">
          <span className="font-bold mr-2">Due Date:</span> {data.dueDate || '—'}
        </div>
      </div>

      <div className="mb-12">
        <table className="w-full text-left border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3 text-[13px] font-bold uppercase">Description</th>
              <th className="border border-gray-300 p-3 text-[13px] font-bold uppercase text-right w-[100px]">Rate</th>
              <th className="border border-gray-300 p-3 text-[13px] font-bold uppercase text-right w-[80px]">Qty</th>
              <th className="border border-gray-300 p-3 text-[13px] font-bold uppercase text-right w-[120px]">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={idx}>
                <td className="border border-gray-300 p-3 text-[14px]">{item.description || '-'}</td>
                <td className="border border-gray-300 p-3 text-[14px] text-right">{Number(item.unit_price) ? fmtSummary(Number(item.unit_price)) : '-'}</td>
                <td className="border border-gray-300 p-3 text-[14px] text-right">{item.quantity}</td>
                <td className="border border-gray-300 p-3 text-[14px] text-right font-medium">{fmtSummary(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-12">
        <table className="w-[300px] border-collapse border border-gray-300 text-[14px]">
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-bold text-gray-700 bg-gray-50">Subtotal</td>
              <td className="border border-gray-300 p-2 text-right">{fmtSummary(data.subtotal)}</td>
            </tr>
            {data.taxAmount > 0 && (
              <tr>
                <td className="border border-gray-300 p-2 font-bold text-gray-700 bg-gray-50">Tax ({data.taxRate}%)</td>
                <td className="border border-gray-300 p-2 text-right">{fmtSummary(data.taxAmount)}</td>
              </tr>
            )}
            {data.discountAmount > 0 && (
              <tr>
                <td className="border border-gray-300 p-2 font-bold text-gray-700 bg-gray-50">Discount</td>
                <td className="border border-gray-300 p-2 text-right text-red-600">-{fmtSummary(data.discountAmount)}</td>
              </tr>
            )}
            <tr>
              <td className="border border-gray-300 p-2 font-bold text-lg bg-gray-100">Total</td>
              <td className="border border-gray-300 p-2 text-right font-bold text-lg bg-gray-100">{fmtSummary(data.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {data.notes && (
        <div className="mt-8 pt-8 border-t border-gray-300 text-center">
          <p className="text-[13px] text-gray-600 whitespace-pre-wrap italic">"{data.notes}"</p>
        </div>
      )}
    </div>
  );
}
