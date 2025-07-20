import React from 'react';
import micIcon from '../assets/icons/mic.svg';
import sendIcon from '../assets/icons/send.svg';
import imageIcon from '../assets/icons/image.svg';

export default function ChatActionsRow({ onSpeak, onSend, onImage, sendDisabled }) {
  // Calculate offset to center smaller buttons with the large send button
  const sendBtnSize = 80;
  const sideBtnSize = 52;
  const offset = (sendBtnSize - sideBtnSize) / 2;
  return (
    <div className="chat-actions-row" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 36, padding: '1.5rem 0' }}>
      {/* Speak Button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: offset }}>
        <button
          className="action-btn action-btn-icon"
          style={{
            width: sideBtnSize,
            height: sideBtnSize,
            borderRadius: '50%',
            background: '#F4F4F6',
            boxShadow: '0 2px 8px 0 rgba(122,84,255,0.10)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
            cursor: 'pointer',
            padding: 0
          }}
          onClick={onSpeak}
        >
          <img src={micIcon} alt="Mic" style={{ width: 28, height: 28, color: '#212121' }} />
        </button>
        <span style={{ fontSize: 13, color: '#A0A0A0', marginTop: 2 }}>Speak</span>
      </div>
      {/* Send Button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button
          className="send-btn"
          style={{
            width: sendBtnSize,
            height: sendBtnSize,
            borderRadius: '50%',
            background: 'linear-gradient(353deg, #5F46B4 26.75%, #7860CC 79.09%)',
            boxShadow: '0 4px 16px 0 rgba(122,84,255,0.18)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
            cursor: sendDisabled ? 'not-allowed' : 'pointer',
            opacity: sendDisabled ? 0.5 : 1,
            padding: 0,
            transition: 'opacity 0.2s'
          }}
          onClick={onSend}
          disabled={sendDisabled}
        >
          <img src={sendIcon} alt="Send" style={{ width: 36, height: 36, filter: 'brightness(0) invert(1)' }} />
        </button>
        <span style={{ fontSize: 13, color: '#A0A0A0', marginTop: 2 }}>Send</span>
      </div>
      {/* Image Button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: offset }}>
        <button
          className="action-btn action-btn-icon"
          style={{
            width: sideBtnSize,
            height: sideBtnSize,
            borderRadius: '50%',
            background: '#F4F4F6',
            boxShadow: '0 2px 8px 0 rgba(122,84,255,0.10)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
            cursor: 'pointer',
            padding: 0
          }}
          onClick={onImage}
        >
          <img src={imageIcon} alt="Image" style={{ width: 28, height: 28, color: '#212121' }} />
        </button>
        <span style={{ fontSize: 13, color: '#A0A0A0', marginTop: 2 }}>Image</span>
      </div>
    </div>
  );
} 