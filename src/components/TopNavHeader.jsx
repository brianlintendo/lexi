import React from 'react';
import arrowLeft from '../assets/icons/arrow-left.svg';

export default function TopNavHeader({ title, onBack, rightContent }) {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: 0, position: 'sticky', top: 0, zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', height: 56, padding: '0 24px' }}>
        <button
          aria-label="Back"
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginRight: 8, display: 'flex', alignItems: 'center', height: 40 }}
        >
          <img src={arrowLeft} alt="Back" style={{ width: 24, height: 24, display: 'block' }} />
        </button>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: 0.1, color: '#18181B', lineHeight: '24px' }}>{title}</h1>
        <div style={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          {rightContent}
        </div>
      </div>
    </div>
  );
} 