import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/lib/types';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function formatAuthError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('Failed to fetch') || msg.includes('fetch')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    if (msg.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (msg.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    if (msg.includes('already registered') || msg.includes('already in use')) {
      return 'This email is already registered. Try signing in instead.';
    }
    if (msg.includes('Password should be') || msg.includes('password')) {
      return 'Password must be at least 6 characters long.';
    }
    return msg;
  }
  return 'An unexpected error occurred. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        loadProfile(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        (async () => {
          await loadProfile(newSession.user.id);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Profile load error:', error.message);
    }
    setProfile(data as Profile | null);
    setLoading(false);
  }

  async function refreshProfile() {
    if (session) {
      await loadProfile(session.user.id);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? formatAuthError(error) : null };
    } catch (err) {
      return { error: formatAuthError(err) };
    }
  }

  async function signUp(email: string, password: string, fullName: string, role: UserRole) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      // The database trigger (handle_new_user) creates the profile row
      // automatically with full_name and role from user metadata.

      return { error: null };
    } catch (err) {
      return { error: formatAuthError(err) };
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
