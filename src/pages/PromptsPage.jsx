import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavHeader from '../components/TopNavHeader';

const THEME_OPTIONS = [
  'Travel',
  'Family',
  'Language Learning',
  'Health & Mental',
  'What if...?',
  'Something crazy',
  'Technology & Gadgets',
  'Challenges & Goals',
];

export default function PromptsPage({ onSave }) {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #FAF4F4 0%, #E9E3F5 48.08%, #F5F1FD 100%)', display: 'flex', flexDirection: 'column' }}>
      <TopNavHeader title="Prompts" onBack={() => navigate(-1)} />
      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '32px 0 0 0' }}>
        <div style={{ width: '100%', maxWidth: 420, margin: '0 auto', background: 'none' }}>
          <div style={{ fontWeight: 600, fontSize: 16, color: '#18181B', marginBottom: 24, textAlign: 'left', paddingLeft: 8, letterSpacing: 0.1, marginLeft: 20, marginRight: 20 }}>
            Choose a theme to journal about
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {THEME_OPTIONS.map(theme => (
              <button
                key={theme}
                onClick={() => setSelectedTheme(theme)}
                style={{
                  padding: '18px 20px',
                  borderRadius: 12,
                  border: selectedTheme === theme ? '2px solid #7A54FF' : '1.5px solid #e0e0e0',
                  background: '#F6F6F6',
                  color: '#18181B',
                  fontWeight: 600,
                  fontSize: 16,
                  fontFamily: 'Albert Sans, sans-serif',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: selectedTheme === theme ? '0 2px 12px 0 rgba(122,84,255,0.10)' : 'none',
                  transition: 'border 0.2s, box-shadow 0.2s, background 0.2s',
                  marginBottom: 0,
                  borderColor: selectedTheme === theme ? '#7A54FF' : '#e0e0e0',
                  marginLeft: 20,
                  marginRight: 20,
                }}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => {
            if (selectedTheme) {
              if (onSave) onSave(selectedTheme);
              else navigate(-1);
            }
          }}
          disabled={!selectedTheme}
          style={{
            width: '90%',
            maxWidth: 420,
            height: 56,
            margin: '0 auto 24px auto',
            background: selectedTheme ? '#7A54FF' : '#ccc',
            color: '#fff',
            fontWeight: 700,
            fontSize: 20,
            fontFamily: 'Albert Sans, sans-serif',
            border: 'none',
            borderRadius: 16,
            padding: '0 20px',
            cursor: selectedTheme ? 'pointer' : 'not-allowed',
            boxShadow: selectedTheme ? '0 4px 24px rgba(122,84,255,0.10)' : 'none',
            transition: 'background 0.2s, box-shadow 0.2s',
            letterSpacing: 0.1,
            display: 'block',
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
} 