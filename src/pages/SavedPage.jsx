import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import arrowLeft from '../assets/icons/arrow-left.svg';
import volumeIcon from '../assets/icons/volume.svg';
import { fetchSavedPhrases, removeSavedPhrase } from '../api/savedPhrases';
import { useUser } from '../hooks/useAuth';

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

  // Dummy audio play function (replace with real TTS if available)
  const playAudio = (phrase, lang) => {
    // TODO: Integrate with TTS API for real audio
    alert(`Play audio for: ${phrase} [${lang}]`);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#fafaff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '18px 0 12px 0', borderBottom: '1px solid #eee', background: '#fff', position: 'sticky', top: 0, zIndex: 10, gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', marginLeft: 12, marginRight: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', height: 36 }}>
            <img src={arrowLeft} alt="Back" style={{ width: 28, height: 28 }} />
          </button>
          <span style={{ fontWeight: 700, fontSize: 22, color: '#7A54FF', flex: 1 }}>Saved Phrases</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#888', fontStyle: 'italic' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#fafaff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '18px 0 12px 0', borderBottom: '1px solid #eee', background: '#fff', position: 'sticky', top: 0, zIndex: 10, gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', marginLeft: 12, marginRight: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', height: 36 }}>
          <img src={arrowLeft} alt="Back" style={{ width: 28, height: 28 }} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 22, color: '#7A54FF', flex: 1 }}>Saved Phrases</span>
      </div>
      <div style={{ flex: 1, padding: '24px 18px 0 18px' }}>
        {!user?.id ? (
          <div style={{ color: '#888', fontStyle: 'italic', marginTop: 40, textAlign: 'center' }}>Please sign in to view saved phrases.</div>
        ) : saved.length === 0 ? (
          <div style={{ color: '#888', fontStyle: 'italic', marginTop: 40, textAlign: 'center' }}>No saved phrases yet.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {saved.map((item) => {
              const lang = detectLang(item.phrase);
              return (
                <li key={item.id} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px 0 rgba(122,84,255,0.08)', marginBottom: 18, padding: '18px 18px 14px 18px', display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => playAudio(item.phrase, lang)} style={{ background: 'none', border: 'none', padding: 0, marginRight: 2, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <img src={volumeIcon} alt="Play audio" style={{ width: 22, height: 22, opacity: 0.85 }} />
                    </button>
                    <span style={{ fontWeight: 700, fontSize: 18, color: '#4F2DD9', background: '#f3f0ff', borderRadius: 8, padding: '2px 8px' }}>{item.phrase}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: lang === 'fr' ? '#7A54FF' : '#00C853', borderRadius: 6, padding: '2px 7px', marginLeft: 6, letterSpacing: 1 }}>{lang}</span>
                    <button 
                      onClick={() => handleRemovePhrase(item.id)}
                      style={{ 
                        marginLeft: 'auto', 
                        background: 'none', 
                        border: 'none', 
                        color: '#D32F2F', 
                        fontWeight: 700, 
                        cursor: 'pointer',
                        fontSize: 12,
                        padding: '4px 8px',
                        borderRadius: 4
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  {item.translation && <div style={{ fontSize: 15, color: '#888', marginLeft: 2, marginTop: 2 }}>{item.translation}</div>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
} 