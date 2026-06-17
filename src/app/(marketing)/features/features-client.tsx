'use client';

import React from 'react';
import { Metadata } from 'next';
import { motion, Variants } from 'framer-motion';
import {
  FileText,
  Users,
  CreditCard,
  History,
  Download,
  BarChart3,
  Bot,
  Check,
  TrendingUp,
  Mail,
  FileCheck
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function FeaturesClient() {
  const features = [
    {
      id: 'invoice-creation',
      title: 'Invoice Creation',
      icon: FileText,
      description: 'Draft professional B2B invoices in seconds. Our minimal interface is built to ensure you can add line items, calculate totals, specify net terms, and include custom business branding instantly.',
      benefits: [
        'Automatic subtotal, tax, and discount calculations.',
        'Supports standard net-payment term presets (Net 15, Net 30, Net 60).',
        'Add customized business headers and transaction notes.'
      ],
      example: 'An engineering agency drafting a $15,000 monthly service invoice for a corporate partner, specifying a 10% volume discount and 8.25% sales tax.',
      visual: (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] p-5 rounded-lg space-y-3 text-xs shadow-lg shadow-zinc-200/50 dark:shadow-black/20">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-2.5">
            <span className="font-semibold text-zinc-900 dark:text-white">New Invoice</span>
            <span className="text-emerald-600 dark:text-emerald-500 font-bold">INV-2026-102</span>
          </div>
          <div className="space-y-3">
            <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-900">
              <span className="text-zinc-500">Service Description</span>
              <span className="font-medium">Web Development</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="flex justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-900">
              <span className="text-zinc-500">Rate × Hours</span>
              <span className="font-medium">$125 × 40 hrs</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} className="flex justify-between pt-2 font-bold text-zinc-900 dark:text-white">
              <span className="text-emerald-600">Total</span>
              <span className="text-lg">$5,000.00</span>
            </motion.div>
          </div>
        </div>
      )
    },
    {
      id: 'client-management',
      title: 'Client Management',
      icon: Users,
      description: 'Keep contact details organized in a single repository. Stop re-typing billing addresses, emails, and phone numbers every time you invoice repeat clients.',
      benefits: [
        'Centralized client cards with full billing addresses and emails.',
        'View total outstanding balances and paid records per client.',
        'Quickly auto-populate invoice forms using client selectors.'
      ],
      example: 'A design consultant keeping track of 8 different corporate billing contacts and their respective tax identification numbers (EINs).',
      visual: (
        <motion.div whileHover={{ scale: 1.02 }} className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] p-5 rounded-lg space-y-3 text-xs shadow-lg shadow-zinc-200/50 dark:shadow-black/20">
          <div className="flex items-center space-x-3 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 font-bold flex items-center justify-center text-sm shadow-sm shadow-emerald-500/10">
              SL
            </div>
            <div>
              <p className="font-bold text-zinc-950 dark:text-white text-sm">Starlight Media</p>
              <p className="text-[10px] text-zinc-500">accounting@starlight.io</p>
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-zinc-500 pt-2 px-1">
            <span>Outstanding Balance</span>
            <span className="font-bold text-amber-600 dark:text-amber-500">$3,200.00</span>
          </div>
        </motion.div>
      )
    },
    {
      id: 'payment-tracking',
      title: 'Payment Tracking',
      icon: CreditCard,
      description: 'Monitor the exact lifecycle of your receivables. Track when invoices are sent, pending checkout, or fully cleared, ensuring you maintain a stable business cash flow.',
      benefits: [
        'Visual status indicators (Draft, Sent, Overdue, Paid).',
        'Record manual payments (Checks, Wire Transfers, Cash).',
        'Automatic tracking of checkout statuses for integrated Stripe transactions.'
      ],
      example: 'An independent marketer marking an overdue invoice as "Paid" after receiving a physical business check from a client.',
      visual: (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] p-5 rounded-lg space-y-4 text-xs shadow-lg shadow-zinc-200/50 dark:shadow-black/20">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-sm">Transaction Ledger</span>
            <span className="text-[10px] text-zinc-500">Live Updates</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 100 }} className="p-3 border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center"><Check size={12} className="text-emerald-600" /></div>
              <span className="text-emerald-900 dark:text-emerald-400 font-bold">Payment Received</span>
            </div>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">+$1,850.00</span>
          </motion.div>
        </div>
      )
    },
    {
      id: 'invoice-history',
      title: 'Invoice History',
      icon: History,
      description: 'Maintain an immutable transaction audit log. View every historical billing statement generated, sorted chronologically with quick filter parameters.',
      benefits: [
        'Filter by date range, invoice status, or client name.',
        'Detailed timeline showing creation, edit, email dispatch, and payment dates.',
        'Quickly duplicate previous invoices to save setup time.'
      ],
      example: 'An accounting firm reviewing a client’s full Q1 billing history to reconcile bank statements for quarterly tax filings.',
      visual: (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] p-5 rounded-lg space-y-4 text-xs shadow-lg shadow-zinc-200/50 dark:shadow-black/20">
          <div className="flex justify-between items-center text-[11px] text-zinc-500 border-b border-zinc-100 dark:border-zinc-900 pb-2">
            <span>Audit Log</span>
            <span>Jun 16, 2026</span>
          </div>
          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-1 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 dark:before:via-zinc-800 before:to-transparent">
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-3 h-3 rounded-full border-2 border-white dark:border-zinc-950 bg-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
              <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-2 rounded border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10 shadow-sm">
                <p className="font-bold text-emerald-800 dark:text-emerald-400 text-[10px]">INV-2026-001 PAID</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-3 h-3 rounded-full border-2 border-white dark:border-zinc-950 bg-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
              <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-2 rounded border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10 shadow-sm">
                <p className="font-bold text-blue-800 dark:text-blue-400 text-[10px]">INV-2026-002 SENT</p>
              </div>
            </motion.div>
          </div>
        </div>
      )
    },
    {
      id: 'pdf-export',
      title: 'PDF Export',
      icon: Download,
      description: 'Generate vector-clean PDF documents that reflect professional quality. Our rendering system compiles CSS elements into print-ready layouts.',
      benefits: [
        'High-density vector graphics that render sharply on screens and paper.',
        'Hides browser interfaces and menus during printing automatically.',
        'Standardized print scaling to fit single or multi-page formats perfectly.'
      ],
      example: 'A consultant exporting an invoice as a clean A4 PDF file to upload into a client’s corporate expense portal.',
      visual: (
        <motion.div whileHover={{ y: -5 }} className="border border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-white to-zinc-50 dark:from-[#0A0A0A] dark:to-zinc-900/50 p-6 rounded-xl text-xs shadow-lg shadow-zinc-200/50 dark:shadow-black/20 flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
            <FileCheck size={32} className="text-emerald-600 dark:text-emerald-500" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <p className="font-bold text-zinc-900 dark:text-white text-sm">INV-2026-001.pdf</p>
            <span className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase">PDF Document • 45 KB</span>
          </div>
        </motion.div>
      )
    },

    {
      id: 'analytics',
      title: 'Analytics',
      icon: BarChart3,
      description: 'Understand the financial health of your business. View charts and summaries that detail monthly recurring revenue, client payout speeds, and outstanding balances.',
      benefits: [
        'Calculates year-to-date (YTD) total revenues and collections.',
        'Monitors average invoice collection delays dynamically.',
        'Visualizes cash flow distributions across active client accounts.'
      ],
      example: 'A freelance designer reviewing their monthly earnings graph to estimate tax contributions for the upcoming quarter.',
      visual: (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] p-5 rounded-xl space-y-4 text-xs shadow-lg shadow-zinc-200/50 dark:shadow-black/20">
          <div className="flex justify-between items-center">
            <span className="font-bold text-zinc-900 dark:text-white">Revenue Trend</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">+24%</span>
          </div>
          <div className="flex items-end justify-between h-20 pt-2 border-b border-zinc-100 dark:border-zinc-800/50 pb-1">
            {[30, 45, 60, 40, 80, 100].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, type: "spring" }}
                className={`w-4 rounded-t-sm ${i === 5 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm shadow-emerald-500/20' : 'bg-zinc-200 dark:bg-zinc-800'}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-zinc-400 font-medium">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>
      )
    },
    {
      id: 'ai-assistant',
      title: 'AI Invoice Assistant',
      icon: Bot,
      description: 'Generate fully-structured invoices using plain natural language. Simply describe your services and hours, and let the parser draft the billing grid automatically.',
      benefits: [
        'Converts unstructured textual logs into clean invoice models.',
        'Automatically extracts description, quantity, rate, and client parameters.',
        'Reduces setup errors by verifying parsed items before drafting.'
      ],
      example: 'A developer pasting "Billed 15 hours for API integration at $80/hr" to generate the line item instantly.',
      visual: (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] p-5 rounded-xl space-y-4 text-xs shadow-lg shadow-zinc-200/50 dark:shadow-black/20">
          <div className="p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-lg shadow-inner">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-zinc-500 text-[11px] font-medium leading-relaxed italic"
            >
              "Draft an invoice for Acme Corp for 20 hours of SEO audit at $100/hr..."
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.8 }} className="flex justify-between items-center p-2 rounded bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
            <span className="flex items-center space-x-2"><Bot size={14} className="animate-bounce" /> <span>AI Structured</span></span>
            <span className="bg-white dark:bg-zinc-900 px-2 py-1 rounded shadow-sm border border-emerald-100 dark:border-emerald-800/50">$2,000.00 Total</span>
          </motion.div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] py-20 px-4 sm:px-6 transition-colors duration-200 overflow-hidden">
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-20"
      >
        
        {/* Page Header */}
        <motion.div variants={fadeInUp} className="text-center max-w-3xl mx-auto space-y-6 mb-24 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
            Features Built for <span className="text-emerald-600 dark:text-emerald-500">Business</span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto font-medium">
            Invoice-Gen.Net is built from the ground up to provide B2B-grade utility. No vanity indicators or heavy widgets. Just raw speed, organization, and trust.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feat) => {
            const IconComponent = feat.icon;
            return (
              <motion.div
                variants={fadeInUp}
                key={feat.id}
                id={feat.id}
                className="group border border-zinc-200/80 dark:border-zinc-800/80 rounded-[2rem] bg-white/60 dark:bg-zinc-900/30 backdrop-blur-sm p-8 flex flex-col justify-between space-y-8 hover:bg-white dark:hover:bg-[#0A0A0A] hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/30 transition-all duration-500 transform hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
                  <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                </div>

                <div className="space-y-5 relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-white dark:from-emerald-900/40 dark:to-emerald-800/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg shadow-emerald-500/10 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                      <IconComponent size={28} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">{feat.title}</h2>
                  </div>
                  
                  <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    {feat.description}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-850">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest block">Key Benefits</span>
                    <ul className="space-y-3">
                      {feat.benefits.map((b, i) => (
                        <li key={i} className="flex items-start text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                          <Check size={18} className="mr-3 mt-0.5 text-emerald-500 flex-shrink-0" strokeWidth={3} />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 bg-zinc-50/80 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl space-y-2 text-[13px] transition-colors duration-300 group-hover:bg-zinc-100/50 dark:group-hover:bg-zinc-900/80 shadow-inner">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mr-2"></div> Real-World Case</span>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium italic">"{feat.example}"</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-center items-center bg-zinc-50/50 dark:bg-zinc-950/20 p-6 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl relative z-10 transition-colors duration-300 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/40 min-h-[200px]">
                  <div className="w-full max-w-md">
                    {feat.visual}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

      </motion.div>
    </div>
  );
}
