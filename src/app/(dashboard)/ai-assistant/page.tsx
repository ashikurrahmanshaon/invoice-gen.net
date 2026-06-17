'use strict';

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth';
import { dbService, Profile } from '@/services/db';
import { aiService, ParsedInvoice } from '@/services/ai';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Sparkles,
  ArrowRight,
  Plus,
  HelpCircle,
  Clock,
  Trash2,
  Percent,
  TrendingUp,
  Brain,
  Crown,
} from 'lucide-react';

export default function AIAssistantPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form
  const [prompt, setPrompt] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedInvoice | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const data = await dbService.getProfile(user.id);
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile in AI assistant:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const handleSamplePrompt = (sampleText: string) => {
    setPrompt(sampleText);
    setParsedResult(null);
    setError('');
  };

  const handleParse = async () => {
    setError('');
    setParsedResult(null);
    if (!prompt.trim()) {
      setError('Please type or paste some text details first.');
      return;
    }

    setParsing(true);
    try {
      const result = await aiService.parseTextToInvoice(prompt);
      setParsedResult(result);
    } catch (err: any) {
      console.error('AI Parsing Error:', err);
      setError('AI parsing failed. Please adjust your text description and try again.');
    } finally {
      setParsing(false);
    }
  };

  const handleCreateDraft = async () => {
    if (!parsedResult || !user) return;
    setParsing(true);
    try {
      // Find or create client by name
      const clients = await dbService.getClients(user.id);
      let client = clients.find((c) => c.name.toLowerCase() === parsedResult.clientName.toLowerCase());
      
      if (!client) {
        // Quick add client
        client = await dbService.createClient({
          user_id: user.id,
          name: parsedResult.clientName,
          email: `${parsedResult.clientName.toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: '',
          address: '',
        });
      }

      // Compute dates
      const issue_date = new Date().toISOString().split('T')[0];
      const dueDays = parsedResult.dueDateDays || 30;
      const due_date = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Calculate amounts
      const items = parsedResult.items.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        amount: it.quantity * it.unitPrice,
      }));

      const subtotal = items.reduce((sum, it) => sum + it.amount, 0);
      const taxAmount = subtotal * (parsedResult.taxRate / 100);
      const total = subtotal - parsedResult.discountAmount + taxAmount;

      const nextNum = await dbService.getNextInvoiceNumber(user.id);

      const draftInvoice = await dbService.createInvoice({
        user_id: user.id,
        client_id: client.id,
        invoice_number: nextNum,
        status: 'draft',
        issue_date,
        due_date,
        currency: profile?.currency || 'USD',
        tax_rate: parsedResult.taxRate,
        tax_amount: taxAmount,
        discount_rate: 0,
        discount_amount: parsedResult.discountAmount,
        subtotal,
        total,
        notes: parsedResult.notes || 'Generated via AI Text-To-Invoice Assistant.',
        items: items as any,
      });

      router.push(`/invoices/${draftInvoice.id}/edit`);
    } catch (err: any) {
      console.error('Failed to create draft:', err);
      setError(err?.message || 'Failed to initialize draft invoice.');
      setParsing(false);
    }
  };

  const samplePrompts = [
    {
      label: 'Hourly Consulting',
      text: 'Invoice Google LLC for 15 hours of software consulting at $150 per hour. Due in 14 days. Tax is 8%. Discount of $100.',
    },
    {
      label: 'Products Delivery',
      text: 'Bill Stripe Inc for 5 Premium SaaS Templates for $500 each and 2 API deployment sessions at $1200. Default notes.',
    },
    {
      label: 'Simple Support Contract',
      text: 'To Acme Corp: monthly maintenance retainer fee of $3200. Tax is 5%. Due next week.',
    },
  ];

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-44 bg-secondary animate-pulse rounded" />
        <div className="h-96 bg-secondary animate-pulse rounded-lg" />
      </div>
    );
  }

  const isPremiumUser = profile.is_premium;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center">
            <Sparkles className="mr-2 text-primary" /> AI Invoice Assistant
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Convert contract outlines or notes into clean billing drafts instantly.
          </p>
        </div>
        
        {!isPremiumUser && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 animate-pulse">
            <Crown size={12} className="mr-1.5" /> PRO Feature Demo
          </span>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-lg border border-destructive/20 bg-destructive/10 text-xs font-semibold text-destructive text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Text Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Natural Language Contract Details</CardTitle>
              <CardDescription>
                Describe who to bill, what services or items were rendered, rates, taxes, or discounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type or paste outline here, e.g.:&#13;Invoice Netflix for 10 hours of design at $120/hr and 3 copies of stock illustrations for $150 each. Tax is 10%. Due in 2 weeks."
                rows={8}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-sm placeholder:text-muted-foreground/50"
              />

              {/* Sample Prompts Row */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Or test a quick template:</p>
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSamplePrompt(s.text)}
                      className="px-3 py-2 rounded-lg border border-border bg-card text-xs hover:bg-secondary/50 font-medium transition-colors text-left truncate max-w-full cursor-pointer"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-border/40 pt-4">
              <Button onClick={handleParse} isLoading={parsing}>
                <Brain size={16} className="mr-2" /> Parse Description
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Parsed Review panel (5 cols) */}
        <div className="lg:col-span-5">
          {parsedResult ? (
            <Card className="shadow-sm border-primary/20">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center">
                  <Sparkles size={16} className="mr-1.5" /> Extracted Parameters Review
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Client info mapping */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Client Name</span>
                    <span className="font-bold text-sm text-foreground">{parsedResult.clientName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Due Term</span>
                    <span className="font-semibold text-foreground">{parsedResult.dueDateDays || 30} days</span>
                  </div>
                </div>

                {/* Extracted items */}
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Line Items</span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {parsedResult.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-secondary/30 border border-border/40">
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-foreground truncate">{it.description}</p>
                          <p className="text-[10px] text-muted-foreground">{it.quantity} x {new Intl.NumberFormat('en-US', { style: 'currency', currency: profile.currency }).format(it.unitPrice)}</p>
                        </div>
                        <span className="font-bold text-foreground">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: profile.currency }).format(it.quantity * it.unitPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Adjustments summary */}
                <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-border/20">
                  {parsedResult.taxRate > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Tax Rate</span>
                      <span className="font-semibold text-foreground">{parsedResult.taxRate}%</span>
                    </div>
                  )}
                  {parsedResult.discountAmount > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Discount Flat</span>
                      <span className="font-semibold text-success">-{new Intl.NumberFormat('en-US', { style: 'currency', currency: profile.currency }).format(parsedResult.discountAmount)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3 pt-4 border-t border-border/40">
                <Button onClick={handleCreateDraft} isLoading={parsing} className="w-full">
                  Create Draft Invoice <ArrowRight size={16} className="ml-2" />
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">
                  This initializes a draft invoice and redirects to the split-screen configuration editor to finalize billing values.
                </p>
              </CardFooter>
            </Card>
          ) : (
            <Card className="shadow-sm border-dashed">
              <CardContent className="p-10 text-center text-xs text-muted-foreground italic space-y-3">
                <Brain size={36} className="mx-auto text-muted-foreground/35 animate-pulse" />
                <p>No results parsed yet.</p>
                <p className="text-[11px] text-muted-foreground/80 leading-relaxed max-w-xs mx-auto">
                  Type a billing description in the panel and click "Parse Description" to review extracted metrics.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
