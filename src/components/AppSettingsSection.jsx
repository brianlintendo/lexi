import React from 'react';

const AppSettingsSection = () => {
  const handleClearConversation = () => {
    if (window.confirm('Are you sure you want to clear all conversations?')) {
      localStorage.removeItem('lexi-chat-messages');
      alert('Conversation cleared!');
    }
  };

  return (
    <div className="app-settings-section">
      <h3 className="section-title">App Settings</h3>
      
      <div className="setting-row">
        <span className="setting-label">Version</span>
        <span className="setting-value">1.0.0</span>
      </div>

      <div className="setting-row">
        <span className="setting-label">Clear Conversation</span>
        <button onClick={handleClearConversation} className="clear-btn">
          Clear
        </button>
      </div>
    </div>
  );
};

export default AppSettingsSection; 