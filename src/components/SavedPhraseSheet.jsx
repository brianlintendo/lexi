import React from 'react';
import BottomSheet, { PrimaryButton, SecondaryButton } from './BottomSheet';
import { useUser } from '../hooks/useAuth';
import { addSavedPhrase, checkPhraseExists } from '../api/savedPhrases';

export default function SavedPhraseSheet({ 
  isOpen, 
  onClose, 
  phraseData, 
  onPhraseAdded 
}) {
  const { user } = useUser();
  const [isSaved, setIsSaved] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && phraseData?.phrase && user?.id) {
      checkIfPhraseExists();
    }
  }, [isOpen, phraseData, user]);

  const checkIfPhraseExists = async () => {
    try {
      const exists = await checkPhraseExists(user.id, phraseData.phrase);
      setIsSaved(exists);
    } catch (error) {
      console.error('Error checking phrase existence:', error);
      setIsSaved(false);
    }
  };

  const handleAddToSaved = async () => {
    if (!user?.id || !phraseData?.phrase || isSaved) return;

    setIsLoading(true);
    try {
      const result = await addSavedPhrase(user.id, phraseData.phrase, phraseData.translation || '');
      if (result) {
        setIsSaved(true);
        if (onPhraseAdded) {
          onPhraseAdded(result);
        }
      }
    } catch (error) {
      console.error('Error adding phrase:', error);
      alert('Failed to save phrase. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            {phraseData?.phrase}
          </div>
          {phraseData?.translation && (
            <div style={{ 
              fontSize: 17, 
              color: '#444', 
              marginBottom: 18 
            }}>
              {phraseData.translation}
            </div>
          )}
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          padding: '0 24px'
        }}>
          <PrimaryButton
            onClick={handleAddToSaved}
            disabled={isSaved || isLoading || !user?.id}
          >
            {isLoading ? 'Saving...' : isSaved ? 'Added!' : 'Add to Saved Phrases'}
          </PrimaryButton>
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