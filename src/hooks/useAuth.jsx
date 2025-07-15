import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { v4 as uuid } from 'uuid';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const session = supabase.auth.session?.() || supabase.auth.getSession?.();
    setSession(session);
    setUser(session?.user ?? null);
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    return () => { listener?.unsubscribe?.(); };
  }, []);

  const signInWithGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google' });
  const signInGuest = async () => {
    const email = `${uuid()}@guest.lexi`;
    const password = uuid(); // Generate a random password for guest
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
  return useContext(AuthContext);
} 