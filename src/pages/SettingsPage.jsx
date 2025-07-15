import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useAuth';

function SettingsPage() {
  const navigate = useNavigate();
  const { user, signInWithGoogle, signInGuest, signOut } = useUser();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSignIn = async (method) => {
    try {
      if (method === 'google') {
        await signInWithGoogle();
      } else if (method === 'guest') {
        await signInGuest();
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      alert('Signed out successfully!');
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="header">
        <span className="header-icon" onClick={() => navigate('/')}>←</span>
        <span className="header-title">Settings</span>
        <span></span>
      </div>
      
      <div style={{ flex: 1, padding: 'var(--spacing-xl)' }}>
        {/* Authentication Section */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h3 style={{ 
            margin: '0 0 var(--spacing-md) 0', 
            color: 'var(--color-primary)',
            fontSize: 'var(--font-size-h3)'
          }}>
            Account
          </h3>
          
          {user ? (
            <div style={{ 
              padding: 'var(--spacing-md)', 
              backgroundColor: 'var(--color-bubble-ai)', 
              borderRadius: 'var(--border-radius-md)',
              marginBottom: 'var(--spacing-md)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="body-text" style={{ fontWeight: 'bold' }}>
                    {user.email || 'Guest User'}
                  </div>
                  <div className="caption" style={{ color: 'var(--color-text-secondary)' }}>
                    {user.email ? 'Signed in' : 'Guest account'}
                  </div>
                </div>
                <button 
                  className="btn"
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'var(--color-secondary)',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    fontSize: 'var(--font-size-caption)'
                  }}
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div style={{ 
              padding: 'var(--spacing-md)', 
              backgroundColor: 'var(--color-bubble-ai)', 
              borderRadius: 'var(--border-radius-md)',
              marginBottom: 'var(--spacing-md)'
            }}>
              <div className="body-text" style={{ marginBottom: 'var(--spacing-md)' }}>
                Sign in to sync your saved phrases across devices
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                <button 
                  className="btn"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-secondary)',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    fontSize: 'var(--font-size-caption)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)'
                  }}
                  onClick={() => handleSignIn('google')}
                >
                  <span>🔑</span>
                  Sign in with Google
                </button>
                <button 
                  className="btn"
                  style={{
                    backgroundColor: 'var(--color-bubble-user)',
                    color: 'var(--color-text-primary)',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    fontSize: 'var(--font-size-caption)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)'
                  }}
                  onClick={() => handleSignIn('guest')}
                >
                  <span>👤</span>
                  Continue as Guest
                </button>
              </div>
            </div>
          )}
        </div>

        {/* App Settings Section */}
        <h3 style={{ 
          margin: '0 0 var(--spacing-md) 0', 
          color: 'var(--color-primary)',
          fontSize: 'var(--font-size-h3)'
        }}>
          App Settings
        </h3>
        
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