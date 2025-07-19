import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OnboardingHeader from '../components/OnboardingHeader';
import PrimaryLargeButton from '../components/PrimaryLargeButton';
import { supabase } from '../supabaseClient';

export default function LanguageSelectPage() {
  const [selected, setSelected] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { state } = useLocation();
  const name = state?.name || '';

  useEffect(() => {
    setLoading(true);
    supabase
      .from('languages')
      .select('code, label, emoji, enabled')
      .eq('enabled', true)
      .order('label', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setLanguages(data);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-onboard-gradient)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      fontFamily: 'Albert Sans, sans-serif',
      padding: 0,
      margin: 0,
      width: '100%',
      maxWidth: 550,
      marginLeft: 'auto',
      marginRight: 'auto',
    }}>
      <OnboardingHeader currentStep={2} totalSteps={4} onBack={() => navigate(-1)} />
      <div style={{ width: '100%', padding: '0 24px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16, color: '#212121', lineHeight: 1.2 }}>
          What language do you want to learn?
        </h1>
      </div>
      {/* Language buttons */}
      <div style={{ width: '100%', padding: '0 16px', marginTop: 8, marginBottom: 24 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#888' }}>Loading languages...</div>
        ) : (
          languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang)}
              style={{
                width: '100%',
                padding: '18px 0',
                marginBottom: 18,
                borderRadius: 16,
                border: selected?.code === lang.code ? '2.5px solid #2D7FF9' : '1.5px solid #E0E0E0',
                background: selected?.code === lang.code ? '#F4F8FF' : '#fff',
                color: '#212121',
                fontSize: 20,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 16,
                transition: 'border 0.2s, background 0.2s',
                boxShadow: selected?.code === lang.code ? '0 2px 8px #2D7FF922' : 'none',
                outline: 'none',
                fontFamily: 'Albert Sans, sans-serif',
                paddingLeft: 24,
              }}
            >
              <span style={{ fontSize: 26, marginRight: 16 }}>{lang.emoji}</span> {lang.label}
            </button>
          ))
        )}
      </div>
      {/* Spacer to push button to bottom */}
      <div style={{ flex: 1 }} />
      {/* Continue button */}
      <div style={{ width: '100%', padding: '0 16px 32px 16px' }}>
        <PrimaryLargeButton
          onClick={() => navigate('/onboard/proficiency', { state: { name, language: selected?.code } })}
          disabled={!selected}
        >Continue</PrimaryLargeButton>
      </div>
    </div>
  );
} 