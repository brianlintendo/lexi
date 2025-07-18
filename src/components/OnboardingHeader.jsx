import React from 'react';
import arrowLeft from '../assets/icons/arrow-left.svg';

export default function OnboardingHeader({ currentStep, totalSteps, onBack }) {
  const percent = Math.max(0, Math.min(100, ((currentStep - 1) / (totalSteps - 1)) * 100));
  return (
    <div style={{ width: '100%', padding: '32px 0 0 0', marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 16, marginBottom: 24 }}>
        <button
          aria-label="Back"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            width: 40,
            height: 40,
          }}
        >
          <img src={arrowLeft} alt="Back" style={{ width: 28, height: 28 }} />
        </button>
      </div>
      <div style={{ width: '100%', padding: '0 24px' }}>
        <div style={{ width: '100%', height: 14, background: '#ECECF1', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ width: `${percent}%`, height: '100%', background: '#7A54FF', borderRadius: 8, transition: 'width 0.2s' }} />
        </div>
      </div>
    </div>
  );
} 