import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, ActivityIndicator } from 'react-native';
import { addSavedPhrase, checkPhraseExists } from '../api/savedPhrases';

interface SavedPhraseSheetProps {
  visible: boolean;
  onClose: () => void;
  phraseData: { phrase: string; translation: string };
  onPhraseAdded?: (result: any) => void;
  userId?: string;
}

export default function SavedPhraseSheet({ 
  visible, 
  onClose, 
  phraseData, 
  onPhraseAdded,
  userId = 'default-user'
}: SavedPhraseSheetProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && phraseData?.phrase && userId) {
      checkIfPhraseExists();
    }
  }, [visible, phraseData, userId]);

  const checkIfPhraseExists = async () => {
    try {
      const exists = await checkPhraseExists(userId, phraseData.phrase);
      setIsSaved(exists);
    } catch (error) {
      console.error('Error checking phrase existence:', error);
      setIsSaved(false);
    }
  };

  const handleAddToSaved = async () => {
    if (!userId || !phraseData?.phrase || isSaved) return;

    setIsLoading(true);
    try {
      const result = await addSavedPhrase(userId, phraseData.phrase, phraseData.translation || '');
      if (result) {
        setIsSaved(true);
        if (onPhraseAdded) {
          onPhraseAdded(result);
        }
      }
    } catch (error) {
      console.error('Error adding phrase:', error);
      // You could show an alert here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)' }} onPress={onClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable 
            style={{ 
              backgroundColor: '#fff',
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              padding: 24,
              minHeight: 200,
              width: '100%'
            }} 
            onPress={e => e.stopPropagation()}
          >
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ 
                fontSize: 24, 
                fontWeight: '700', 
                color: '#7A54FF', 
                marginBottom: 10, 
                textAlign: 'center'
              }}>
                {phraseData?.phrase}
              </Text>
              {phraseData?.translation && (
                <Text style={{ 
                  fontSize: 17, 
                  color: '#444', 
                  marginBottom: 18,
                  textAlign: 'center'
                }}>
                  {phraseData.translation}
                </Text>
              )}
            </View>
            
            <View style={{ gap: 12, paddingHorizontal: 24 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: isSaved ? '#e0e0e0' : '#7A54FF',
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: 'center',
                  opacity: isLoading ? 0.7 : 1
                }}
                onPress={handleAddToSaved}
                disabled={isSaved || isLoading || !userId}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ 
                    color: isSaved ? '#666' : '#fff', 
                    fontWeight: '600',
                    fontSize: 16
                  }}>
                    {isSaved ? 'Added!' : 'Add to Saved Phrases'}
                  </Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: '#7A54FF',
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: 'center'
                }}
                onPress={onClose}
              >
                <Text style={{ 
                  color: '#7A54FF', 
                  fontWeight: '600',
                  fontSize: 16
                }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
} 