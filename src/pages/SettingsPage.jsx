import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SettingsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="container">
      <div className="header">
        <span className="header-icon" onClick={() => navigate('/')}>←</span>
        <span className="header-title">Settings</span>
        <span></span>
      </div>
      
      <div style={{ flex: 1, padding: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-md) 0', borderBottom: '1px solid var(--color-bubble-ai)' }}>
          <span className="body-text">Notifications</span>
          <div 
            style={{
              width: '50px',
              height: '30px',
              backgroundColor: notifications ? 'var(--color-primary)' : 'var(--color-bubble-ai)',
              borderRadius: '15px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background-color var(--transition-normal)'
            }}
            onClick={() => setNotifications(!notifications)}
          >
            <div style={{
              width: '26px',
              height: '26px',
              backgroundColor: 'var(--color-secondary)',
              borderRadius: '50%',
              position: 'absolute',
              top: '2px',
              left: notifications ? '22px' : '2px',
              transition: 'transform var(--transition-normal)'
            }}></div>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-md) 0', borderBottom: '1px solid var(--color-bubble-ai)' }}>
          <span className="body-text">Dark Mode</span>
          <div 
            style={{
              width: '50px',
              height: '30px',
              backgroundColor: darkMode ? 'var(--color-primary)' : 'var(--color-bubble-ai)',
              borderRadius: '15px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background-color var(--transition-normal)'
            }}
            onClick={() => setDarkMode(!darkMode)}
          >
            <div style={{
              width: '26px',
              height: '26px',
              backgroundColor: 'var(--color-secondary)',
              borderRadius: '50%',
              position: 'absolute',
              top: '2px',
              left: darkMode ? '22px' : '2px',
              transition: 'transform var(--transition-normal)'
            }}></div>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-md) 0', borderBottom: '1px solid var(--color-bubble-ai)' }}>
          <span className="body-text">Language</span>
          <span className="caption">English</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-md) 0', borderBottom: '1px solid var(--color-bubble-ai)' }}>
          <span className="body-text">Version</span>
          <span className="caption">1.0.0</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-md) 0', borderBottom: '1px solid var(--color-bubble-ai)' }}>
          <span className="body-text">Clear Conversation</span>
          <button 
            className="btn"
            style={{
              backgroundColor: '#dc3545',
              color: 'var(--color-secondary)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              fontSize: 'var(--font-size-caption)'
            }}
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all conversations?')) {
                localStorage.removeItem('lexi-messages');
                alert('Conversation cleared!');
              }
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage; 