import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OnboardingHeader from '../components/OnboardingHeader';
import PrimaryLargeButton from '../components/PrimaryLargeButton';

const LEVELS = [
  {
    key: 'A1',
    title: 'A1 (Beginner)',
    desc: 'You know a few basic phrases and can introduce yourself.'
  },
  {
    key: 'A2',
    title: 'A2 (Elementary)',
    desc: 'You can handle simple everyday tasks and ask/answer basic questions.'
  },
  {
    key: 'B1',
    title: 'B1 (Intermediate)',
    desc: 'You can discuss familiar topics and understand straightforward texts.'
  },
  {
    key: 'B2',
    title: 'B2 (Upper-Intermediate)',
    desc: 'You can hold conversations on a wide range of subjects and read longer articles.'
  },
  {
    key: 'C1',
    title: 'C1 (Advanced)',
    desc: 'You can express ideas fluently, understand implicit meaning, and write clear, detailed texts.'
  },
];

export default function ProficiencyPage() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const name = state?.name || '';
  const language = state?.language || '';

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
      <OnboardingHeader currentStep={3} totalSteps={4} onBack={() => navigate(-1)} />
      <div style={{ width: '100%', padding: '0 24px', maxWidth: 500 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#181818', margin: 0, textAlign: 'left', lineHeight: 1.2, marginBottom: 16 }}>
          What’s your current level in {language}?
        </h1>
        <div style={{ color: '#757575', marginBottom: 32, fontSize: 16, fontWeight: 500 }}>
          Choose the option that best describes your skills
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 32 }}>
          {LEVELS.map(level => (
            <button
              key={level.key}
              onClick={() => setSelected(level.key)}
              style={{
                width: '100%',
                padding: '22px 0 22px 0',
                borderRadius: 18,
                border: selected === level.key ? '2.5px solid #2D7FF9' : '1.5px solid #E0E0E0',
                background: selected === level.key ? '#F4F8FF' : '#fff',
                color: '#212121',
                fontSize: 18,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 18,
                transition: 'border 0.2s, background 0.2s',
                boxShadow: selected === level.key ? '0 2px 8px #2D7FF922' : 'none',
                outline: 'none',
                fontFamily: 'Albert Sans, sans-serif',
                paddingLeft: 24,
                position: 'relative',
                textAlign: 'left',
              }}
            >
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 700, fontSize: 18, marginBottom: 2 }}>{level.title}</span>
                <span style={{ fontWeight: 400, fontSize: 16, color: '#222', opacity: 0.95 }}>{level.desc}</span>
              </span>
              {selected === level.key && (
                <span style={{ position: 'absolute', right: 24, top: 24, color: '#2D7FF9', fontSize: 22, fontWeight: 700 }}>✔️</span>
              )}
            </button>
          ))}
        </div>
        <PrimaryLargeButton
          onClick={() => navigate('/onboard/motivation', { state: { name, language, proficiency: selected } })}
          disabled={!selected}
        >Continue</PrimaryLargeButton>
      </div>
    </div>
  );
} 