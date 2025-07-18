import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingHeader from '../components/OnboardingHeader';
import PrimaryLargeButton from '../components/PrimaryLargeButton';

export default function NameEntryPage() {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  return (
    <div style={{
      height: '100vh',
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
      <OnboardingHeader currentStep={1} totalSteps={4} onBack={() => navigate(-1)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <div style={{ width: '100%', padding: '0 24px', maxWidth: 400 }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#181818',
            margin: 0,
            textAlign: 'left',
            lineHeight: 1.2,
            marginBottom: 40,
          }}>
            What's your name?
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}>
            <span style={{ fontWeight: 700, fontSize: 20, color: '#181818', marginRight: 8, opacity: 0.5 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="7" r="3.5" stroke="#B0B0B0" strokeWidth="1.5"/><path d="M3.75 16.25C3.75 13.7647 6.23858 11.875 10 11.875C13.7614 11.875 16.25 13.7647 16.25 16.25" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Name"
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#181818',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                flex: 1,
                padding: '8px 0',
                fontFamily: 'Albert Sans, sans-serif',
                textAlign: 'left',
              }}
              autoFocus
            />
          </div>
          <div style={{
            borderBottom: '1.5px solid #B0B0B0',
            width: '100%',
            marginTop: 0,
            marginBottom: 32,
          }} />
          <PrimaryLargeButton
            onClick={() => navigate('/onboard/language', { state: { name } })}
            disabled={!name.trim()}
          >Continue</PrimaryLargeButton>
        </div>
      </div>
    </div>
  );
} 