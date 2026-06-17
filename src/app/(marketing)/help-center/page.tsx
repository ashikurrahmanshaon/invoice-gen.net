'use client';

import React, { useState } from 'react';
import { Search, BookOpen, FileText, Users, CreditCard, Download, User, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      description: 'Create your first workspace, verify your email, and complete your billing profile setup.'
    },
    {
      title: 'Creating Invoices',
      icon: FileText,
      description: 'How to add line items, calculate tax rates, apply discount credits, and save drafts.'
    },
    {
      title: 'Managing Clients',
      icon: Users,
      description: 'Add new contacts, save billing addresses, and organize corporate buyer profiles.'
    },
    {
      title: 'Exporting PDFs',
      icon: Download,
      description: 'Troubleshoot document formats, print configurations, and clean vector PDF generation.'
    },
    {
      title: 'Payment Tracking',
      icon: CreditCard,
      description: 'Monitor receivables, set payment dates, and integrate Stripe to collect card payouts.'
    },
    {
      title: 'Account Management',
      icon: User,
      description: 'Update account profiles, configure dark/light theme defaults, and cancel subscriptions.'
    }
  ];

  const articles = [
    { title: 'How to add a custom logo to invoices', category: 'Creating Invoices' },
    { title: 'Setting up client payment terms (Net 30)', category: 'Managing Clients' },
    { title: 'Reconciling payouts using Stripe reports', category: 'Payment Tracking' },
    { title: 'Downloading transaction ledgers as CSV', category: 'Account Management' },
    { title: 'Solving print clipping errors on Safari browser', category: 'Exporting PDFs' }
  ];

  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] py-20 px-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-5">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Help Center
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Search our guides and articles for help with account setup, client tracking, and payment processing.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto pt-2">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles (e.g. logo, PDF, Stripe)..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow shadow-sm"
            />
          </div>
        </div>

        {/* Category Cards */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-850 pb-2">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.title}
                  onClick={() => setSearchQuery(cat.title)}
                  className="border border-zinc-205 dark:border-zinc-850 rounded-xl bg-white dark:bg-zinc-900/10 p-6 space-y-3 hover:border-zinc-350 dark:hover:border-zinc-700 transition-colors duration-250 cursor-pointer group hover:bg-zinc-50 dark:hover:bg-zinc-900/30"
                >
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50 shadow-sm shadow-emerald-500/10">
                    <Icon size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-905 dark:text-white group-hover:underline">{cat.title}</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{cat.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search Results / Core Guides */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-850 pb-2">
            {searchQuery ? `Search Results (${filteredArticles.length})` : 'Popular Articles'}
          </h2>
          
          <div className="divide-y divide-zinc-205 dark:divide-zinc-850 border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 rounded-xl overflow-hidden shadow-sm">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((art, index) => (
                <div
                  key={index}
                  className="p-4 flex justify-between items-center hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 cursor-pointer group text-xs transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-zinc-850 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white">{art.title}</p>
                    <span className="text-[10px] text-zinc-400">{art.category}</span>
                  </div>
                  <ArrowRight size={14} className="text-zinc-350 group-hover:text-zinc-900 dark:group-hover:text-white transition-transform group-hover:translate-x-1" />
                </div>
              ))
            ) : (
              <p className="p-8 text-center text-xs text-zinc-500">No articles match your search parameters. Please try a different query.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
