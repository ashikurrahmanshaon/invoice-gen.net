'use client';

import React from 'react';
import { AuthProvider } from '@/context/auth';
import { ThemeProvider } from '@/context/theme';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
