'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Menu, X, FileText, ArrowRight, Sparkles,
  Zap, Users, Star, ChevronDown
} from 'lucide-react';

/* ─── Ticker messages ─────────────────────────────────── */
const TICKER_ITEMS = [
  { icon: '⚡', text: 'Free invoice generator — no sign-up needed.' },
  { icon: '🎉', text: '10,000+ invoices created this week.' },
  { icon: '🔒', text: 'Bank-grade security powered by Stripe.' },
  { icon: '🚀', text: 'Create a professional invoice in under 2 minutes.' },
];

function AnnouncementBar({ onDismiss }: { onDismiss: () => void }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx(i => (i + 1) % TICKER_ITEMS.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const item = TICKER_ITEMS[idx];

  return (
    <div className="relative z-50 bg-zinc-950 border-b border-white/[0.06] overflow-hidden">
      {/* subtle emerald glow line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

      <div className="relative flex items-center justify-center h-9 px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2.5 text-[12.5px]"
          >
            {/* glowing badge */}
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Free
            </span>

            <span className="text-zinc-300 font-medium">
              {item.text}
            </span>

            <Link
              href="/free-invoice-generator"
              className="flex items-center gap-1 text-white font-bold hover:text-emerald-400 transition-colors"
            >
              Try it free
              <ArrowRight size={12} strokeWidth={2.5} />
            </Link>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-zinc-600 hover:text-zinc-300 hover:bg-white/10 transition-all cursor-pointer"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Navbar ─────────────────────────────────────── */
const navLinks = [
  { label: 'Home',     href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Solutions',href: '/solutions' },
  { label: 'Pricing',  href: '/pricing' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <div className="sticky top-0 z-50 w-full no-print">


      {/* ── Navbar Shell ── */}
      <div
        className={`w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 dark:bg-[#080808]/90 backdrop-blur-2xl border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_1px_24px_-4px_rgba(0,0,0,0.08)]'
            : 'bg-white/60 dark:bg-[#080808]/60 backdrop-blur-lg border-b border-zinc-100/60 dark:border-zinc-900/60'
        }`}
      >
        {/* top edge glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-[60px] flex items-center justify-between gap-6">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative">
              <div className="h-9 w-9 rounded-[10px] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_4px_14px_-2px_rgba(16,185,129,0.5)] transition-all duration-300 group-hover:shadow-[0_6px_20px_-2px_rgba(16,185,129,0.65)] group-hover:scale-105">
                <FileText className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
              </div>
              {/* live pulse dot */}
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-[#080808]" />
              </span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-[17px] tracking-[-0.03em] text-zinc-900 dark:text-white flex items-baseline">
                invoice<span className="text-zinc-300 dark:text-zinc-600 mx-[1px] font-light">-</span>gen
                <span className="text-emerald-500">.net</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-600 leading-none mt-0.5">
                Invoice Platform
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative group px-4 py-2 text-[14px] font-semibold rounded-lg transition-colors duration-200
                    ${active
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}
                  `}
                >
                  {/* active background */}
                  {active && (
                    <motion.span
                      layoutId="nav-bg"
                      className="absolute inset-0 rounded-lg bg-emerald-50 dark:bg-emerald-500/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  {/* hover bg */}
                  <span className="absolute inset-0 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                  {/* underline */}
                  <span
                    className={`absolute bottom-1 left-4 right-4 h-[2px] rounded-full bg-emerald-500 transition-all duration-200 origin-left
                      ${active ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-40'}
                    `}
                  />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}

            {/* Separator */}
            <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />

            {/* Free Tool highlight link */}
            <Link
              href="/free-invoice-generator"
              className="relative group flex items-center gap-1.5 px-4 py-2 text-[14px] font-bold text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors duration-200"
            >
              <Zap size={13} className="shrink-0" />
              Free Tool
              <span className="ml-0.5 flex items-center gap-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full leading-none">
                100% Free
              </span>
            </Link>
          </nav>



          {/* ── Mobile Hamburger ── */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="lg:hidden p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? 'x' : 'burger'}
                initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18 }}
                className="block"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="drawer"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="lg:hidden absolute left-0 right-0 mt-1 mx-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/96 dark:bg-[#0A0A0A]/96 backdrop-blur-2xl shadow-2xl shadow-zinc-900/10 overflow-hidden"
          >
            <nav className="p-3 flex flex-col gap-0.5">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive(link.href)
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </Link>
              ))}
              <Link
                href="/free-invoice-generator"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-500/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
              >
                <Zap size={15} />
                Free Tool
                <span className="ml-1 text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">Free</span>
              </Link>
            </nav>


          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
