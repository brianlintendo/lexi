import React from 'react';
import { useNavigate } from 'react-router-dom';
import arrowLeftIcon from '../assets/icons/arrow-left.svg';
import bookIcon from '../assets/icons/book.svg';
import themesIcon from '../assets/icons/themes.svg';

export default function ChatHeader({ wordCount = 0, wordLimit = 200, onBack, onThemesClick }) {
  const navigate = useNavigate();
  const percent = Math.min(100, (wordCount / wordLimit) * 100);
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #eee', position: 'relative', paddingBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem 0.5rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            aria-label="Back"
            onClick={onBack || (() => navigate('/journal'))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
          >
            <img src={arrowLeftIcon} alt="Back" style={{ width: 28, height: 28 }} />
          </button>
          <span style={{ fontSize: 14, color: '#757575', fontWeight: 500, fontFamily: 'Albert Sans, sans-serif', letterSpacing: 0.2 }}>{wordCount} words / {wordLimit} words</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button aria-label="Book" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <img src={bookIcon} alt="Book" style={{ width: 28, height: 28 }} />
          </button>
          <button aria-label="Themes" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={onThemesClick}>
            <img src={themesIcon} alt="Themes" style={{ width: 28, height: 28 }} />
          </button>
        </div>
      </div>
      <div style={{ padding: '0 2rem', marginTop: 12 }}>
        <div style={{ width: '100%', height: 16, background: '#F4F4F6', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ width: `${percent}%`, height: '100%', background: '#7A54FF', borderRadius: 8, transition: 'width 0.2s' }} />
        </div>
      </div>
    </div>
  );
} 