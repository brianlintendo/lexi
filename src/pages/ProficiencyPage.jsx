import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const LEVELS = [
  'New',
  'Basics',
  'Intermediate',
  'Upper Intermediate',
  'Advanced',
];

export default function ProficiencyPage() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const name = state?.name || '';
  const language = state?.language || '';
  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'center' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16 }}>What’s your current level in {language}? <span role="img" aria-label="level">🏅</span></h1>
      <div style={{ color: '#757575', marginBottom: 24, fontSize: 16 }}>Choose your starting point.</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        {LEVELS.map(level => (
          <button
            key={level}
            onClick={() => setSelected(level)}
            style={{
              padding: '12px 18px',
              borderRadius: 20,
              border: selected === level ? '2.5px solid #7A54FF' : '1.5px solid #b9aaff',
              background: selected === level ? '#f6f3ff' : '#fff',
              color: '#333',
              fontSize: 17,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 8,
              boxShadow: selected === level ? '0 2px 8px #7A54FF22' : 'none',
              outline: 'none',
              fontFamily: 'Albert Sans, sans-serif',
              transition: 'border 0.2s, background 0.2s',
            }}
          >
            {level}
          </button>
        ))}
      </div>
      <button
        onClick={() => navigate('/journal', { state: { name, language, proficiency: selected } })}
        disabled={!selected}
        style={{
          background: '#7A54FF',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          padding: '14px 0',
          width: '100%',
          fontSize: 20,
          fontWeight: 700,
          cursor: selected ? 'pointer' : 'not-allowed',
          opacity: selected ? 1 : 0.5,
          transition: 'opacity 0.2s',
          marginBottom: 12,
        }}
      >Next</button>
      <div style={{ color: '#7A54FF', fontWeight: 500, marginTop: 8, fontSize: 15 }}>🎉 Ready to start your journey?</div>
    </div>
  );
} 