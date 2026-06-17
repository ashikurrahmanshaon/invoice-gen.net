'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { FreeInvoiceBuilder } from '@/components/invoice/FreeInvoiceBuilder';
import {
  Check,
  FileText,
  Users,
  CreditCard,
  BarChart3,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Shield, 
  Settings, 
  Bot, 
  Globe, 
  ArrowRight, 
  User, 
  Building2, 
  Briefcase, 
  Store,
  Target,
  Star
} from 'lucide-react';

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function HomePage() {
  const { user } = useAuth();
  
  // Hero Showcase Active Tab
  const [heroTab, setHeroTab] = useState<'invoice' | 'clients' | 'payments' | 'revenue'>('invoice');

  // FAQ Active State
  const [openFaq, setOpenFaq] = useState<number | null>(null);


  // Auto-cycle Hero Tabs
  useEffect(() => {
    const tabs = ['invoice', 'clients', 'payments', 'revenue'] as const;
    const interval = setInterval(() => {
      setHeroTab((current) => {
        const currentIndex = tabs.indexOf(current);
        return tabs[(currentIndex + 1) % tabs.length];
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
      


      {/* 1. Free Generator Panel */}
      <section className="pt-6 pb-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-zinc-200 dark:border-zinc-850 no-print" id="free-generator">
        <div className="border border-emerald-500/20 shadow-[0_0_80px_-15px_rgba(16,185,129,0.15)] bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl rounded-[2.5rem] p-4 sm:p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <FreeInvoiceBuilder />
        </div>
      </section>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-20 px-6 max-w-7xl mx-auto border-b border-zinc-200 dark:border-zinc-850 no-print">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            animate="show" 
            className="lg:col-span-6 space-y-6 text-left"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-[2.5rem] font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.2] font-sans">
              Unlock Your Dashboard.<br className="hidden lg:inline" />
              Keep Everything <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700 dark:to-emerald-400">Organized.</span>
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Create a free account to unlock your personal workspace. Easily manage clients, track live payment statuses, and keep your entire financial ledger perfectly organized in one beautiful dashboard.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-3">
              <Link href={user ? '/dashboard' : '/login?signup=true'} className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="group relative overflow-hidden w-full sm:w-auto h-12 px-8 text-sm font-bold shadow-[0_8px_16px_-6px_rgba(16,185,129,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_12px_20px_-6px_rgba(16,185,129,0.6),inset_0_1px_1px_rgba(255,255,255,0.5)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none rounded-full flex items-center justify-center gap-2">
                    <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                      <div className="relative h-full w-8 bg-white/30" />
                    </div>
                    <span className="relative z-10 flex items-center gap-2 drop-shadow-sm">
                      {user ? 'Go to Workspace' : 'Create Free Account'}
                      <ArrowRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </motion.div>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="w-full sm:w-auto h-12 px-8 text-sm font-bold bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm rounded-full flex items-center justify-center">
                    View Pricing
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Trust Row */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-x-4 gap-y-3 pt-6 border-t border-zinc-200 dark:border-zinc-850">
              <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                <div className="mr-2.5 h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/10">
                  <Check size={11} strokeWidth={3} />
                </div>
                <span>Secure cloud sync</span>
              </div>
              <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                <div className="mr-2.5 h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/10">
                  <Check size={11} strokeWidth={3} />
                </div>
                <span>Client directory</span>
              </div>
              <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                <div className="mr-2.5 h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/10">
                  <Check size={11} strokeWidth={3} />
                </div>
                <span>Live payment tracking</span>
              </div>
              <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                <div className="mr-2.5 h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/10">
                  <Check size={11} strokeWidth={3} />
                </div>
                <span>Instant 2-minute setup</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Product Preview Showcase */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
            className="lg:col-span-6 p-[1px] rounded-[17px] bg-gradient-to-b from-zinc-300 to-transparent dark:from-zinc-700 dark:to-transparent shadow-2xl shadow-black/[0.04] dark:shadow-black/20"
          >
            <div className="rounded-2xl bg-white/90 dark:bg-[#0A0A0A]/40 backdrop-blur-2xl overflow-hidden flex flex-col min-h-[420px] h-full">
            
            {/* Header Tabs - Iconic Pill Style */}
            <div className="p-2 border-b border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-[#0A0A0A] overflow-x-auto flex no-scrollbar">
              <div className="flex items-center space-x-1 bg-zinc-200/40 dark:bg-zinc-900/60 p-1 rounded-xl shadow-inner border border-zinc-200/60 dark:border-zinc-800/60 mx-auto w-max">
                {[
                  { id: 'invoice', label: 'Invoices', icon: FileText },
                  { id: 'clients', label: 'Clients', icon: Users },
                  { id: 'payments', label: 'Payments', icon: CreditCard },
                  { id: 'revenue', label: 'Revenue', icon: BarChart3 },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setHeroTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-all duration-300 rounded-lg cursor-pointer ${
                        heroTab === tab.id
                          ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <Icon size={14} className={heroTab === tab.id ? "text-emerald-500" : ""} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Panels */}
            <div className="p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
              
              {/* Invoice Tab */}
              {heroTab === 'invoice' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                      <Bot size={18} className="text-emerald-500" /> Automated Workflows
                    </h4>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 shadow-sm shadow-emerald-500/10 animate-pulse">Pro Feature</span>
                  </div>
                  
                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-2xl"></div>
                    
                    <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-center text-xs border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
                        <span className="font-medium text-zinc-600 dark:text-zinc-400">INV-2026-004</span>
                        <span className="px-2 py-0.5 bg-amber-100/50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded text-[10px] font-bold">Overdue</span>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 shadow-sm">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <Check size={16} strokeWidth={3} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Auto-Reminder Sent</p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-500">System emailed client at 09:00 AM</p>
                        </div>
                      </div>

                      <div className="h-10 w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg flex items-center justify-center text-xs font-bold gap-2 opacity-50 cursor-not-allowed">
                        <FileText size={14} /> Generating Late Fee...
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center font-medium">Stop chasing payments manually. The system does it for you.</p>
                </motion.div>
              )}

              {/* Clients Tab */}
              {heroTab === 'clients' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                      <Users size={18} className="text-emerald-500" /> Unlimited CRM
                    </h4>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 shadow-sm shadow-emerald-500/10 animate-pulse">Pro Feature</span>
                  </div>

                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/50 shadow-sm"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ${i === 1 ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : i === 2 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400'}`}>
                            {i === 1 ? 'AC' : i === 2 ? 'ST' : 'GL'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-900 dark:text-white">{i === 1 ? 'Acme Corp' : i === 2 ? 'Stripe Inc.' : 'Global LLC'}</p>
                            <p className="text-[10px] text-zinc-500">Client Portal: Active</p>
                          </div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-500 transition-colors">
                          <ArrowRight size={14} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center font-medium">Manage 100s of clients with dedicated billing portals.</p>
                </motion.div>
              )}

              {/* Payments Tab */}
              {heroTab === 'payments' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                      <CreditCard size={18} className="text-emerald-500" /> 1-Click Payouts
                    </h4>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 shadow-sm shadow-emerald-500/10 animate-pulse">Pro Feature</span>
                  </div>

                  <div className="p-6 rounded-2xl border-2 border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-900/10 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner shadow-emerald-500/5">
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent"></div>
                    <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center mb-4 relative z-10 shadow-lg shadow-emerald-500/20">
                      <Check size={32} className="text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                    </div>
                    <h2 className="text-4xl font-black text-zinc-900 dark:text-white relative z-10">$12,450.00</h2>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mt-2 relative z-10">Successfully Transferred</p>
                  </div>
                  
                  <div className="flex items-center gap-2 justify-center text-[10px] text-zinc-500 font-medium">
                    <Shield size={12} /> Protected by Stripe Bank-grade Security
                  </div>
                </motion.div>
              )}

              {/* Revenue Tab */}
              {heroTab === 'revenue' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                      <BarChart3 size={18} className="text-emerald-500" /> Tax & Analytics
                    </h4>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 shadow-sm shadow-emerald-500/10 animate-pulse">Pro Feature</span>
                  </div>

                  <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] shadow-lg shadow-black/5">
                    <div className="flex items-end gap-2 h-28 mb-6 px-2">
                      {[40, 65, 45, 80, 55, 100].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5, type: "spring" }}
                          className={`flex-1 rounded-t-sm ${i === 5 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                        ></motion.div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                      <div>
                        <p className="text-[10px] text-zinc-500 font-medium">Estimated Tax (15%)</p>
                        <p className="text-sm font-black text-rose-500">-$1,867.50</p>
                      </div>
                      <div className="h-8 px-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-md flex items-center justify-center text-[10px] font-bold gap-1.5 cursor-pointer hover:opacity-80 transition-opacity shadow-sm">
                        Export CSV <ArrowRight size={12} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center font-medium">Never fear tax season again with 1-click accounting exports.</p>
                </motion.div>
              )}

            </div>
          </div>
        </motion.div>
        </div>
      </section>


      {/* 4. Why Businesses Choose Invoice-Gen.Net */}
      <section className="relative pt-12 pb-32 px-6 max-w-7xl mx-auto border-b border-zinc-200 dark:border-zinc-850 no-print overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-8 relative z-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 shadow-sm shadow-emerald-500/10">
              <Star size={14} className="mr-1.5" /> Premium Features
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
              Why Businesses <br className="hidden lg:block"/> Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300">Invoice-Gen</span>
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">
              Our platform focuses purely on high utility, stability, and data privacy. We avoid unnecessary dashboard widgets to deliver a workspace that remains responsive, clean, and highly secure.
            </p>
            
            <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-4">
              <div className="flex items-center group">
                <div className="h-10 w-10 rounded-xl bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-4 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                  <Shield size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Complete data privacy</h4>
                  <p className="text-xs text-zinc-500">Your records are completely isolated.</p>
                </div>
              </div>
              <div className="flex items-center group">
                <div className="h-10 w-10 rounded-xl bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-4 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                  <BarChart3 size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Clear export formats</h4>
                  <p className="text-xs text-zinc-500">Simplified accounting & tax reporting.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 auto-rows-[200px]">
              
              {/* Pillar 1 - Large Vertical (Row Span 2) */}
              <Link href="/free-invoice-generator" className="group relative sm:row-span-2 p-6 md:p-8 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2rem] bg-white/60 dark:bg-[#0A0A0A]/60 backdrop-blur-xl hover:bg-white dark:hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/40 transition-all duration-500 overflow-hidden flex flex-col cursor-pointer z-10 hover:z-20 transform hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -mt-20 -mr-20 group-hover:bg-emerald-400/20 transition-colors duration-500"></div>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center mb-auto transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <FileText size={32} strokeWidth={2} />
                </div>
                <div className="mt-8">
                  <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Professional Invoices</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Clean and structured layouts featuring precise tax breakdowns, net terms, and responsive PDF compilation. Built for modern businesses.
                  </p>
                </div>
              </Link>

              {/* Pillar 2 - Standard Square */}
              <Link href="/features#clients" className="group relative p-6 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2rem] bg-white/60 dark:bg-[#0A0A0A]/60 backdrop-blur-xl hover:bg-white dark:hover:bg-zinc-900/80 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/40 transition-all duration-500 overflow-hidden flex flex-col justify-center cursor-pointer z-10 hover:z-20 transform hover:-translate-y-2">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-800/30 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                    <Users size={24} strokeWidth={2} />
                  </div>
                  <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                    <ArrowRight size={14} className="text-zinc-400" />
                  </div>
                </div>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Client Management</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Register client addresses and specifics once for instant billing recall.
                </p>
              </Link>

              {/* Pillar 3 - Standard Square */}
              <Link href="/features#payments" className="group relative p-6 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2rem] bg-white/60 dark:bg-[#0A0A0A]/60 backdrop-blur-xl hover:bg-white dark:hover:bg-zinc-900/80 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/40 transition-all duration-500 overflow-hidden flex flex-col justify-center cursor-pointer z-10 hover:z-20 transform hover:-translate-y-2">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-800/30 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <CreditCard size={24} strokeWidth={2} />
                  </div>
                  <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                    <ArrowRight size={14} className="text-zinc-400" />
                  </div>
                </div>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Payment Tracking</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Never lose track of outstanding balances with live statuses.
                </p>
              </Link>

              {/* Pillar 4 - Wide Horizontal (Col Span 2) */}
              <Link href="/features#workflow" className="group relative sm:col-span-2 p-6 md:p-8 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2rem] bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900/50 dark:to-[#0A0A0A]/50 backdrop-blur-xl hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/40 transition-all duration-500 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-6 cursor-pointer z-10 hover:z-20 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                  <TrendingUp size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Lightning Fast Workflow</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">
                    Design focused on getting you in and out. Draft professional invoices in under a minute without heavy page loading bloat.
                  </p>
                </div>
              </Link>

            </div>
          </div>

        </div>
      </section>


    </div>
  );
}
