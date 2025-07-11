import React from 'react';

export default function ChatBubble({ sender, text, loading }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
        <div style={{
          background: sender === 'user' ? '#7A54FF' : '#fff',
          color: sender === 'user' ? '#fff' : '#7A54FF',
          border: sender === 'ai' ? '2px solid' : 'none',
          borderImage: sender === 'ai' ? 'linear-gradient(90deg, #7A54FF, #00C853) 1' : 'none',
          borderRadius: 20,
          padding: '12px 20px',
          maxWidth: '75%',
          fontSize: 16,
          opacity: 0.7
        }}>
          Lexi is typing...
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', justifyContent: sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
      <div style={{
        background: sender === 'user' ? '#7A54FF' : '#fff',
        color: sender === 'user' ? '#fff' : '#7A54FF',
        border: sender === 'ai' ? '2px solid' : 'none',
        borderImage: sender === 'ai' ? 'linear-gradient(90deg, #7A54FF, #00C853) 1' : 'none',
        borderRadius: 20,
        padding: '12px 20px',
        maxWidth: '75%',
        fontSize: 16,
        fontWeight: sender === 'ai' ? 500 : 400,
        boxShadow: sender === 'ai' ? '0 2px 8px rgba(122,84,255,0.08)' : 'none',
        position: 'relative',
        wordBreak: 'break-word',
      }}>
        {text}
      </div>
    </div>
  );
} 