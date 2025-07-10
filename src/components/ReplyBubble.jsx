import React from 'react';

function ReplyBubble({ reply, loading }) {
  if (!reply && !loading) return null;

  return (
    <div style={{
      marginTop: '2rem',
      padding: '1.5rem',
      backgroundColor: '#f8f9fa',
      border: '2px solid #e9ecef',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#007bff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '1rem',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}>
          L
        </div>
        <h3 style={{
          margin: 0,
          color: '#333',
          fontSize: '1.3rem'
        }}>
          Lexi says:
        </h3>
      </div>
      
      {loading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          color: '#666'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #ccc',
            borderTop: '2px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: '0.5rem'
          }}></div>
          Thinking...
        </div>
      ) : (
        <p style={{
          margin: 0,
          lineHeight: '1.6',
          color: '#333',
          fontSize: '1rem'
        }}>
          {reply}
        </p>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ReplyBubble; 