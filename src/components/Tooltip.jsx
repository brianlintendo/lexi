import React from 'react';

export default function Tooltip({ message, type = "info" }) {
  const getBackgroundColor = () => {
    switch (type) {
      case "warning":
        return '#fff3cd';
      case "error":
        return '#f8d7da';
      case "success":
        return '#d4edda';
      default:
        return '#f5f5f5';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "warning":
        return '#856404';
      case "error":
        return '#721c24';
      case "success":
        return '#155724';
      default:
        return '#6B6B6B';
    }
  };

  return (
    <div style={{
      background: getBackgroundColor(),
      padding: '12px 16px',
      textAlign: 'center',
      fontSize: '14px',
      color: getTextColor(),
      fontFamily: 'Albert Sans, sans-serif',
      fontWeight: '500'
    }}>
      {message}
    </div>
  );
} 