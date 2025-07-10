import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="text-center" style={{ padding: 'var(--spacing-xxl)', marginBottom: 'var(--spacing-xxl)' }}>
        <h1 className="heading-1" style={{ marginBottom: 'var(--spacing-sm)' }}>
          Lexi Language Journal
        </h1>
        <p className="caption">
          Your AI language learning companion
        </p>
      </div>
      
      <div style={{ padding: '0 var(--spacing-xl)' }}>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/journal')}
          style={{ width: '100%', marginBottom: 'var(--spacing-lg)' }}
        >
          Start Journaling
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/settings')}
          style={{ width: '100%' }}
        >
          Settings
        </button>
      </div>
    </div>
  );
}

export default HomePage; 