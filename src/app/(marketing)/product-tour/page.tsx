'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  UserPlus,
  FileText,
  Send,
  CreditCard,
  Download,
  Check,
  ChevronRight,
  ChevronLeft,
  Mail,
  FileCheck,
  ShieldCheck
} from 'lucide-react';

export default function ProductTourPage() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'Step 1',
      title: 'Create Client Card',
      icon: UserPlus,
      description: 'Start by storing your client contact and billing parameters. Register details like standard currency, tax ID numbers, and accounts email addresses. Once stored, you can select this client on any future invoice with a single click.',
      details: [
        'Saves billing addresses and tax information securely.',
        'Prevents typing errors or duplicate contact files.',
        'Integrates immediately with the invoice generator selectors.'
      ],
      visual: (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded-lg space-y-4 text-xs shadow-sm w-full max-w-sm">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-900">
            <span className="font-bold text-zinc-900 dark:text-white">Add New Client</span>
            <span className="text-[10px] text-zinc-400">Record #102</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="h-2 w-16 bg-zinc-200 dark:bg-zinc-800 rounded mb-1.5"></div>
              <div className="h-8 w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 flex items-center text-zinc-700 dark:text-zinc-300">
                Starlight Digital Inc.
              </div>
            </div>
            <div>
              <div className="h-2 w-20 bg-zinc-200 dark:bg-zinc-800 rounded mb-1.5"></div>
              <div className="h-8 w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 flex items-center text-zinc-500">
                billing@starlight-digital.com
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <div className="h-7 w-24 bg-zinc-905 dark:bg-white text-white dark:text-zinc-905 rounded flex items-center justify-center font-bold text-[10px]">
              Save Client
            </div>
          </div>
        </div>
      )
    },
    {
      label: 'Step 2',
      title: 'Draft the Invoice',
      icon: FileText,
      description: 'Use the structured builder to add line items, calculate services, apply specific client volume discounts, and set local tax rates. The system automatically computes and balances totals in real-time.',
      details: [
        'Custom quantities, hourly rates, and fixed pricing inputs.',
        'Live subtotal, tax, and total pricing calculations.',
        'Add custom footnotes, terms of service, or payment methods.'
      ],
      visual: (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded-lg space-y-3 text-xs shadow-sm w-full max-w-sm">
          <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2.5">
            <span className="font-bold text-zinc-800 dark:text-zinc-200">Invoice Items</span>
            <span className="text-zinc-400">INV-2026-004</span>
          </div>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-zinc-400 font-semibold border-b border-zinc-100 dark:border-zinc-900">
                <th className="pb-1 text-left">Item</th>
                <th className="pb-1 text-right">Qty</th>
                <th className="pb-1 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-zinc-700 dark:text-zinc-350">
                <td className="py-2">Consulting Hours</td>
                <td className="py-2 text-right">24</td>
                <td className="py-2 text-right">$150.00</td>
              </tr>
            </tbody>
          </table>
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex justify-between font-bold text-zinc-900 dark:text-white">
            <span>Amount Due</span>
            <span>$3,600.00</span>
          </div>
        </div>
      )
    },
    {
      label: 'Step 3',
      title: 'Send Invoice to Client',
      icon: Send,
      description: 'Generate clean PDF download links or dispatch the billing statement directly to your client’s mailbox. Invoices contain clean summaries, clear due dates, and links to complete payment securely.',
      details: [
        'Secure hosting on private, encrypted database paths.',
        'Option to integrate Stripe payment buttons inside the receipt.',
        'Sends clean, B2B-compliant notifications to client representatives.'
      ],
      visual: (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded-lg space-y-4 text-xs shadow-sm w-full max-w-sm">
          <div className="flex items-center space-x-2 text-zinc-500 pb-2 border-b border-zinc-100 dark:border-zinc-900">
            <Mail size={14} />
            <span className="font-semibold text-[10px] uppercase tracking-wider">Email Dispatch Simulator</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <p className="text-zinc-500">To: <span className="text-zinc-800 dark:text-zinc-200 font-medium">billing@starlight-digital.com</span></p>
            <p className="text-zinc-500">Subject: <span className="text-zinc-800 dark:text-zinc-200 font-medium">New Invoice INV-2026-004 from Invoice-Gen.Net</span></p>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-150 dark:border-zinc-850 space-y-1.5">
              <p className="font-bold">Invoice Details</p>
              <p>Starlight Digital Inc. has received invoice INV-2026-004. Total Amount Due: $3,600.00 (Due July 16, 2026).</p>
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <div className="h-7 px-3 bg-emerald-600 text-white rounded flex items-center justify-center font-bold text-[10px] space-x-1">
              <Check size={11} />
              <span>Email Sent</span>
            </div>
          </div>
        </div>
      )
    },
    {
      label: 'Step 4',
      title: 'Track Outstanding Balance',
      icon: CreditCard,
      description: 'Never lose track of what you are owed. Monitor outstanding, overdue, and completed invoices from a unified payment log. Instantly follow up when payments pass net limits.',
      details: [
        'Sort transactions by invoice status, client, or date ranges.',
        'Manual payment recording for direct bank wires or physical checks.',
        'Real-time cash flow monitoring on the accounting panel.'
      ],
      visual: (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded-lg space-y-4 text-xs shadow-sm w-full max-w-sm">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-900">
            <span className="font-bold">Outstanding Ledger</span>
            <span className="text-[10px] text-zinc-400">1 Pending Payout</span>
          </div>
          <div className="space-y-2">
            <div className="p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold text-zinc-905 dark:text-white">Starlight Digital</p>
                <p className="text-[9px] text-zinc-550">INV-2026-004 • Sent Today</p>
              </div>
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-900/10">Pending</span>
            </div>
          </div>
        </div>
      )
    },
    {
      label: 'Step 5',
      title: 'Export Vector-Clean PDF',
      icon: Download,
      description: 'Generate high-fidelity, high-definition PDF invoices for corporate expense approvals. Our stylesheet structure forces clean rendering, removing web borders automatically.',
      details: [
        'Strict styling rules guarantee single-page document grids.',
        'Hides active web buttons during PDF saves or prints.',
        'Cross-platform compatibility (Chrome, Safari, Firefox, Edge).'
      ],
      visual: (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded-lg text-xs shadow-sm w-full max-w-sm flex flex-col items-center justify-center py-8 space-y-3">
          <FileCheck size={36} className="text-emerald-500" />
          <div className="text-center">
            <p className="font-semibold text-zinc-900 dark:text-white text-xs">INV-2026-004.pdf</p>
            <p className="text-[10px] text-zinc-400">PDF Document • 48 KB</p>
          </div>
          <div className="flex space-x-2">
            <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded text-[9px] text-zinc-600 dark:text-zinc-400">Vector Format</span>
            <span className="px-2 py-1 bg-zinc-105 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded text-[9px] text-zinc-600 dark:text-zinc-400">Print Ready</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] py-20 px-6 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Product Tour
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Take a step-by-step look at how Invoice-Gen.Net streamlines your invoicing, client lists, and payment tracking.
          </p>
        </div>

        {/* Step Navigation Dots */}
        <div className="flex items-center space-x-1 sm:space-x-2 max-w-max mx-auto bg-zinc-200/40 dark:bg-zinc-900/60 p-1.5 rounded-2xl shadow-inner border border-zinc-200/60 dark:border-zinc-800/60 overflow-x-auto no-scrollbar">
          {steps.map((st, index) => {
            const Icon = st.icon;
            return (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-300 ${
                  activeStep === index
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <Icon size={14} className={activeStep === index ? "text-emerald-500" : ""} />
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Step Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center border border-zinc-200 dark:border-zinc-850 rounded-2xl bg-white dark:bg-zinc-900/10 p-8 sm:p-12 hover:border-zinc-350 dark:hover:border-zinc-700 transition-colors duration-250">
          
          {/* Text Description */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">{steps[activeStep].label}</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">{steps[activeStep].title}</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{steps[activeStep].description}</p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-zinc-200 dark:border-zinc-850">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Key Highlights</span>
              <ul className="space-y-2">
                {steps[activeStep].details.map((detail, index) => (
                  <li key={index} className="flex items-start text-xs text-zinc-600 dark:text-zinc-400">
                    <Check size={13} className="mr-2.5 mt-0.5 text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-6 flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="h-9 px-4 text-xs font-semibold bg-white dark:bg-zinc-900"
              >
                <ChevronLeft size={14} className="mr-1" /> Previous
              </Button>
              {activeStep < steps.length - 1 ? (
                <Button
                  onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                  className="h-9 px-4 text-xs font-semibold"
                >
                  Next Step <ChevronRight size={14} className="ml-1" />
                </Button>
              ) : (
                <Link href="/login?signup=true">
                  <Button className="h-9 px-4 text-xs font-semibold shadow-sm">
                    Start Invoicing Free
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Right Visual Box */}
          <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 rounded-xl p-8 flex items-center justify-center min-h-[300px]">
            {steps[activeStep].visual}
          </div>

        </div>

      </div>
    </div>
  );
}
