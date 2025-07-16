import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NameEntryPage() {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'center' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>What’s your name? <span role="img" aria-label="wave">👋</span></h1>
      <div style={{ color: '#757575', marginBottom: 24, fontSize: 16 }}>Let’s get to know you!</div>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Enter your name"
        style={{
          fontSize: 20,
          padding: '12px 16px',
          borderRadius: 10,
          border: '1.5px solid #b9aaff',
          marginBottom: 32,
          width: '100%',
          outline: 'none',
          fontFamily: 'Albert Sans, sans-serif',
        }}
        autoFocus
      />
      <button
        onClick={() => navigate('/onboard/language', { state: { name } })}
        disabled={!name.trim()}
        style={{
          background: '#7A54FF',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          padding: '14px 0',
          width: '100%',
          fontSize: 20,
          fontWeight: 700,
          cursor: name.trim() ? 'pointer' : 'not-allowed',
          opacity: name.trim() ? 1 : 0.5,
          transition: 'opacity 0.2s',
          marginBottom: 12,
        }}
      >Next</button>
      <div style={{ color: '#7A54FF', fontWeight: 500, marginTop: 8, fontSize: 15 }}>Let’s do this! 🎉</div>
    </div>
  );
} 