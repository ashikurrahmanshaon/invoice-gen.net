'use client';

import React, { useState } from 'react';
import { FreeInvoiceBuilder } from '@/components/invoice/FreeInvoiceBuilder';
import { Sparkles, ArrowRight, Shield, Zap, FileText, ChevronDown, ChevronUp } from 'lucide-react';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Is this invoice generator completely free?',
      a: 'Yes, 100% free! You can customize, preview, and download as many invoices as you like. There are no registration forms, no caps on usage, and no payment screens.'
    },
    {
      q: 'Where does my invoice data go?',
      a: 'Your data stays completely private. All calculations, layout styles, and PDF renderings happen locally in your web browser. No details are ever sent to our servers.'
    },
    {
      q: 'Can I add my logo and adjust templates?',
      a: 'Absolutely. You can upload any standard image file (JPG, PNG) as your logo and select between 4 different layout presets (Modern, Classic, Creative, Enterprise) and various color accents.'
    },
    {
      q: 'Can I use this without an internet connection?',
      a: 'Yes. Once loaded, the invoice generator runs entirely client-side. You can generate and export professional invoices even when completely offline.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#060606] text-zinc-900 dark:text-zinc-150 font-sans selection:bg-emerald-255 dark:selection:bg-emerald-800 transition-colors duration-200 relative overflow-hidden pb-12">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-0 left-1/4 w-[40%] h-[400px] rounded-full bg-emerald-450/5 dark:bg-emerald-500/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[600px] right-1/4 w-[35%] h-[350px] rounded-full bg-blue-450/5 dark:bg-blue-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="pt-16 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative z-10">
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-6 shadow-sm shadow-emerald-500/5">
          <Sparkles size={11} className="animate-pulse" />
          Offline Ready & Client-Side Sandbox
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-zinc-950 to-zinc-600 dark:from-white dark:to-zinc-550 leading-[1.1] max-w-4xl mx-auto mb-6">
          Create Professional Invoices <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-450 dark:to-emerald-500 animate-fade-in">
            Instantly & Securely
          </span>
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed mb-8">
          The fast, private B2B invoice tool. No logins, no databases, and zero tracking. Your calculations and documents are kept entirely on your device.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('editor');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs shadow-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            Create Invoice Now
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          <a
            href="/features"
            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-all flex items-center justify-center cursor-pointer"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* EDITOR CARD WRAPPER */}
      <section id="editor" className="max-w-[1080px] mx-auto px-3 sm:px-6 relative z-10 pt-4 scroll-mt-20">
        <div className="bg-white dark:bg-[#0B0B0B] rounded-2xl shadow-[0_8px_40px_-15px_rgba(0,0,0,0.03)] dark:shadow-black/20 border border-zinc-200/60 dark:border-zinc-900 overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          <FreeInvoiceBuilder />
        </div>
      </section>

      {/* VALUE PROPS GRID */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">Why Client-Side Invoicing?</h2>
          <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-550 mt-2">B2B grade speed and complete transaction privacy by default.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-zinc-200/60 dark:border-zinc-900 bg-white/60 dark:bg-zinc-950/20 backdrop-blur-sm p-6 rounded-2xl space-y-4 hover:border-emerald-500/20 transition-all duration-300">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-955 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <Shield size={18} strokeWidth={2.5} />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">100% Private & Local</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed font-medium">
              We never collect or upload your invoice details. Client directory details, payment terms, and figures remain strictly on your local disk.
            </p>
          </div>

          <div className="border border-zinc-200/60 dark:border-zinc-900 bg-white/60 dark:bg-zinc-955/20 backdrop-blur-sm p-6 rounded-2xl space-y-4 hover:border-emerald-500/20 transition-all duration-300">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-955 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <Zap size={18} strokeWidth={2.5} />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Zero Setup Latency</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed font-medium">
              Skip the passwords, confirmations, and billing accounts. Access professional styling and layout configurations instantly upon page load.
            </p>
          </div>

          <div className="border border-zinc-200/60 dark:border-zinc-900 bg-white/60 dark:bg-zinc-955/20 backdrop-blur-sm p-6 rounded-2xl space-y-4 hover:border-emerald-500/20 transition-all duration-300">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-955 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <FileText size={18} strokeWidth={2.5} />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Premium PDF Formats</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed font-medium">
              Toggle between vector-clean template designs engineered to comply with modern Stripe invoicing and professional B2B guidelines.
            </p>
          </div>
        </div>
      </section>

      {/* QUICK FAQ SECTION */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto border-t border-zinc-250/50 dark:border-zinc-900 relative z-10">
        <h2 className="text-xl font-black text-center text-zinc-950 dark:text-white uppercase tracking-wide mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-zinc-200/60 dark:border-zinc-850 bg-white dark:bg-[#0B0B0B] rounded-xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4.5 font-bold text-zinc-800 dark:text-zinc-200 text-left text-xs cursor-pointer focus:outline-none"
              >
                <span>{faq.q}</span>
                {openFaq === index ? <ChevronUp size={14} className="text-emerald-500" /> : <ChevronDown size={14} className="text-zinc-400" />}
              </button>
              {openFaq === index && (
                <div className="px-4.5 pb-4.5 text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-900/60 pt-2.5">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
