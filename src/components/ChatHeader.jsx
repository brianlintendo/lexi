import React from 'react';
import { useNavigate } from 'react-router-dom';
import arrowLeftIcon from '../assets/icons/arrow-left.svg';

export default function ChatHeader({ wordCount = 0, wordLimit = 200, onBack }) {
  const navigate = useNavigate();
  const percent = Math.min(100, (wordCount / wordLimit) * 100);
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #eee', position: 'relative', paddingBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0.5rem 0.5rem 0.5rem' }}>
        <button
          aria-label="Back"
          onClick={onBack || (() => navigate('/journal'))}
          style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#7A54FF', padding: 0, display: 'flex', alignItems: 'center' }}
        >
          <img src={arrowLeftIcon} alt="Back" style={{ width: 28, height: 28 }} />
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontFamily: 'Albert Sans, sans-serif', fontWeight: 700, fontSize: 18, color: '#212121' }}>
          Lexi Chat
        </div>
        <div style={{ width: 32 }} /> {/* Spacer for symmetry */}
      </div>
      <div style={{ padding: '0 1.5rem', marginTop: 4 }}>
        <div style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 2, textAlign: 'right' }}>{wordCount} / {wordLimit} words</div>
        <div style={{ width: '100%', height: 6, background: '#F4F4F6', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #7A54FF 0%, #00C853 100%)', borderRadius: 4, transition: 'width 0.2s' }} />
        </div>
      </div>
    </div>
  );
} 