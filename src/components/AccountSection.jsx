import React from 'react';
import { useUser } from '../hooks/useAuth';

const AccountSection = () => {
  const { user, signInWithGoogle, signOut } = useUser();

  return (
    <div className="account-section">
      <h3 className="section-title">Account</h3>
      {user ? (
        <div className="account-info">
          <div className="user-email">{user.email || 'Guest User'}</div>
          <div className="user-status">{user.email ? 'Signed in' : 'Guest account'}</div>
          <button onClick={signOut} className="sign-out-btn">
            Sign Out
          </button>
        </div>
      ) : (
        <div className="sign-in-options">
          <div className="sign-in-description">
            Sign in to sync your data across devices
          </div>
          <div className="sign-in-buttons">
            <button onClick={signInWithGoogle} className="google-sign-in-btn">
              <span className="google-icon">G</span>
              Sign in with Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSection; 