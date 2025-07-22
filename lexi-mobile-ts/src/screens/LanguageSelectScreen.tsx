import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// LanguageSelectScreen: Language selection during onboarding or settings
const LanguageSelectScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Language Select Screen</Text>
      {/* TODO: Implement language selection UI */}
    </View>
  );
};

export default LanguageSelectScreen;

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