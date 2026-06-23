import React from 'react';
import { Metadata } from 'next';
import { Shield, Lock, Database, Key, RefreshCw, FileText, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Security & Trust - Invoice-Gen.Net',
  description: 'Learn how we secure your invoicing data. We enforce Row-Level Security, TLS encryption, regular backups, and complete data ownership policies.',
};

export default function SecurityPage() {
  const securityPillars = [
    {
      id: 'data-protection',
      title: 'Data Protection',
      icon: Shield,
      description: 'Your business invoicing and customer records are isolated at the database layer. We enforce PostgreSQL Row-Level Security (RLS) policies, ensuring that one tenant can never access or query another tenant’s data under any condition.'
    },
    {
      id: 'encryption',
      title: 'Encryption in Transit & Rest',
      icon: Lock,
      description: 'All network connections are encrypted using TLS 1.3. Your database logs, credentials, and client directories are encrypted at rest using AES-256 standards, protecting your records from physical and network-level security threats.'
    },
    {
      id: 'secure-auth',
      title: 'Secure Authentication',
      icon: Key,
      description: 'We authenticate users using verified token exchanges (Supabase Auth). Credentials are encrypted and hashed before database storage, protecting accounts from dictionary and brute-force intrusion vectors.'
    },
    {
      id: 'backups',
      title: 'Automated Backups',
      icon: RefreshCw,
      description: 'Your invoicing workspace is backed up automatically every 24 hours. Backups are stored in isolated, geographically redundant cloud nodes, allowing point-in-time database restoration in case of service interruptions.'
    },
    {
      id: 'privacy',
      title: 'Data Privacy Policy',
      icon: Shield,
      description: 'We do not sell, rent, or monetize your client data or invoice records. Your business directory remains completely private to you. Internal staff can only access logs during active, user-permitted support sessions.'
    },
    {
      id: 'data-ownership',
      title: 'Complete Data Ownership',
      icon: FileText,
      description: 'We believe you own your data. You can download your entire invoice directory, client lists, and accounting logs in standard JSON or CSV formats at any time. There are no lock-ins or fees to export your history.'
    }
  ];

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] py-20 px-6 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Security & Trust First
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Invoice-Gen.Net is engineered to protect critical business records. Explore our security infrastructure, encryption standards, and data guarantees.
          </p>
        </div>

        {/* Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {securityPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="border border-zinc-205 dark:border-zinc-850 rounded-xl bg-white dark:bg-zinc-900/10 p-8 space-y-4 hover:border-zinc-350 dark:hover:border-zinc-700 transition-colors duration-250"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50 shadow-sm shadow-emerald-500/10">
                    <Icon size={16} />
                  </div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">{pillar.title}</h2>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Legal & Compliance Section */}
        <div className="border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900/10 rounded-xl p-8 sm:p-12 space-y-6 hover:border-zinc-350 dark:hover:border-zinc-700 transition-colors duration-250">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Regulatory & Standard Compliance</h3>
            <p className="text-xs text-zinc-550 dark:text-zinc-400">
              We align our policies and engineering methods with global data privacy and financial data protection rules.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start">
              <Check className="mr-2 mt-0.5 text-emerald-500 flex-shrink-0" size={14} strokeWidth={2.5} />
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-white">GDPR Alignment</h4>
                <p className="text-zinc-500 mt-0.5">Full support for the right to be forgotten, client data portability, and structured security audits.</p>
              </div>
            </div>
            <div className="flex items-start">
              <Check className="mr-2 mt-0.5 text-emerald-500 flex-shrink-0" size={14} strokeWidth={2.5} />
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-white">Stripe Verified Integration</h4>
                <p className="text-zinc-500 mt-0.5">PCI-DSS Level 1 compliant online payments processing. We never store raw card pins or account keys on our servers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center pt-8">
          <Link href="/login?signup=true">
            <Button className="h-11 px-8 text-xs font-semibold shadow-sm">
              Create Secure Account
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
