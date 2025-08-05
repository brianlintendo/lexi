import React from 'react';
import moreIcon from '../assets/icons/more.svg';

export default function JournalEntryDisplay({ 
  text, 
  showDialog, 
  onToggleDialog, 
  onEdit, 
  onDelete 
}) {
  if (!text || !text.trim()) return null;

  return (
    <div style={{ 
      color: 'var(--Text-Text-Dark, #1C1C1C)',
      fontFamily: 'Albert Sans',
      fontSize: '18px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '28px',
      whiteSpace: 'pre-wrap',
      margin: '24px 0 0 0',
    }}>
      {text.split('\n\n').map((paragraph, index) => (
        <p key={index} style={{
          margin: index > 0 ? '16px 0 0 0' : '0 0 16px 0',
          padding: 0
        }}
        dangerouslySetInnerHTML={{ __html: paragraph }}
        />
      ))}
      
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
          <div style={{
            background: '#e8f5e8',
            color: '#2e7d32',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            COMPLETE
          </div>
          <img 
            src={moreIcon} 
            alt="More options" 
            style={{ 
              width: '20px', 
              height: '20px', 
              cursor: 'pointer',
              opacity: 0.7
            }}
            onClick={onToggleDialog}
          />
        </div>
        
        {/* Dialog box */}
        {showDialog && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '1px solid #E0E0E0',
            zIndex: 1000,
            marginTop: '8px',
            overflow: 'hidden',
            minWidth: '120px'
          }}>
            <div 
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                borderBottom: '1px solid #F0F0F0'
              }}
              onClick={onEdit}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span style={{ color: '#212121', fontSize: '14px' }}>Edit</span>
            </div>
            <div 
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}
              onClick={onDelete}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
              <span style={{ color: '#D32F2F', fontSize: '14px' }}>Delete</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 