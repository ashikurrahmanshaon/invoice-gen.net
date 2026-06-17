'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { Menu, X, FileText, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'Solutions', href: '/solutions' },
    { label: 'Pricing', href: '/pricing' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-4 z-50 w-full max-w-7xl mx-auto px-4 lg:px-6 transition-all duration-350">
      <div className="border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-[#0A0A0A]/85 backdrop-blur-xl shadow-lg shadow-zinc-800/5 dark:shadow-black/20 rounded-2xl h-16 px-5 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-md shadow-sm border border-emerald-500/20">
            <FileText className="w-5 h-5 text-white drop-shadow-sm" strokeWidth={2.5} />
          </div>
          <span className="font-black text-lg tracking-tighter text-zinc-950 dark:text-white group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors flex items-center">
            invoice<span className="text-zinc-400 dark:text-zinc-500 mx-[1px]">-</span>gen<span className="text-emerald-600 dark:text-emerald-500">.net</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-2 rounded-full text-[15px] font-semibold transition-all duration-300 ${
                isActive(link.href)
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)] dark:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions Block */}
        <div className="flex items-center space-x-4">
          
          {/* Guest or User Session CTA Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            {user ? (
              <Link href="/dashboard">
                <Button className="group h-10 px-5 text-[15px] font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white border-none rounded-lg shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40">
                  Go to Workspace
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="h-10 px-5 text-[15px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 rounded-lg">
                    Sign In
                  </Button>
                </Link>
                <Link href="/login?signup=true">
                  <Button className="group h-10 px-6 text-[15px] font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white border-none rounded-lg shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#0A0A0A] py-4 px-6 space-y-4 shadow-inner">
          <nav className="flex flex-col space-y-2.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  isActive(link.href)
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)] dark:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col space-y-3">


            {user ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button className="w-full h-10 font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg shadow-sm">Go to Workspace</Button>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full h-10 font-medium bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    Sign In
                  </Button>
                </Link>
                <Link href="/login?signup=true" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button className="w-full h-10 font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-lg shadow-sm border-none transition-all">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
