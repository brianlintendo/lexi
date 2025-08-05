import { useState, useEffect } from 'react';

export function useChatPreview() {
  const [chatPreview, setChatPreview] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('lexi-chat-messages');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Find last AI and user messages
        const lastAi = [...parsed].reverse().find(m => m.sender === 'ai');
        const lastUser = [...parsed].reverse().find(m => m.sender === 'user');
        if (lastAi && lastUser) {
          setChatPreview({ ai: lastAi, user: lastUser });
        } else {
          setChatPreview(null);
        }
      } catch {
        setChatPreview(null);
      }
    } else {
      setChatPreview(null);
    }
  }, []);

  const clearChatPreview = () => {
    localStorage.removeItem('lexi-chat-messages');
    setChatPreview(null);
  };

  return {
    chatPreview,
    clearChatPreview
  };
} 