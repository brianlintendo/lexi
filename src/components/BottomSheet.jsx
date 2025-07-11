import React from 'react';

export default function BottomSheet({ children }) {
  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        background: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        boxShadow: '0 -4px 32px 0 rgba(122,84,255,0.10)',
        padding: '24px 24px 20px 24px',
        margin: '0 auto',
        maxWidth: 480,
        minWidth: 320,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  );
} 