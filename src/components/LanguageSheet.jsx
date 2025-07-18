import React, { useEffect, useState } from 'react';
import BottomSheet from './BottomSheet';
import { supabase } from '../supabaseClient';

export default function LanguageSheet({ open, onClose, selected, onSelect }) {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  return (
    <BottomSheet
      isOpen={open}
      onClose={onClose}
      title={<span style={{ paddingLeft: 24, display: 'block' }}>Change language</span>}
      showCloseButton={false}
      maxWidth={420}
      padding="32px 0 24px 0"
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24, color: '#888' }}>Loading languages...</div>
      ) : (
        languages.map(lang => (
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
            aria-label={lang.label}
          >
            <span style={{ fontSize: 28, marginRight: 18, borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>{lang.emoji}</span>
            <span style={{ flex: 1, textAlign: 'left' }}>{lang.label}</span>
          </button>
        ))
      )}
    </BottomSheet>
  );
} 