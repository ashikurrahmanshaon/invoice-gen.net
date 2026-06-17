import React from 'react';
import { Metadata } from 'next';
import { Layers, ShieldCheck, HeartHandshake, Eye, Target, Database, Server, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Our Story - Invoice-Gen.Net',
  description: 'Read the story, mission, and values behind Invoice-Gen.Net. Built to deliver clean, fast, B2B invoicing solutions.',
};

export default function AboutPage() {
  const values = [
    {
      title: 'Reliability',
      icon: ShieldCheck,
      description: 'Your billing ledger is the spine of your cash flow. We build using strict PostgreSQL RLS and isolated cloud databases to guarantee 99.9% uptime and zero data leakage.'
    },
    {
      title: 'Transparency',
      icon: Eye,
      description: 'No hidden subscription limits, no fake urgency timers, and no locked-in databases. Export your entire transaction history in open formats (CSV/JSON) with a single click.'
    },
    {
      title: 'Customer First',
      icon: HeartHandshake,
      description: 'We do not run chatbots or call centers. Every support request is reviewed and answered personally by an engineer within our stated 24-hour SLA window.'
    }
  ];

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] py-16 px-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
            About Our Story
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            We build simple, clean software designed to help businesses manage client transactions, invoice records, and billing pipelines.
          </p>
        </div>

        {/* Why We Built Section */}
        <div className="relative overflow-hidden border border-zinc-200 dark:border-zinc-850 rounded-2xl bg-white dark:bg-zinc-900/10 p-8 sm:p-10 space-y-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-300 shadow-sm">
          {/* Subtle Accent Line */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-400 to-emerald-600"></div>
          
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Why We Built Invoice-Gen.Net
          </h2>
          <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <p>
              Invoicing is often overcomplicated. Most accounting suites on the market force independent operators, consultants, and small agencies into bulky subscriptions loaded with modules they never use.
            </p>
            <p>
              We built <strong className="font-semibold text-emerald-600 dark:text-emerald-400">Invoice-Gen.Net</strong> to establish a calm, B2B-grade workspace. We focus on visual clarity, rapid drafting speed, and database portability, so you can invoice corporate accounts without the administrative bloat.
            </p>
          </div>
        </div>

        {/* Database Architecture Visual */}
        <div className="border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl bg-white/50 dark:bg-[#0A0A0A]/50 p-8 sm:p-12 overflow-hidden relative group">
          
          <div className="relative z-10 text-center mb-16">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/20 text-emerald-600 dark:text-emerald-400 mb-6 border border-emerald-200 dark:border-emerald-800/50 shadow-sm shadow-emerald-500/10 transform transition-transform group-hover:scale-110 duration-500">
              <Database size={28} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">Isolated Database Architecture</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-4 max-w-xl mx-auto text-lg">
              Your financial records are not just rows in a shared spreadsheet. We utilize strict Row-Level Security (RLS) to cryptographically isolate your workspace.
            </p>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto mt-8">
            {/* Server Core */}
            <div className="w-full md:w-1/3 bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center shadow-lg shadow-zinc-200/20 dark:shadow-black/20 flex flex-col items-center hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-300">
              <Server className="text-zinc-400 dark:text-zinc-500 mb-4" size={32} />
              <h4 className="font-bold text-zinc-900 dark:text-white mb-2 text-lg">PostgreSQL Core</h4>
              <p className="text-sm text-zinc-500">Enterprise relational database engine.</p>
            </div>
            
            {/* Connector */}
            <div className="hidden md:flex w-12 items-center justify-center text-emerald-500">
               <div className="w-full h-[2px] bg-emerald-500/30"></div>
            </div>

            {/* Middle RLS Shield */}
            <div className="w-full md:w-1/3 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/20 dark:to-[#0A0A0A] border border-emerald-200 dark:border-emerald-800/40 rounded-3xl p-8 text-center shadow-xl shadow-emerald-500/10 flex flex-col items-center transform md:scale-110 z-10 relative">
              <div className="absolute inset-0 rounded-3xl border border-emerald-500/20 animate-pulse pointer-events-none"></div>
              <Lock className="text-emerald-600 dark:text-emerald-400 mb-4" size={32} />
              <h4 className="font-black text-emerald-900 dark:text-emerald-100 mb-2 text-lg">Row-Level Security</h4>
              <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80 font-medium">Strictly isolated data policies.</p>
            </div>

            {/* Connector */}
            <div className="hidden md:flex w-12 items-center justify-center text-emerald-500">
               <div className="w-full h-[2px] bg-emerald-500/30"></div>
            </div>

            {/* Private Workspace */}
            <div className="w-full md:w-1/3 bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center shadow-lg shadow-zinc-200/20 dark:shadow-black/20 flex flex-col items-center hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-300">
              <ShieldCheck className="text-zinc-400 dark:text-zinc-500 mb-4" size={32} />
              <h4 className="font-bold text-zinc-900 dark:text-white mb-2 text-lg">Private Workspace</h4>
              <p className="text-sm text-zinc-500">Only you can query your ledgers.</p>
            </div>
          </div>
        </div>

        {/* Mission & Vision Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="border border-zinc-200 dark:border-zinc-850 rounded-xl bg-white dark:bg-zinc-900/10 p-8 space-y-5 hover:border-zinc-350 dark:hover:border-zinc-700 transition-colors duration-250">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50 shadow-sm shadow-emerald-500/10 flex-shrink-0">
                <Target size={24} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Our Mission</h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              To deliver clean, visual billing utility that allows freelancers and small enterprises to collect payouts efficiently while maintaining absolute control and ownership of their financial records.
            </p>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-850 rounded-xl bg-white dark:bg-zinc-900/10 p-8 space-y-5 hover:border-zinc-350 dark:hover:border-zinc-700 transition-colors duration-250">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50 shadow-sm shadow-emerald-500/10 flex-shrink-0">
                <Layers size={24} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Our Vision</h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              To create an ecosystem of essential business tools where billing is simply one part of a unified, highly secure workflow workspace, built on visual and data integrity.
            </p>
          </div>

        </div>

        {/* Values Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white text-center">Our Core Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((val) => {
              const Icon = val.icon;
              return (
                <div
                  key={val.title}
                  className="border border-zinc-200 dark:border-zinc-850 rounded-xl bg-white dark:bg-zinc-900/10 p-8 flex flex-col items-center text-center space-y-4 hover:border-zinc-350 dark:hover:border-zinc-700 transition-colors duration-250"
                >
                  <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50 shadow-sm shadow-emerald-500/10">
                    <Icon size={28} />
                  </div>
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white">{val.title}</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{val.description}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
