import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { v4 as uuid } from 'uuid';

interface AuthContextType {
  user: any;
  session: any;
  signInWithGoogle: () => Promise<any>;
  signInGuest: () => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const session = supabase.auth.session?.() || supabase.auth.getSession?.();
    setSession(session);
    setUser(session?.user ?? null);
    const { data: listener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    return () => { listener?.unsubscribe?.(); };
  }, []);

  const signInWithGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google' });
  const signInGuest = async () => {
    const email = `${uuid()}@guest.lexi`;
    const password = uuid();
    return supabase.auth.signUp({ email, password });
  };
  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, session, signInWithGoogle, signInGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useUser must be used within an AuthProvider');
  return context;
} 