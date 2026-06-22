'use strict';

import { supabase, isSupabaseConfigured } from './db';

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    company_name?: string;
    avatar_url?: string;
    full_name?: string;
  };
}

type AuthChangeCallback = (user: User | null) => void;

const listeners = new Set<AuthChangeCallback>();
let currentUser: User | null = null;

// Initial loading of mock session
if (typeof window !== 'undefined') {
  const storedUser = localStorage.getItem('sip_auth_user');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
  }
}

const notifyListeners = () => {
  listeners.forEach((listener) => listener(currentUser));
};

export const authService = {
  getCurrentUser(): User | null {
    if (isSupabaseConfigured && supabase) {
      // Supabase is async or synchronous session checking. Let's return cached or query auth.
      // For NextJS routing simplicity we cache state
      return currentUser;
    }
    return currentUser;
  },

  async signUp(email: string, password: string,companyName: string): Promise<User> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_name: companyName,
          },
        },
      });
      if (error) throw error;
      if (!data.user) throw new Error('Failed to register user.');
      if (!data.session && data.user) throw new Error('Please check your email to confirm your account.');
      
      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        user_metadata: {
          company_name: companyName,
        },
      };
      return user;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate api delay
      const user: User = {
        id: `user-${Date.now()}`,
        email,
        user_metadata: {
          company_name: companyName,
        },
      };
      
      currentUser = user;
      localStorage.setItem('sip_auth_user', JSON.stringify(user));
      notifyListeners();
      return user;
    }
  },

  async signIn(email: string, password: string): Promise<User> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (!data.user) throw new Error('User not found.');

      // Fetch company profile to obtain metadata
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_name')
        .eq('id', data.user.id)
        .single();

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        user_metadata: {
          company_name: profile?.company_name || 'My Company',
        },
      };
      
      currentUser = user;
      notifyListeners();
      return user;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Standard mock user
      const user: User = {
        id: 'mock-user-123',
        email,
        user_metadata: {
          company_name: 'invoice-gen.net Inc.',
          full_name: 'SaaS Builder',
        },
      };

      currentUser = user;
      localStorage.setItem('sip_auth_user', JSON.stringify(user));
      notifyListeners();
      return user;
    }
  },

  async signInWithGoogle(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (error) throw error;
    } else {
      // Simulate Google Auth with a short delay and redirect
      await new Promise((resolve) => setTimeout(resolve, 500));
      const user: User = {
        id: 'mock-user-123',
        email: 'google.demo@gmail.com',
        user_metadata: {
          company_name: 'Google Partner LLC',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
          full_name: 'Alex Rivera',
        },
      };
      currentUser = user;
      localStorage.setItem('sip_auth_user', JSON.stringify(user));
      notifyListeners();
      window.location.href = '/dashboard';
    }
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    
    currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sip_auth_user');
    }
    notifyListeners();
  },

  onAuthStateChange(callback: AuthChangeCallback): () => void {
    listeners.add(callback);

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const { data: { subscription } } = client.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            // Fetch metadata safely
            let companyName = session.user.user_metadata?.company_name || 'My Company';
            try {
              const { data: profile, error } = await client
                .from('profiles')
                .select('company_name')
                .eq('id', session.user.id)
                .single();
              
              if (profile && profile.company_name) {
                companyName = profile.company_name;
              }
            } catch (err) {
              console.warn('Could not fetch profile during auth state change:', err);
            }

            currentUser = {
              id: session.user.id,
              email: session.user.email!,
              user_metadata: {
                company_name: companyName,
                full_name: session.user.user_metadata?.full_name,
                avatar_url: session.user.user_metadata?.avatar_url,
              },
            };
          } else {
            currentUser = null;
          }
          callback(currentUser);
        }
      );

      return () => {
        listeners.delete(callback);
        subscription.unsubscribe();
      };
    }

    callback(currentUser); // Initial trigger for mock
    return () => {
      listeners.delete(callback);
    };
  },
};
