import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// VoiceJournalScreen: Voice input and transcription journal screen
const VoiceJournalScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Journal Screen</Text>
      {/* TODO: Implement voice input and transcription UI */}
    </View>
  );
};

export default VoiceJournalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 