'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, ArrowLeft, Mail, Lock, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

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

    const errorParam = searchParams.get('error');
    if (errorParam === 'auth-failed') {
      setError('Authentication failed. Please ensure Google Provider is enabled in Supabase and your credentials are correct.');
    } else if (errorParam) {
      setError(errorParam);
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Left Column: Form */}
      <div className="relative flex flex-col justify-center px-6 sm:px-12 py-20 bg-white">
        {/* Back button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-8 left-8 z-20"
        >
          <Link href="/" className="inline-flex items-center space-x-2 text-sm font-medium text-zinc-400 hover:text-zinc-900 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1.5 transition-transform duration-300" />
            <span>Back to Landing</span>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-[420px] mx-auto w-full space-y-8"
        >
          <div className="flex flex-col space-y-3 text-center sm:text-left">
            <div className="flex items-center space-x-3 justify-center sm:justify-start mb-2">
              <div className="h-8 w-8 rounded-xl bg-zinc-950 flex items-center justify-center shadow-lg shadow-zinc-900/20">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-bold text-lg tracking-tight text-zinc-900">
                invoice-gen.net
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-zinc-500">
              {isSignUp ? 'Join thousands of freelancers and businesses getting paid faster.' : 'Sign in to your account to continue managing invoices.'}
            </p>
          </div>

          <div className="space-y-6">
            <Button
              variant="outline"
              type="button"
              className="w-full h-12 border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 transition-all duration-200 shadow-sm rounded-xl text-sm font-semibold flex items-center justify-center group"
              onClick={handleGoogleLogin}
              isLoading={isLoading}
            >
              <svg className="mr-3 h-5 w-5 transition-transform group-hover:scale-110 duration-300" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google
            </Button>

            <div className="relative flex items-center justify-center text-xs uppercase font-bold tracking-widest my-6">
              <span className="absolute inset-x-0 h-px bg-zinc-100" />
              <span className="relative bg-white px-4 text-zinc-400">Or continue with email</span>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-red-100 bg-red-50 text-sm font-medium text-red-600 text-center">
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 block">Company Name</label>
                  <div className="relative group">
                    <Building2 className={`absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 transition-colors duration-300 ${activeField === 'company' ? 'text-indigo-600' : 'text-zinc-400'}`} />
                    <Input
                      type="text"
                      placeholder="Acme Corp"
                      className="pl-11 h-12 rounded-xl transition-all duration-300 bg-zinc-50 border-zinc-200 hover:bg-zinc-100/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-zinc-900 text-base"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      onFocus={() => setActiveField('company')}
                      onBlur={() => setActiveField(null)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 block">Email Address</label>
                <div className="relative group">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 transition-colors duration-300 ${activeField === 'email' ? 'text-indigo-600' : 'text-zinc-400'}`} />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="pl-11 h-12 rounded-xl transition-all duration-300 bg-zinc-50 border-zinc-200 hover:bg-zinc-100/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-zinc-900 text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setActiveField('email')}
                    onBlur={() => setActiveField(null)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 block">Password</label>
                  {!isSignUp && (
                    <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 transition-colors duration-300 ${activeField === 'password' ? 'text-indigo-600' : 'text-zinc-400'}`} />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-11 h-12 rounded-xl transition-all duration-300 bg-zinc-50 border-zinc-200 hover:bg-zinc-100/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-zinc-900 text-base"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setActiveField('password')}
                    onBlur={() => setActiveField(null)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 mt-4 bg-zinc-900 hover:bg-zinc-800 text-white active:scale-[0.98] transition-all rounded-xl text-sm font-semibold shadow-lg shadow-zinc-900/20" isLoading={isLoading}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center text-sm mt-6">
              <span className="text-zinc-500">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setIsSignUp(!isSignUp);
                }}
                className="text-zinc-900 hover:text-indigo-600 font-semibold transition-colors"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Premium Dark Teaser */}
      <div className="hidden lg:flex relative overflow-hidden bg-zinc-950 flex-col justify-center items-center p-12">
        {/* Animated Glow Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 blur-[120px] rounded-full mix-blend-screen"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-violet-600/30 blur-[130px] rounded-full mix-blend-screen"
          />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-lg w-full"
        >
          <div className="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-8 backdrop-blur-md">
            <Sparkles size={14} className="text-indigo-400" />
            <span>AI-Powered Invoicing</span>
          </div>
          
          <h3 className="text-5xl font-bold tracking-tight leading-[1.1] text-white mb-6">
            Get paid faster with beautiful invoices.
          </h3>
          <p className="text-zinc-400 text-lg leading-relaxed mb-12">
            Create, send, and track professional invoices in seconds. Manage your entire billing workflow in one premium dashboard.
          </p>

          {/* Glassmorphic Mockup */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="text-xs text-zinc-500 font-mono">dashboard_preview</div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="text-zinc-400 text-xs mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-white">$24,500<span className="text-zinc-500 text-lg">.00</span></div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="text-zinc-400 text-xs mb-1">Pending</div>
                <div className="text-2xl font-bold text-indigo-400">$3,200<span className="text-indigo-400/50 text-lg">.00</span></div>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-xs border border-indigo-500/30">
                      C{i}
                    </div>
                    <div>
                      <div className="text-sm text-white font-medium">Client Project {i}</div>
                      <div className="text-xs text-zinc-500">INV-2026-00{i}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">${i * 1200}.00</div>
                    <div className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded mt-1 border border-emerald-400/20 inline-block">Paid</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Element */}
            <motion.div 
              animate={{ y: [0, 15, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-8 -bottom-8 bg-zinc-900 border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-xl w-48"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Invoice Paid</div>
                  <div className="text-[10px] text-zinc-400">Just now</div>
                </div>
              </div>
              <div className="text-lg font-bold text-white">$1,200.00</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
