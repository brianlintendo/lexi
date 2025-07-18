import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useAuth';
import { useProfile } from '../components/JournalContext';
import logo from '../assets/icons/lexi-logo.svg';
import googleIcon from '../assets/icons/google.svg';

export default function SplashPage() {
  const navigate = useNavigate();
  const { signInWithGoogle, user } = useUser();
  const { profile, profileLoading } = useProfile();

  // Check if user is already signed in and has completed onboarding
  useEffect(() => {
    if (!profileLoading && user) {
      if (profile && profile.name && profile.language && profile.proficiency && profile.motivation) {
        // User has completed onboarding, redirect to journal
        navigate('/journal', { replace: true });
      } else if (user && !profile) {
        // User is signed in but hasn't completed onboarding, redirect to onboarding
        navigate('/onboard/name', { replace: true });
      }
    }
  }, [user, profile, profileLoading, navigate]);

  const handleGoogle = async () => {
    await signInWithGoogle();
    // Don't navigate here - let the useEffect handle the redirect based on profile status
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-onboard-gradient)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Albert Sans, sans-serif',
        width: '100%',
        maxWidth: 550,
        margin: '0 auto',
        padding: 0,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
        <img src={logo} alt="Lexi Logo" style={{ width: 200, height: 200, marginBottom: 20 }} />
        <span style={{ fontSize: 24, fontWeight: 700, color: '#181818', marginBottom: 8, lineHeight: 1.2 }}>Write to fluency.</span>
        <span style={{ fontSize: 18, fontWeight: 500, color: '#6B6B6B', marginBottom: 0, textAlign: 'center', lineHeight: 1.4 }}>
          Your friendly journal–style<br />language coach.
        </span>
      </div>
      <button
        onClick={handleGoogle}
        style={{
          width: 'calc(100% - 40px)',
          maxWidth: 380,
          padding: '0',
          background: '#fff',
          color: '#181818',
          border: '1.5px solid #D6D6F2',
          borderRadius: 12,
          fontSize: 18,
          fontWeight: 600,
          fontFamily: 'Albert Sans, sans-serif',
          boxShadow: '0 2px 8px 0 rgba(122,84,255,0.08)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          height: 56,
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 20,
          marginRight: 20,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <img src={googleIcon} alt="Google" style={{ width: 30, height: 30 }} />
        Continue with Google
      </button>
    </div>
  );
} 