import React from 'react';
import micIcon from '../assets/icons/mic.svg';
import sendIcon from '../assets/icons/send.svg';
import imageIcon from '../assets/icons/image.svg';

export default function ChatActionsRow({ onSpeak, onSend, onImage, sendDisabled }) {
  return (
    <div className="chat-actions-row" style={{ display: 'flex', justifyContent: 'center', gap: 24, padding: '1.5rem 0' }}>
      <button className="action-btn action-btn-icon" style={{ width: 52, height: 52 }} onClick={onSpeak}>
        <img src={micIcon} alt="Mic" style={{ width: 28, height: 28 }} />
        <div>Speak</div>
      </button>
      <button className="action-btn send-btn" style={{ width: 80, height: 80 }} onClick={onSend} disabled={sendDisabled}>
        <img src={sendIcon} alt="Send" style={{ width: 36, height: 36 }} />
        <div>Send</div>
      </button>
      <button className="action-btn action-btn-icon" style={{ width: 52, height: 52 }} onClick={onImage}>
        <img src={imageIcon} alt="Image" style={{ width: 28, height: 28 }} />
        <div>Image</div>
      </button>
    </div>
  );
} 