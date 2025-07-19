import React from 'react';
import BottomSheet, { SecondaryButton } from './BottomSheet';

export default function FollowupSheet({ 
  isOpen, 
  onClose, 
  followupData 
}) {
  return (
    <BottomSheet 
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      padding="0"
    >
      <div style={{ 
        width: '100%',
        background: 'var(--Background, linear-gradient(180deg, #FAF4F4 0%, #E9E3F5 48.08%, #F5F1FD 100%))',
        padding: '24px',
        borderRadius: '32px 32px 0 0',
        minHeight: '200px'
      }}>
        <div style={{ 
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ 
            fontSize: 24, 
            fontWeight: 700, 
            color: '#7A54FF', 
            marginBottom: 10, 
            letterSpacing: 0.5 
          }}>
            {followupData?.phrase}
          </div>
          {followupData?.translation && (
            <div style={{ 
              fontSize: 16, 
              color: '#5E5E5E', 
              marginBottom: 18 
            }}>
              {followupData.translation}
            </div>
          )}
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          padding: '0 24px'
        }}>
          <SecondaryButton
            onClick={onClose}
          >
            Close
          </SecondaryButton>
        </div>
      </div>
    </BottomSheet>
  );
} 