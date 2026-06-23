'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Menu } from 'lucide-react';

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
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const isActive = (href: string) => pathname === href;

  const handleCtaClick = (e: React.MouseEvent) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('editor');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setMobileOpen(false);
      }
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full no-print">
      {/* ── Navbar Shell ── */}
      <div
        className={`w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 dark:bg-[#080808]/90 backdrop-blur-2xl border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_1px_15px_-4px_rgba(0,0,0,0.05)]'
            : 'bg-white/60 dark:bg-[#080808]/60 backdrop-blur-lg border-b border-zinc-100/60 dark:border-zinc-900/60'
        }`}
      >
        {/* top edge glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative">
              <div className="h-8 w-8 rounded-[8px] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_3px_10px_-2px_rgba(16,185,129,0.4)] transition-all duration-300 group-hover:scale-105">
                <FileText className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              {/* live pulse dot */}
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 border-2 border-white dark:border-[#080808]" />
              </span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-[15px] tracking-[-0.03em] text-zinc-900 dark:text-white flex items-baseline">
                invoice<span className="text-zinc-300 dark:text-zinc-700 mx-[1px] font-light">-</span>gen
                <span className="text-emerald-500">.net</span>
              </span>
              <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-650 leading-none mt-0.5">
                Free Invoicing
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative group px-3 py-1.5 text-[13px] font-bold rounded-lg transition-colors duration-200
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
                  <span className="absolute inset-0 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ── Desktop CTA ── */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/#editor"
              onClick={handleCtaClick}
              className="px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs rounded-xl shadow-sm hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            >
              Create Invoice
            </Link>
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-400 transition-colors cursor-pointer"
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
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
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
            className="md:hidden absolute left-0 right-0 mt-1 mx-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/96 dark:bg-[#0A0A0A]/96 backdrop-blur-2xl shadow-2xl shadow-zinc-900/10 overflow-hidden"
          >
            <nav className="p-3 flex flex-col gap-0.5">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive(link.href)
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-55 dark:hover:bg-zinc-900/60'
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </Link>
              ))}
              <Link
                href="/#editor"
                onClick={handleCtaClick}
                className="flex items-center justify-center gap-2 px-4 py-3 mt-2 rounded-xl text-sm font-bold text-white bg-zinc-950 dark:bg-white dark:text-zinc-950 hover:opacity-90 transition-all text-center"
              >
                Create Invoice
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
