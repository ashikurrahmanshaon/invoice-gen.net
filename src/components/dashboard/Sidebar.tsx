'use strict';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/context/theme';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Sparkles,
  BarChart3,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Home,
} from 'lucide-react';

interface SidebarProps {
  isPremium?: boolean;
}

export function Sidebar({ isPremium = false }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false); // Mobile toggle
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop toggle

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'AI Assistant', href: '/ai-assistant', icon: Sparkles, premium: true },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, premium: true },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Signout Error:', err);
    }
  };

  const activeLink = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Top Navbar Bar */}
      <div className="flex md:hidden h-16 items-center justify-between border-b border-border px-4 bg-card w-full sticky top-0 z-30 no-print">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">I</span>
          <span className="font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">invoice-gen.net</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-md text-muted-foreground hover:bg-secondary cursor-pointer"
          aria-label="Open navigation menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden no-print"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 bg-card border-r border-border flex flex-col justify-between transition-all duration-300 md:sticky md:h-screen md:top-0 no-print
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          {/* Sidebar Logo */}
          <div className={`px-6 flex items-center justify-between mb-8 ${isCollapsed ? 'justify-center px-0' : ''}`}>
            {!isCollapsed ? (
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">I</span>
                <span className="font-extrabold text-md tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                  invoice-gen.net
                </span>
              </Link>
            ) : (
              <Link href="/dashboard" className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
                I
              </Link>
            )}

            {/* Collapse button (Desktop only) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 space-y-1.5">
            {navigation.map((item) => {
              const active = activeLink(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all group relative ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon
                    size={18}
                    className={`transition-colors ${active ? 'text-current' : 'text-muted-foreground group-hover:text-foreground'}`}
                  />
                  
                  {(!isCollapsed || isOpen) && (
                    <span className="ml-3 flex-1 flex items-center justify-between">
                      <span>{item.name}</span>
                      {item.premium && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          active
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : isPremium
                              ? 'bg-success/10 text-success'
                              : 'bg-primary/10 text-primary'
                        }`}>
                          {isPremium ? 'PRO' : 'PREMIUM'}
                        </span>
                      )}
                    </span>
                  )}

                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && !isOpen && (
                    <div className="absolute left-16 bg-zinc-950 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-md">
                      {item.name} {item.premium && (isPremium ? '(Pro)' : '(Premium)')}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile and Bottom Panel */}
        <div className="p-4 border-t border-border/60 space-y-3">
          {/* Quick theme switcher */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} text-xs text-muted-foreground`}>
            {!isCollapsed && <span>Theme Mode</span>}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          {/* User Profile info */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} pb-1`}>
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
              {user?.email?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {user?.user_metadata?.company_name || 'My Company'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-1">
            {/* Back to Website */}
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={`flex items-center rounded-md text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all
                ${isCollapsed ? 'justify-center py-2' : 'px-3 py-2'}
              `}
              title="Back to Website"
            >
              <Home size={15} />
              {!isCollapsed && <span className="ml-2.5">Back to Website</span>}
            </Link>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className={`w-full flex items-center rounded-md text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all cursor-pointer
                ${isCollapsed ? 'justify-center py-2' : 'px-3 py-2'}
              `}
              title="Sign Out"
            >
              <LogOut size={15} />
              {!isCollapsed && <span className="ml-2.5">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
