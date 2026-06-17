'use strict';

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth';
import { dbService, Profile } from '@/services/db';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const data = await dbService.getProfile(userId);
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile in layout:', err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchProfile(user.id);
        
        // Polling or listener to refresh profile if upgraded
        const handleFocus = () => {
          fetchProfile(user.id);
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
      }
    }
  }, [user, authLoading, router, fetchProfile]);

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-lg shadow-md animate-bounce">
            I
          </div>
          <div className="text-xs text-muted-foreground font-semibold tracking-wider uppercase animate-pulse">
            invoice-gen.net Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Prevent showing flash of dashboard
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background text-foreground">
      {/* Navigation Sidebar */}
      <Sidebar isPremium={profile?.is_premium || false} />

      {/* Main Panel Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
