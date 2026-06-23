'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X } from 'lucide-react';

/* ─── Ticker messages ─────────────────────────────────── */
const TICKER_ITEMS = [
  { icon: '⚡', text: 'Free invoice generator — no sign-up needed.' },
  { icon: '🎉', text: '10,000+ invoices created this week.' },
  { icon: '🔒', text: 'Bank-grade security: all data stays on your device.' },
  { icon: '🚀', text: 'Create a professional invoice in under 2 minutes.' },
];

function AnnouncementBar({ onDismiss }: { onDismiss: () => void }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx(i => (i + 1) % TICKER_ITEMS.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const item = TICKER_ITEMS[idx];

  return (
    <div className="relative z-50 bg-zinc-950 border-b border-white/[0.06] overflow-hidden">
      {/* subtle emerald glow line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

      <div className="relative flex items-center justify-center h-8 px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 text-[11.5px]"
          >
            {/* glowing badge */}
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              Free
            </span>

            <span className="text-zinc-350 font-medium">
              {item.text}
            </span>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-zinc-650 hover:text-zinc-300 hover:bg-white/10 transition-all cursor-pointer"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Navbar ─────────────────────────────────────── */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full no-print">
      {showAnnouncement && (
        <AnnouncementBar onDismiss={() => setShowAnnouncement(false)} />
      )}

      {/* ── Navbar Shell ── */}
      <div
        className={`w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 dark:bg-[#080808]/90 backdrop-blur-2xl border-b border-zinc-250/80 dark:border-zinc-800/80 shadow-[0_1px_15px_-4px_rgba(0,0,0,0.05)]'
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
                Free Lite Tool
              </span>
            </div>
          </Link>

          {/* ── Badges ── */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-500/10 text-emerald-650 dark:text-emerald-400 text-[11px] font-bold">
              ⚡ 100% Free
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 text-[11px] font-medium">
              🛡️ Offline Ready & Private
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
