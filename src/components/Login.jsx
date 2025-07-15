import React from 'react';
import { useUser } from '../hooks/useAuth';

export default function Login() {
  const { signInWithGoogle, signInGuest } = useUser();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 24 }}>
      <h2>Sign in to Lexi</h2>
      <button style={{ padding: '12px 24px', fontSize: 18, borderRadius: 8, border: 'none', background: '#4285F4', color: '#fff', marginBottom: 16, cursor: 'pointer' }} onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <button style={{ padding: '12px 24px', fontSize: 18, borderRadius: 8, border: 'none', background: '#eee', color: '#333', cursor: 'pointer' }} onClick={signInGuest}>
        Continue as Guest
      </button>
    </div>
  );
} 