import React from 'react';
import BottomSheet from './BottomSheet';
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
  return (
    <BottomSheet
      isOpen={open}
      onClose={onClose}
      title="Change language"
      showCloseButton={false}
      maxWidth={420}
      padding="32px 0 24px 0"
    >
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => onSelect(lang.code)}
          style={{
            display: 'flex', 
            alignItems: 'center', 
            width: '90%', 
            margin: '0 auto 12px auto', 
            padding: '16px',
            borderRadius: 14, 
            border: 'none', 
            background: selected === lang.code ? '#f2f2f2' : '#fff',
            fontSize: 18, 
            fontWeight: 500, 
            color: '#212121', 
            cursor: 'pointer', 
            boxShadow: selected === lang.code ? '0 2px 8px rgba(122,84,255,0.08)' : 'none',
            outline: selected === lang.code ? '2px solid #bdaaff' : 'none',
            transition: 'background 0.2s, outline 0.2s',
          }}
          aria-label={lang.name}
        >
          <span 
            className={`fi fi-${lang.flag}`} 
            style={{ 
              fontSize: 28, 
              marginRight: 18, 
              borderRadius: 6, 
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)' 
            }} 
          />
          <span style={{ flex: 1, textAlign: 'left' }}>{lang.name}</span>
        </button>
      ))}
    </BottomSheet>
  );
} 