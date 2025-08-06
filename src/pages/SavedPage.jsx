import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavHeader from '../components/TopNavHeader';
import volumeIcon from '../assets/icons/volume.svg';
import trashIcon from '../assets/icons/trash.svg';
import { fetchSavedPhrases, removeSavedPhrase } from '../api/savedPhrases';
import { useUser } from '../hooks/useAuth';
import BottomNav from '../components/BottomNav';
import { openaiTTS } from '../openai';
import Tooltip from '../components/Tooltip';

function detectLang(text) {
  // Simple heuristic: if contains accented chars or common French words, return 'fr', else 'en'
  if (/[éèàùâêîôûçëïüœæ]/i.test(text) || /\b(le|la|les|un|une|des|du|de|et|est|en|au|aux|avec|pour|sur|dans|par|que|qui|quoi|où|comment|quand|ça|son|sa|ses|se|ce|cette|ces|mon|ma|mes|ton|ta|tes|notre|nos|votre|vos|leur|leurs)\b/i.test(text)) {
    return 'fr';
  }
  return 'en';
}

export default function SavedPage() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useUser();

  const loadSavedPhrases = async () => {
    if (!user?.id) {
      setSaved([]);
      setLoading(false);
      return;
    }

    try {
      const phrases = await fetchSavedPhrases(user.id);
      setSaved(phrases);
    } catch (error) {
      console.error('Error loading saved phrases:', error);
      setSaved([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedPhrases();
  }, [user?.id]);

  // Reload when page gains focus
  useEffect(() => {
    const handleFocus = () => loadSavedPhrases();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.id]);

  const handleRemovePhrase = async (phraseId) => {
    if (!user?.id) return;

    try {
      const success = await removeSavedPhrase(user.id, phraseId);
      if (success) {
        setSaved(prev => prev.filter(item => item.id !== phraseId));
      } else {
        alert('Failed to remove phrase. Please try again.');
      }
    } catch (error) {
      console.error('Error removing phrase:', error);
      alert('Failed to remove phrase. Please try again.');
    }
  };

  // Play audio for a saved phrase using OpenAI TTS
  const playAudio = async (phrase, lang) => {
    try {
      // Use 'fable' for a friendly voice; OpenAI TTS auto-detects language from text
      const audioUrl = await openaiTTS(phrase, 'fable');
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      alert('Sorry, failed to generate audio.');
      console.error('TTS error:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#fafaff', display: 'flex', flexDirection: 'column' }}>
        <TopNavHeader title="Saved Phrases" onBack={() => navigate(-1)} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#888', fontStyle: 'italic' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#fafaff', display: 'flex', flexDirection: 'column' }}>
      <TopNavHeader title="Saved Phrases" onBack={() => navigate(-1)} />
      
      {/* Sign-in message */}
      {!user?.id && <Tooltip message="Please sign in to save your own phrases." />}
      
      <div style={{ flex: 1, padding: '24px 18px 0 18px' }}>
        {!user?.id ? (
          <div>
            <div style={{ color: '#666', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>Here's an example of how saved phrases look:</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px 0 rgba(122,84,255,0.08)', marginBottom: 18, padding: '18px 18px 14px 18px', display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 18, color: '#4F2DD9', background: '#f3f0ff', borderRadius: 8, padding: '2px 8px' }}>Bonjour, comment allez-vous?</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => playAudio('Bonjour, comment allez-vous?', 'fr')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', paddingLeft: '4px' }}>
                      <img src={volumeIcon} alt="Play audio" style={{ width: 22, height: 22, opacity: 0.85 }} />
                    </button>
                    <div style={{ padding: '4px', borderRadius: 4, display: 'flex', alignItems: 'center', opacity: 0.3 }}>
                      <img src={trashIcon} alt="Remove phrase" style={{ width: 18, height: 18 }} />
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 15, color: '#888', marginLeft: 2, marginTop: 2 }}>Hello, how are you?</div>
              </li>
            </ul>
          </div>
        ) : saved.length === 0 ? (
          <div style={{ color: '#888', fontStyle: 'italic', marginTop: 40, textAlign: 'center' }}>No saved phrases yet.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {saved.map((item) => {
              const lang = detectLang(item.phrase);
              return (
                <li key={item.id} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px 0 rgba(122,84,255,0.08)', marginBottom: 18, padding: '18px 18px 14px 18px', display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 18, color: '#4F2DD9', background: '#f3f0ff', borderRadius: 8, padding: '2px 8px' }}>{item.phrase}</span>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => playAudio(item.phrase, lang)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', paddingLeft: '4px' }}>
                        <img src={volumeIcon} alt="Play audio" style={{ width: 22, height: 22, opacity: 0.85 }} />
                      </button>
                      <button 
                        onClick={() => handleRemovePhrase(item.id)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: 4,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <img src={trashIcon} alt="Remove phrase" style={{ width: 18, height: 18, opacity: 0.7 }} />
                      </button>
                    </div>
                  </div>
                  {item.translation && <div style={{ fontSize: 15, color: '#888', marginLeft: 2, marginTop: 2 }}>{item.translation}</div>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {/* Persistent Bottom Navigation */}
      <BottomNav />
    </div>
  );
} 