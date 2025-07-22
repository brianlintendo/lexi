import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// NameEntryScreen: User name entry during onboarding
const NameEntryScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Name Entry Screen</Text>
      {/* TODO: Implement name entry UI */}
    </View>
  );
};

export default NameEntryScreen;

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