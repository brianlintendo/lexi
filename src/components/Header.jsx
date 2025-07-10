import React from 'react';

function Header() {
  return (
    <header style={{
      textAlign: 'center',
      padding: '2rem 0',
      borderBottom: '2px solid #e0e0e0',
      marginBottom: '2rem'
    }}>
      <h1 style={{
        margin: 0,
        color: '#333',
        fontSize: '2.5rem',
        fontWeight: 'bold'
      }}>
        Lexi Language Journal
      </h1>
      <p style={{
        margin: '0.5rem 0 0 0',
        color: '#666',
        fontSize: '1.1rem'
      }}>
        Your AI language learning companion
      </p>
    </header>
  );
}

export default Header; 