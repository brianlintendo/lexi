import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import bookSavedIcon from '../assets/icons/book-saved.svg';
import savedIcon from '../assets/icons/saved.svg';
import accountIcon from '../assets/icons/account.svg';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="tab-bar" style={{
      borderRadius: 999,
      boxShadow: '0 4px 24px 0 rgba(122,84,255,0.10)',
      background: '#fff',
      position: 'fixed',
      left: '50%',
      transform: 'translateX(-50%)',
      bottom: 24,
      zIndex: 99,
      maxWidth: 420,
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: 80,
      padding: '0 32px',
      minWidth: 320,
    }}>
      <button onClick={() => navigate('/journal')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <img src={bookSavedIcon} alt="Journal" style={{ width: 28, height: 28, opacity: location.pathname === '/journal' ? 1 : 0.6 }} />
        <span style={{ 
          fontSize: 12, 
          fontWeight: location.pathname === '/journal' ? 600 : 400,
          color: location.pathname === '/journal' ? '#181818' : '#6B6B6B',
          fontFamily: 'Albert Sans, sans-serif'
        }}>
          Journal
        </span>
      </button>
      <button onClick={() => navigate('/saved')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <img src={savedIcon} alt="Saved Words" style={{ width: 28, height: 28, opacity: location.pathname === '/saved' ? 1 : 0.6 }} />
        <span style={{ 
          fontSize: 12, 
          fontWeight: location.pathname === '/saved' ? 600 : 400,
          color: location.pathname === '/saved' ? '#181818' : '#6B6B6B',
          fontFamily: 'Albert Sans, sans-serif'
        }}>
          Phrases
        </span>
      </button>
      <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <img src={accountIcon} alt="Account" style={{ width: 28, height: 28, opacity: location.pathname === '/settings' ? 1 : 0.6 }} />
        <span style={{ 
          fontSize: 12, 
          fontWeight: location.pathname === '/settings' ? 600 : 400,
          color: location.pathname === '/settings' ? '#181818' : '#6B6B6B',
          fontFamily: 'Albert Sans, sans-serif'
        }}>
          Account
        </span>
      </button>
    </div>
  );
} 