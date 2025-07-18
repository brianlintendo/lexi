import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OnboardingHeader from '../components/OnboardingHeader';
import PrimaryLargeButton from '../components/PrimaryLargeButton';
import { useProfile } from '../components/JournalContext';
import { useUser } from '../hooks/useAuth';

const MOTIVATIONS = [
  {
    key: 'work',
    emoji: '💼',
    title: 'Work',
    desc: lang => `I want to work in ${lang}-speaking countries`,
  },
  {
    key: 'travel',
    emoji: '✈️',
    title: 'Travel',
    desc: lang => `I want to explore ${lang}-speaking regions`,
  },
  {
    key: 'culture',
    emoji: '🎬',
    title: 'Culture',
    desc: lang => `I want to enjoy ${lang} movies, music & books`,
  },
  {
    key: 'connections',
    emoji: '💬',
    title: 'Connections',
    desc: lang => `I want to chat with family, friends & colleagues`,
  },
  {
    key: 'career',
    emoji: '📈',
    title: 'Career Growth',
    desc: lang => `I want to boost my resume and open new job opportunities`,
  },
  {
    key: 'personal',
    emoji: '🌱',
    title: 'Personal Growth',
    desc: lang => `I want to challenge myself and build confidence`,
  },
];

export default function OnboardMotivationPage() {
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { saveProfile } = useProfile();
  const { user } = useUser();
  const language = state?.language || 'the language';
  const name = state?.name || '';
  const proficiency = state?.proficiency || '';

  const handleComplete = async () => {
    if (!selected || !user?.id) return;
    
    setSaving(true);
    try {
      // Save all onboarding data to the database
      await saveProfile({
        name,
        language,
        proficiency,
        motivation: selected
      });
      
      // Navigate to journal page
      navigate('/journal');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-onboard-gradient)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'Albert Sans, sans-serif',
      width: '100%',
      maxWidth: 550,
      margin: '0 auto',
      padding: 0,
    }}>
      <OnboardingHeader currentStep={4} totalSteps={4} onBack={() => navigate(-1)} />
      <div style={{ width: '100%', padding: '0 24px', maxWidth: 500 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#181818', margin: 0, textAlign: 'left', lineHeight: 1.2, marginBottom: 16 }}>
          What's your main motivation to learn {language}?
        </h1>
        <div style={{ color: '#757575', marginBottom: 32, fontSize: 16, fontWeight: 500 }}>
          Learners with clear motivation are more likely to stay on track
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 32 }}>
          {MOTIVATIONS.map(motivation => (
            <button
              key={motivation.key}
              onClick={() => setSelected(motivation.key)}
              style={{
                width: '100%',
                padding: '22px 0 22px 0',
                borderRadius: 18,
                border: selected === motivation.key ? '2.5px solid #2D7FF9' : '1.5px solid #E0E0E0',
                background: selected === motivation.key ? '#F4F8FF' : '#fff',
                color: '#212121',
                fontSize: 18,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 18,
                transition: 'border 0.2s, background 0.2s',
                boxShadow: selected === motivation.key ? '0 2px 8px #2D7FF922' : 'none',
                outline: 'none',
                fontFamily: 'Albert Sans, sans-serif',
                paddingLeft: 24,
                position: 'relative',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 28, marginRight: 16, marginTop: 2 }}>{motivation.emoji}</span>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 700, fontSize: 18, marginBottom: 2 }}>{motivation.title}</span>
                <span style={{ fontWeight: 400, fontSize: 16, color: '#222', opacity: 0.95 }}>{motivation.desc(language)}</span>
              </span>
              {selected === motivation.key && (
                <span style={{ position: 'absolute', right: 24, top: 24, color: '#2D7FF9', fontSize: 22, fontWeight: 700 }}>✔️</span>
              )}
            </button>
          ))}
        </div>
        <PrimaryLargeButton
          onClick={handleComplete}
          disabled={!selected || saving}
          style={{ marginTop: 8 }}
        >
          {saving ? 'Saving...' : 'Continue'}
        </PrimaryLargeButton>
      </div>
    </div>
  );
} 