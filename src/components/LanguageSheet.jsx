import React from 'react';
import 'flag-icons/css/flag-icons.min.css';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: 'us' },
  { code: 'es', name: 'Spanish', flag: 'es' },
  { code: 'fr', name: 'French', flag: 'fr' },
  { code: 'zh', name: 'Chinese', flag: 'cn' },
  { code: 'pt', name: 'Portuguese', flag: 'br' },
  { code: 'it', name: 'Italian', flag: 'it' },
];

export default function LanguageSheet({ open, onClose, selected, onSelect }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.18)', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div style={{
        background: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        boxShadow: '0 -2px 16px rgba(122,84,255,0.08)',
        padding: '32px 0 24px 0',
        maxWidth: 420,
        margin: '0 auto',
        width: '100%',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight: 700, fontSize: 22, textAlign: 'center', marginBottom: 24 }}>Change language</div>
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            style={{
              display: 'flex', alignItems: 'center', width: '90%', margin: '0 auto 12px auto', padding: '16px',
              borderRadius: 14, border: 'none', background: selected === lang.code ? '#f2f2f2' : '#fff',
              fontSize: 18, fontWeight: 500, color: '#212121', cursor: 'pointer', boxShadow: selected === lang.code ? '0 2px 8px rgba(122,84,255,0.08)' : 'none',
              outline: selected === lang.code ? '2px solid #bdaaff' : 'none',
              transition: 'background 0.2s, outline 0.2s',
            }}
            aria-label={lang.name}
          >
            <span className={`fi fi-${lang.flag}`} style={{ fontSize: 28, marginRight: 18, borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }} />
            <span style={{ flex: 1, textAlign: 'left' }}>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 