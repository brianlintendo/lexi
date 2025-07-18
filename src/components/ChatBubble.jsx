import React, { useState, useEffect } from 'react';
import SavedPhraseSheet from './SavedPhraseSheet';
import { useUser } from '../hooks/useAuth';
import { addSavedPhrase, checkPhraseExists } from '../api/savedPhrases';

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
  const [showPhraseSheet, setShowPhraseSheet] = useState(false);
  const [phraseData, setPhraseData] = useState({ phrase: '', translation: '' });

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
    // If none of the sections are found, render the raw text
    if (!corrected && !corrections && !phrase && !vocab && !followup) {
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
              {followup && (
                <div style={{marginBottom:14, fontStyle:'italic', color:'#009688', fontWeight:500, fontSize:17}}>
                  {followup}
                </div>
              )}
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
            </div>
          </div>
        </div>
        {showPhraseSheet && (
          <SavedPhraseSheet 
            isOpen={showPhraseSheet}
            onClose={() => setShowPhraseSheet(false)}
            phraseData={phraseData}
            onPhraseAdded={(result) => {
              // Handle phrase added callback if needed
              console.log('Phrase added:', result);
            }}
          />
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