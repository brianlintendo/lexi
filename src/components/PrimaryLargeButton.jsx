import React from 'react';

export default function PrimaryLargeButton({ children, onClick, disabled, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: '#7A54FF',
        color: '#fff',
        border: 'none',
        borderRadius: 12,
        padding: '18px 0',
        width: '100%',
        fontSize: 18,
        fontWeight: 700,
        fontFamily: 'Albert Sans, sans-serif',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.2s',
        boxShadow: '0 2px 8px #7A54FF22',
        marginBottom: 32,
        ...style,
      }}
    >
      {children}
    </button>
  );
} 