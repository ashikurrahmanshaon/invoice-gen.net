'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, ArrowLeft, Mail, Lock, Building2 } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, signInWithGoogle, user } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState<'email' | 'password' | 'company' | null>(null);

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const isSignupParam = searchParams.get('signup');
    if (isSignupParam === 'true') {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (isSignUp && !companyName) {
      setError('Please enter your company name.');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, companyName);
      } else {
        await signIn(email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Auth Error:', err);
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err?.message || 'Google Authentication failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white text-zinc-900 font-sans selection:bg-zinc-200">
      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="inline-flex items-center space-x-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors group">
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back to Landing</span>
        </Link>
      </div>

      {/* Left Column: Form (5 cols) */}
      <div className="lg:col-span-5 flex flex-col justify-center px-6 sm:px-12 py-20 relative bg-white border-r border-zinc-100">
        <div className="max-w-md mx-auto w-full space-y-8">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <div className="flex items-center space-x-2.5 justify-center lg:justify-start">
              <div className="h-6.5 w-6.5 rounded bg-zinc-950 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-semibold text-base tracking-tight text-zinc-900">
                invoice-gen.net
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mt-5">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-xs text-zinc-500">
              {isSignUp ? 'Start managing and creating invoices in minutes.' : 'Sign in to access your dashboard and invoices.'}
            </p>
          </div>

          <div className="border border-zinc-200 bg-zinc-50/50 shadow-md rounded-2xl p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-[11px] font-semibold text-destructive text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Company Name</label>
                  <div className="relative group">
                    <Building2 className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${activeField === 'company' ? 'text-zinc-900' : 'text-zinc-400'}`} />
                    <Input
                      type="text"
                      placeholder="Acme Corp"
                      className="pl-10 h-10 transition-all duration-200 bg-white border-zinc-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 text-zinc-900"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      onFocus={() => setActiveField('company')}
                      onBlur={() => setActiveField(null)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Email Address</label>
                <div className="relative group">
                  <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${activeField === 'email' ? 'text-zinc-900' : 'text-zinc-400'}`} />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 h-10 transition-all duration-200 bg-white border-zinc-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 text-zinc-900"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setActiveField('email')}
                    onBlur={() => setActiveField(null)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Password</label>
                  {!isSignUp && (
                    <a href="#" className="text-[10px] font-semibold text-zinc-550 hover:text-zinc-900 transition-colors">
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative group">
                  <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${activeField === 'password' ? 'text-zinc-900' : 'text-zinc-400'}`} />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-10 transition-all duration-200 bg-white border-zinc-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 text-zinc-900"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setActiveField('password')}
                    onBlur={() => setActiveField(null)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-10 mt-2 bg-zinc-950 hover:bg-zinc-900 text-white active:scale-[0.98] transition-all rounded-lg text-xs font-semibold shadow-sm" isLoading={isLoading}>
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </form>

            <div className="relative flex items-center justify-center text-[9px] uppercase font-bold tracking-widest my-4">
              <span className="absolute inset-x-0 h-px bg-zinc-200" />
              <span className="relative bg-zinc-50/50 px-3.5 text-zinc-400 font-bold">Or continue with</span>
            </div>

            <Button
              variant="outline"
              className="w-full h-10 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 transition-all duration-200 shadow-sm rounded-lg text-xs font-semibold"
              onClick={handleGoogleLogin}
              isLoading={isLoading}
            >
              <svg className="mr-2.5 h-4.5 w-4.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google Auth
            </Button>
          </div>

          <div className="text-center text-xs">
            <span className="text-zinc-550">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              onClick={() => {
                setError('');
                setIsSignUp(!isSignUp);
              }}
              className="text-zinc-950 hover:underline font-bold cursor-pointer"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Visual Teaser (7 cols) - Fully Light-Themed */}
      <div className="lg:col-span-7 bg-[#FAFAFA] text-zinc-900 p-12 lg:p-20 flex flex-col justify-between hidden lg:flex relative overflow-hidden select-none">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1.5px,transparent_1.5px),linear-gradient(to_bottom,#e4e4e7_1.5px,transparent_1.5px)] bg-[size:4rem_4rem] opacity-25" />
        <div className="absolute top-10 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.04] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] rounded-full bg-violet-500/[0.04] blur-[90px] pointer-events-none" />

        {/* Top Branding Logo */}
        <div className="flex items-center space-x-2.5 relative z-10">
          <div className="h-7 w-7 rounded bg-zinc-950 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            <svg
              className="w-4.5 h-4.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-semibold text-base tracking-tight text-zinc-900">invoice-gen.net</span>
        </div>

        {/* Middle Copy */}
        <div className="space-y-6 relative z-10 max-w-lg mt-12 mb-8">
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-150 bg-indigo-50/50 px-4.5 py-1.5 text-xs font-semibold text-indigo-600">
            <Sparkles size={12} className="text-indigo-500" />
            <span>AI Text-to-Invoice Integration Included</span>
          </div>
          <h3 className="text-4xl font-bold tracking-tight leading-[1.15] text-zinc-900">
            Streamline your billing workflow and get paid in record time.
          </h3>
          <p className="text-zinc-550 text-sm leading-relaxed">
            Whether you need custom tax rules, discount adjustments, client record sheets, or printable vector sheets, we cover everything in one spot.
          </p>
        </div>

        {/* Mockup Dashboard Section - Light Mockups */}
        <div className="relative w-full h-[320px] mt-4 z-10">
          {/* Main Dashboard Card */}
          <div className="absolute top-0 left-0 w-[90%] bg-white border border-zinc-200/80 rounded-2xl shadow-xl p-5 space-y-4 backdrop-blur-md transition-all duration-300 hover:translate-y-[-4px] hover:border-zinc-300">
            <div className="flex justify-between items-center pb-2.5 border-b border-zinc-150">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-zinc-200" />
                <div className="h-2 w-2 rounded-full bg-zinc-200" />
                <div className="h-2 w-2 rounded-full bg-zinc-200" />
              </div>
              <div className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider">Workspace Preview</div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded bg-zinc-50 border border-zinc-100">
                <p className="text-[8px] text-zinc-450 font-semibold uppercase tracking-wider">YTD Revenue</p>
                <p className="text-base font-bold text-zinc-900 mt-0.5">$142,500.00</p>
              </div>
              <div className="p-3 rounded bg-zinc-50 border border-zinc-100">
                <p className="text-[8px] text-zinc-450 font-semibold uppercase tracking-wider">Pending Payouts</p>
                <p className="text-base font-bold text-amber-600 mt-0.5">$6,000.00</p>
              </div>
              <div className="p-3 rounded bg-zinc-50 border border-zinc-100">
                <p className="text-[8px] text-zinc-450 font-semibold uppercase tracking-wider">Clients</p>
                <p className="text-base font-bold text-zinc-900 mt-0.5">12 Active</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[8px] text-zinc-450 font-semibold uppercase tracking-wider">Recent Invoices</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2 rounded bg-zinc-50/50 border border-zinc-150 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-zinc-900">INV-2026-004</span>
                    <span className="text-[9px] text-zinc-450">• Acme Corp</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-zinc-900">$6,000.00</span>
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Pending</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-zinc-50/50 border border-zinc-150 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-zinc-900">INV-2026-003</span>
                    <span className="text-[9px] text-zinc-450">• Stripe Inc</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-zinc-900">$8,500.00</span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Paid</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overlapping Client Profile Widget */}
          <div className="absolute bottom-4 right-4 w-[220px] bg-white border border-zinc-200/90 rounded-xl shadow-lg p-3.5 space-y-2.5 backdrop-blur-md transform translate-x-2 translate-y-2 hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center space-x-2.5">
              <div className="h-7 w-7 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-[10px] text-zinc-700 border border-zinc-200">AC</div>
              <div>
                <p className="text-[10px] font-semibold text-zinc-900 leading-tight">Acme Corporation</p>
                <p className="text-[8px] text-zinc-400 leading-none mt-0.5">billing@acme.com</p>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2.5 border-t border-zinc-100 text-[9px]">
              <div>
                <p className="text-zinc-400">Balance</p>
                <p className="font-bold text-zinc-900 mt-0.5">$6,000.00</p>
              </div>
              <div className="text-right">
                <p className="text-zinc-400">Status</p>
                <p className="font-bold text-amber-600 mt-0.5">Outstanding</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-zinc-400 relative z-10 mt-auto">
          &copy; 2026 invoice-gen.net. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
