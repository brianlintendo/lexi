import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SavedPhraseSheetProps {
  visible: boolean;
  phrase: string;
  translation?: string;
  onSave: () => void;
  onClose: () => void;
  isSaved: boolean;
}

const SavedPhraseSheet: React.FC<SavedPhraseSheetProps> = ({ visible, phrase, translation, onSave, onClose, isSaved }) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent
    onRequestClose={onClose}
  >
    <TouchableOpacity style={styles.overlay} onPress={onClose} />
    <View style={styles.sheet}>
      <Text style={styles.phrase}>{phrase}</Text>
      {translation ? <Text style={styles.translation}>{translation}</Text> : null}
      <TouchableOpacity
        style={[styles.saveBtn, isSaved && styles.saveBtnDisabled]}
        onPress={onSave}
        disabled={isSaved}
      >
        <Text style={styles.saveBtnText}>{isSaved ? 'Saved' : 'Add to Saved Phrases'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeBtnText}>Close</Text>
      </TouchableOpacity>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fafaff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    minHeight: 260,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  phrase: {
    fontSize: 28,
    fontWeight: '700',
    color: '#7A54FF',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'AlbertSans_700Bold',
  },
  translation: {
    fontSize: 18,
    color: '#444444',
    marginBottom: 28,
    textAlign: 'center',
    fontFamily: 'AlbertSans_400Regular',
    fontWeight: '400',
  },
  saveBtn: {
    backgroundColor: '#7A54FF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  saveBtnDisabled: {
    backgroundColor: '#4FDC8B',
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'AlbertSans_700Bold',
  },
  closeBtn: {
    borderWidth: 1,
    borderColor: '#E0D7FF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  closeBtnText: {
    color: '#7A54FF',
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'AlbertSans_700Bold',
  },
});

export default SavedPhraseSheet; 