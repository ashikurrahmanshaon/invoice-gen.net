'use strict';

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/context/theme';
import { dbService, Profile } from '@/services/db';
import { stripeService } from '@/services/stripe';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
  DollarSign,
  Sun,
  Moon,
  Monitor,
  Check,
  CreditCard,
  Crown,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  
  // Profile settings state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [logoBase64, setLogoBase64] = useState('');
  const [brandColor, setBrandColor] = useState('indigo');
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const data = await dbService.getProfile(user.id);
      setProfile(data);
      setCompanyName(data.company_name || '');
      setCompanyEmail(data.company_email || '');
      setCompanyPhone(data.company_phone || '');
      setCompanyAddress(data.company_address || '');
      setCurrency(data.currency || 'USD');
      setLogoBase64(data.logo_url || '');
      setBrandColor(data.brand_color || 'indigo');
    } catch (err) {
      console.error('Failed to load profile settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  // Logo file-to-base64 reader
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate size (max 500KB for base64 storage)
    if (file.size > 500 * 1024) {
      alert('Logo file too large! Please upload an image under 500KB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccess(false);
    try {
      const updated = await dbService.updateProfile(user.id, {
        company_name: companyName,
        company_email: companyEmail,
        company_phone: companyPhone,
        company_address: companyAddress,
        currency: currency,
        logo_url: logoBase64,
        brand_color: brandColor,
      });
      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleBillingUpgrade = async () => {
    if (!user) return;
    setBillingLoading(true);
    try {
      const active = profile?.is_premium;
      if (active) {
        // Manage / downgrade
        await stripeService.manageSubscription(user.id);
      } else {
        // Upgrade
        await stripeService.upgradeToPremium(user.id);
      }
      await loadProfile(); // reload
    } catch (err) {
      console.error('Billing Operation Failed:', err);
    } finally {
      setBillingLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-44 bg-secondary animate-pulse rounded" />
        <div className="h-96 bg-secondary animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure company profiles, default billing variables, and visual themes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile forms (7 cols) */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-7 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Company Profile Information</CardTitle>
              <CardDescription>This information will appear on the header of all invoices generated by your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {success && (
                <div className="p-3 rounded-lg border border-success/20 bg-success/10 text-xs font-semibold text-success text-center">
                  Settings updated successfully!
                </div>
              )}

              <Input
                label="Company Name"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Billing Email"
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                />
                <Input
                  label="Company Phone"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                />
              </div>

              <Textarea
                label="Company Address"
                rows={3}
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
              />

              {/* Logo Upload */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Logo</label>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 border border-border rounded-lg bg-secondary/35 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                    {logoBase64 ? (
                      <img src={logoBase64} alt="Company Logo Preview" className="object-contain max-h-full max-w-full p-1" />
                    ) : (
                      <ImageIcon size={24} className="text-muted-foreground/60" />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <input
                      type="file"
                      id="logo-upload-input"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="logo-upload-input"
                      className="inline-flex items-center justify-center rounded-md font-medium text-xs border border-border h-9 px-3 hover:bg-secondary cursor-pointer"
                    >
                      Choose Image
                    </label>
                    <p className="text-[10px] text-muted-foreground">Supported format: PNG, JPG, WebP. Recommended max width: 300px. Max size: 500KB.</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <span className="text-[10px] text-muted-foreground">Draft logs save locally immediately.</span>
              <Button type="submit" isLoading={saving} size="sm">
                Save Profile Configuration
              </Button>
            </CardFooter>
          </Card>

          {/* Preferences */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Invoicing Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Select
                label="Default Currency Code"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={[
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'GBP', label: 'GBP (£)' },
                  { value: 'CAD', label: 'CAD ($)' },
                  { value: 'AUD', label: 'AUD ($)' },
                ]}
              />

              {/* Brand Color Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Invoice PDF Brand Color
                </label>
                <div className="flex items-center space-x-3 pt-1">
                  {[
                    { id: 'indigo', name: 'Indigo', colorClass: 'bg-indigo-600 border-indigo-700' },
                    { id: 'emerald', name: 'Emerald', colorClass: 'bg-emerald-600 border-emerald-700' },
                    { id: 'rose', name: 'Rose', colorClass: 'bg-rose-600 border-rose-700' },
                    { id: 'amber', name: 'Amber', colorClass: 'bg-amber-500 border-amber-600' },
                    { id: 'slate', name: 'Slate', colorClass: 'bg-slate-800 border-slate-900' },
                  ].map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setBrandColor(color.id)}
                      className={`h-8 w-8 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all ${
                        color.colorClass
                      } ${brandColor === color.id ? 'ring-2 ring-ring scale-110' : 'opacity-80 hover:opacity-100 hover:scale-105'}`}
                      title={color.name}
                    >
                      {brandColor === color.id && <Check size={14} className="text-white font-bold" />}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">The selected accent color will be applied to the invoice headers, tables, and borders.</p>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Theme and Billing cards (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Visual Theme Panel */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Visual Appearance</CardTitle>
              <CardDescription>Select the coloring theme for your dashboard session.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {/* Light */}
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold space-y-2 cursor-pointer ${
                    theme === 'light' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-secondary/40'
                  }`}
                >
                  <Sun size={16} />
                  <span>Light</span>
                </button>
                {/* Dark */}
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold space-y-2 cursor-pointer ${
                    theme === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-secondary/40'
                  }`}
                >
                  <Moon size={16} />
                  <span>Dark</span>
                </button>
                {/* System */}
                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold space-y-2 cursor-pointer ${
                    theme === 'system' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-secondary/40'
                  }`}
                >
                  <Monitor size={16} />
                  <span>System</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Premium Billing upgrades */}
          <Card className={`shadow-sm border-2 ${profile.is_premium ? 'border-success/30 bg-success/[0.01]' : 'border-primary/20'}`}>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>SaaS Subscriptions</span>
                {profile.is_premium ? (
                  <span className="text-[10px] font-bold bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full uppercase flex items-center">
                    <Crown size={10} className="mr-1" /> Pro Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-secondary text-muted-foreground border border-border px-2 py-0.5 rounded-full uppercase">
                    Free Tier
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {profile.is_premium
                  ? 'Thank you for subscribing to invoice-gen.net!'
                  : 'Upgrade to unlock AI parsing, payment logs, and detailed revenue metrics.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs leading-relaxed">
              <div className="space-y-2 border-b border-border/40 pb-4">
                <div className="flex items-center space-x-2 text-foreground">
                  <Check size={14} className="text-success" />
                  <span className="font-semibold">Unlimited Invoices & Clients</span>
                </div>
                <div className="flex items-center space-x-2 text-foreground">
                  <Check size={14} className="text-success" />
                  <span className="font-semibold">AI Text-to-Invoice Drafting</span>
                </div>
                <div className="flex items-center space-x-2 text-foreground">
                  <Check size={14} className="text-success" />
                  <span className="font-semibold">Advanced Revenue Analytics</span>
                </div>
                <div className="flex items-center space-x-2 text-foreground">
                  <Check size={14} className="text-success" />
                  <span className="font-semibold">Stripe Payment tracking log</span>
                </div>
              </div>

              {!profile.is_premium && (
                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>Price: $15/month billed annually</span>
                  <span>Secure checkout via Stripe</span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant={profile.is_premium ? 'outline' : 'primary'}
                className="w-full text-xs font-bold"
                onClick={handleBillingUpgrade}
                isLoading={billingLoading}
              >
                {profile.is_premium ? (
                  <>
                    <CreditCard size={14} className="mr-1.5" /> Downgrade / Manage Billing
                  </>
                ) : (
                  <>
                    <Crown size={14} className="mr-1.5" /> Upgrade to Pro Plan
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
