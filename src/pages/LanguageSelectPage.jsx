import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomSheet from '../components/BottomSheet';

const LANGUAGES = [
  { code: 'es', label: 'Spanish', emoji: '🇪🇸' },
  { code: 'fr', label: 'French', emoji: '🇫🇷' },
  { code: 'zh', label: 'Chinese', emoji: '🇨🇳' },
  { code: 'pt', label: 'Portuguese', emoji: '🇵🇹' },
  { code: 'ja', label: 'Japanese', emoji: '🇯🇵' },
  { code: 'ko', label: 'Korean', emoji: '🇰🇷' },
];

export default function LanguageSelectPage() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const name = state?.name || '';
  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <BottomSheet
        isOpen={true}
        onClose={() => {}}
        showCloseButton={false}
        title={null}
        maxWidth={420}
        minWidth={320}
        padding="32px 24px 24px 24px"
        style={{ background: '#fff' }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16 }}>Which language would you like to learn? <span role="img" aria-label="books">📚</span></h1>
        <div style={{ color: '#757575', marginBottom: 24, fontSize: 16 }}>Pick a language to get started.</div>
        <div style={{ width: '100%', marginBottom: 32 }}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang)}
              style={{
                width: '100%',
                padding: '14px 0',
                marginBottom: 12,
                borderRadius: 10,
                border: selected?.code === lang.code ? '2.5px solid #7A54FF' : '1.5px solid #b9aaff',
                background: selected?.code === lang.code ? '#f6f3ff' : '#fff',
                color: '#333',
                fontSize: 20,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                transition: 'border 0.2s, background 0.2s',
                boxShadow: selected?.code === lang.code ? '0 2px 8px #7A54FF22' : 'none',
                outline: 'none',
                fontFamily: 'Albert Sans, sans-serif',
              }}
            >
              <span style={{ fontSize: 26 }}>{lang.emoji}</span> {lang.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate('/onboard/proficiency', { state: { name, language: selected?.label } })}
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
        <div style={{ color: '#7A54FF', fontWeight: 500, marginTop: 8, fontSize: 15 }}>👍 You’re on your way!</div>
      </BottomSheet>
    </div>
  );
} 