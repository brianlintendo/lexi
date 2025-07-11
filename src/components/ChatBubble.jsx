import React from 'react';

export default function ChatBubble({ sender, text, loading }) {
  const fontFamily = sender === 'ai' ? 'Noto Serif, serif' : 'Albert Sans, sans-serif';
  if (loading) {
    if (sender === 'ai') {
      return (
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 20 }}>
          <div style={{
            background: 'linear-gradient(90deg, #7A54FF, #00C853)',
            borderRadius: 24,
            padding: 2,
            display: 'inline-block',
            boxShadow: '0 2px 12px 0 rgba(122,84,255,0.08)'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 22,
              padding: '18px 24px',
              minWidth: 60,
              maxWidth: 340,
              fontFamily,
              fontSize: 17,
              lineHeight: 1.7,
              color: '#7A54FF',
              fontWeight: 500,
              boxShadow: '0 2px 12px 0 rgba(122,84,255,0.08)'
            }}>
              Lexi is typing...
            </div>
          </div>
        </div>
      );
    }
    // user loading (shouldn't happen)
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <div style={{
          background: '#7A54FF',
          color: '#fff',
          borderRadius: 20,
          padding: '12px 20px',
          maxWidth: '75%',
          fontSize: 16,
          fontFamily
        }}>
          ...
        </div>
      </div>
    );
  }
  if (sender === 'ai') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 20 }}>
        <div style={{
          background: 'linear-gradient(90deg, #7A54FF, #00C853)',
          borderRadius: 24,
          padding: 2,
          display: 'inline-block',
          boxShadow: '0 2px 12px 0 rgba(122,84,255,0.08)'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 22,
            padding: '18px 24px',
            minWidth: 60,
            maxWidth: 340,
            fontFamily,
            fontSize: 17,
            lineHeight: 1.7,
            color: '#7A54FF',
            fontWeight: 500,
            boxShadow: '0 2px 12px 0 rgba(122,84,255,0.08)'
          }}>
            {text}
          </div>
        </div>
      </div>
    );
  }
  // user bubble
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
      <div style={{
        background: '#7A54FF',
        color: '#fff',
        borderRadius: 20,
        padding: '12px 20px',
        maxWidth: '75%',
        fontSize: 16,
        fontFamily
      }}>
        {text}
      </div>
    </div>
  );
} 