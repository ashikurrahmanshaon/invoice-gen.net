'use client';

import React, { useState } from 'react';
import { FreeInvoiceBuilder } from '@/components/invoice/FreeInvoiceBuilder';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface SeoLandingPageProps {
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  articleContent: React.ReactNode;
  faqs: FAQ[];
}

export default function SeoLandingPage({
  title,
  description,
  h1,
  subtitle,
  articleContent,
  faqs,
}: SeoLandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* HERO SECTION */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight mb-4">
            {h1}
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* INVOICE GENERATOR TOOL */}
        <div className="w-full bg-zinc-50 border-y border-zinc-200">
          <FreeInvoiceBuilder />
        </div>

        {/* SEO ARTICLE SECTION */}
        <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <article className="prose prose-zinc prose-lg max-w-none prose-h2:text-3xl prose-h2:font-bold prose-h2:mb-6 prose-h2:mt-12 prose-h3:text-2xl prose-h3:font-semibold prose-p:text-zinc-600 prose-p:leading-relaxed prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline prose-li:text-zinc-600">
            {articleContent}
          </article>
        </div>

        {/* FAQ SECTION */}
        {faqs && faqs.length > 0 && (
          <div className="py-24 bg-zinc-50 border-t border-zinc-200">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center text-zinc-900 mb-12">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-emerald-200">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                    >
                      <span className="font-bold text-zinc-900">{faq.question}</span>
                      {openFaq === idx ? (
                        <ChevronUp className="text-emerald-600" size={20} />
                      ) : (
                        <ChevronDown className="text-zinc-400" size={20} />
                      )}
                    </button>
                    {openFaq === idx && (
                      <div className="px-6 pb-6 text-zinc-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
