import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { v4 as uuid } from 'uuid';
import { User, Session } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_OAUTH_CONFIG } from '../config/oauth';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signInWithGoogle: () => Promise<any>;
  signInGuest: () => Promise<any>;
  signOut: () => Promise<any>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Check if Google OAuth is properly configured
      if (GOOGLE_OAUTH_CONFIG.clientId === 'your-google-client-id.apps.googleusercontent.com') {
        console.log('Google OAuth not configured. Using guest mode instead.');
        // Fallback to guest sign-in if Google OAuth is not configured
        return await signInGuest();
      }

      // Use Supabase's built-in OAuth flow instead of custom implementation
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: GOOGLE_OAUTH_CONFIG.redirectUri,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      // Fallback to guest sign-in on error
      console.log('Falling back to guest sign-in due to Google OAuth error');
      return await signInGuest();
    }
  };

  const signInGuest = async () => {
    try {
      const email = `${uuid()}@guest.lexi`;
      const password = uuid(); // Generate a random password for guest
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            is_guest: true
          }
        }
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing in as guest:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      signInWithGoogle, 
      signInGuest, 
      signOut,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useUser() {
  const { user } = useAuth();
  return user;
} 