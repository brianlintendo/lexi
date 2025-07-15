import React from 'react';
import BottomSheet from './BottomSheet';
import { addSavedPhrase, checkPhraseExists } from '../api/savedPhrases';
import { useUser } from '../hooks/useAuth';

function highlightCorrections(userText, aiText) {
  // Simple word diff: highlight words in aiText that are not in userText
  if (!userText || !aiText) return aiText;
  const userWords = userText.split(/\s+/);
  const aiWords = aiText.split(/\s+/);
  // Mark as incorrect if not in userWords at the same position
  return aiWords.map((word, i) => {
    if (userWords[i] && userWords[i] !== word) {
      return <b key={i}><mark style={{background:'#ffe066',padding:'0 2px',borderRadius:3}}>{word}</mark></b>;
    }
    return word + (i < aiWords.length - 1 ? ' ' : '');
  });
}

export default function ChatBubble({ sender, text, loading, userText }) {
  // Always use Albert Sans for AI
  const fontFamily = 'Albert Sans, sans-serif';
  const [showPhraseSheet, setShowPhraseSheet] = React.useState(false);
  const [phraseData, setPhraseData] = React.useState({ phrase: '', translation: '' });
  const [isSaved, setIsSaved] = React.useState(false);
  const { user } = useUser();

  const handleAddToSaved = async () => {
    if (!user?.id) {
      alert('Please sign in to save phrases');
      return;
    }

    try {
      // Check if phrase already exists
      const exists = await checkPhraseExists(user.id, phraseData.phrase);
      if (exists) {
        setIsSaved(true);
        return;
      }

      // Add the phrase
      const result = await addSavedPhrase(user.id, phraseData.phrase, phraseData.translation);
      if (result) {
        setIsSaved(true);
      } else {
        alert('Failed to save phrase. Please try again.');
      }
    } catch (error) {
      console.error('Error saving phrase:', error);
      alert('Failed to save phrase. Please try again.');
    }
  };

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
    // Parse Lexi's new four-section format
    let corrected = null, corrections = null, phrase = null, vocab = null, followup = null;
    if (typeof text === 'string') {
      // Use regex to extract sections
      const correctedMatch = text.match(/\*\*Corrected Entry:\*\*[\s\n]*([\s\S]*?)(?=\*\*Key Corrections:|$)/i);
      const correctionsMatch = text.match(/\*\*Key Corrections:\*\*[\s\n]*([\s\S]*?)(?=\*\*Phrase to Remember:|$)/i);
      const phraseMatch = text.match(/\*\*Phrase to Remember:\*\*[\s\n]*([\s\S]*?)(?=\*\*Vocabulary Enhancer:|\*\*Follow-up:|$)/i);
      const vocabMatch = text.match(/\*\*Vocabulary Enhancer:\*\*[\s\n]*([\s\S]*?)(?=\*\*Follow-up:|$)/i);
      const followupMatch = text.match(/\*\*Follow-up:\*\*[\s\n]*([\s\S]*)/i);
      corrected = correctedMatch ? correctedMatch[1].trim() : null;
      corrections = correctionsMatch ? correctionsMatch[1].trim() : null;
      phrase = phraseMatch ? phraseMatch[1].trim() : null;
      vocab = vocabMatch ? vocabMatch[1].trim() : null;
      followup = followupMatch ? followupMatch[1].trim() : null;
    }
    return (
      <>
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
              {corrected || corrections || phrase || vocab || followup ? (
                <>
                  {corrected && (
                    <div style={{marginBottom:10}}>
                      <span style={{fontWeight:700}}>Corrected Entry:</span><br/>
                      <span dangerouslySetInnerHTML={{__html: corrected}} />
                    </div>
                  )}
                  {corrections && (
                    <div style={{marginBottom:10}}>
                      <span style={{fontWeight:700}}>Key Corrections:</span>
                      <ul style={{margin:'6px 0 0 18px', padding:0, color:'#444', fontWeight:400, fontSize:15}}>
                        {corrections.split(/\n|\r/).filter(Boolean).map((line,i) => (
                          <li key={i}>
                            <span dangerouslySetInnerHTML={{__html: line}} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {phrase && (
                    <div style={{marginBottom:10}}>
                      <span style={{fontWeight:700}}>Phrase to Remember:</span>
                      <ul style={{margin:'6px 0 0 18px', padding:0, color:'#444', fontWeight:400, fontSize:15}}>
                        {phrase.split(/\n|\r|^[-•]\s+/m).filter(p => p.trim()).map((p, i) => (
                          <li key={i} style={{marginBottom:4}}>
                            <mark
                              style={{background:'#ffe066',padding:'0 4px',borderRadius:3, cursor:'pointer', fontWeight:600, color:'#7A54FF'}}
                              onClick={() => {
                                // Try to split phrase and translation if present
                                const match = p.match(/^([^"\-]+|"[^"]+")\s*[–-]\s*(.+)$/);
                                if (match) {
                                  setPhraseData({ phrase: match[1].replace(/^"|"$/g, ''), translation: match[2] });
                                } else {
                                  setPhraseData({ phrase: p.replace(/^"|"$/g, ''), translation: '' });
                                }
                                setShowPhraseSheet(true);
                              }}
                            >
                              {p.trim()}
                            </mark>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {vocab && (
                    <div style={{marginBottom:10}}>
                      <span style={{fontWeight:700}}>Vocabulary Enhancer:</span>
                      <ul style={{margin:'6px 0 0 18px', padding:0, color:'#444', fontWeight:400, fontSize:15}}>
                        {vocab.split(/\n|\r|^[-•]\s+/m).filter(v => v.trim()).map((v, i) => (
                          <li key={i} style={{marginBottom:4}}>
                            <mark
                              style={{background:'#e0e7ff',padding:'0 4px',borderRadius:3, cursor:'pointer', fontWeight:600, color:'#7A54FF'}}
                              onClick={() => {
                                // Try to split vocab and translation if present
                                const match = v.match(/^([^"\-]+|"[^"]+")\s*[–-]\s*(.+)$/);
                                if (match) {
                                  setPhraseData({ phrase: match[1].replace(/^"|"$/g, ''), translation: match[2] });
                                } else {
                                  setPhraseData({ phrase: v.replace(/^"|"$/g, ''), translation: '' });
                                }
                                setShowPhraseSheet(true);
                              }}
                            >
                              {v.trim()}
                            </mark>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {followup && (
                    <div style={{marginTop:10, fontStyle:'italic', color:'#009688', fontWeight:500}}>
                      {followup}
                    </div>
                  )}
                </>
              ) : (
                text
              )}
            </div>
          </div>
        </div>
        {showPhraseSheet && (
          <BottomSheet>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#7A54FF', marginBottom: 10, letterSpacing: 0.5 }}>{phraseData.phrase}</div>
              {phraseData.translation && (
                <div style={{ fontSize: 17, color: '#444', marginBottom: 18 }}>{phraseData.translation}</div>
              )}
              <button
                onClick={handleAddToSaved}
                style={{ marginTop: 8, marginBottom: 12, background: isSaved ? '#b2dfdb' : '#eee', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 15, cursor: isSaved ? 'not-allowed' : 'pointer', color: '#7A54FF' }}
                disabled={isSaved}
              >
                {isSaved ? 'Added!' : 'Add to Saved Phrases'}
              </button>
              <button
                onClick={() => setShowPhraseSheet(false)}
                style={{ background: '#eee', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer', color: '#7A54FF' }}
              >
                Close
              </button>
            </div>
          </BottomSheet>
        )}
      </>
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