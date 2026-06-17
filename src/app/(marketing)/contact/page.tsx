'use client';

import React, { useState } from 'react';
import { Mail, Clock, HelpCircle, Check, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    type: 'Technical support',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setForm({ name: '', email: '', type: 'Technical support', message: '' });
    }, 1200);
  };

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] py-20 px-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Contact Support
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Have questions regarding API integrations, corporate setups, billing, or databases? Reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Contact info */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* SLA Block */}
            <div className="border border-zinc-200 dark:border-zinc-850 rounded-xl bg-white dark:bg-zinc-900/10 p-6 space-y-4 hover:border-zinc-350 dark:hover:border-zinc-700 transition-colors duration-250">
              <div className="flex items-center space-x-2.5 text-zinc-900 dark:text-white">
                <Clock size={18} />
                <h3 className="text-sm font-bold">Personal SLA Guarantee</h3>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                We answer all inquiries personally. No automated bots or outsourced ticket queues.
              </p>
              <div className="pt-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                Average reply speed: &lt; 2 hours
              </div>
            </div>

            {/* Department Routes */}
            <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-450">
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white">Technical Support</h4>
                <p className="text-zinc-500 mt-0.5">Assistance with accounts, database exports, and printing formats.</p>
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white">Business Enquiries</h4>
                <p className="text-zinc-500 mt-0.5">High-volume billing tiers, API setup permissions, and custom contracts.</p>
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white">Partnership Requests</h4>
                <p className="text-zinc-500 mt-0.5">Affiliation inquiries and invoice processing system integrations.</p>
              </div>
            </div>

            <div className="h-px bg-zinc-200 dark:bg-zinc-800"></div>

            {/* Location */}
            <div className="flex items-start space-x-2.5 text-xs text-zinc-500">
              <MapPin size={14} className="mt-0.5" />
              <p>Invoice-Gen.Net Inc.<br />100 Pine Street, Suite 1200<br />San Francisco, CA 94111</p>
            </div>

          </div>

          {/* Right Panel: Support Form */}
          <div className="lg:col-span-7 border border-zinc-200 dark:border-zinc-850 rounded-xl bg-white dark:bg-[#0A0A0A] p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500 flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-900/10">
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-905 dark:text-white">Inquiry Dispatched</h3>
                  <p className="text-xs text-zinc-500 mt-1">Thank you. A support engineer will review your message and reach out shortly.</p>
                </div>
                <div className="pt-2">
                  <Button variant="outline" onClick={() => setSubmitted(false)} className="h-8 text-[10px] bg-white dark:bg-zinc-900">
                    Send another message
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-150 dark:border-zinc-800 pb-2">
                  Submit a Request
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Your Name</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Doe"
                      required
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Email Address</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jane@company.com"
                      required
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Inquiry Category</label>
                  <Select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    options={[
                      { value: 'Technical support', label: 'Technical Support' },
                      { value: 'Business enquiries', label: 'Business Enquiries' },
                      { value: 'Partnership requests', label: 'Partnership Requests' }
                    ]}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Message Description</label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your question or requirements in detail..."
                    required
                    rows={5}
                    className="text-xs"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full h-10 text-xs font-semibold shadow-sm cursor-pointer" isLoading={isSubmitting}>
                    Send Support Message
                  </Button>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
