import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// PromptsScreen: Suggested prompts and ideas for journaling/chat
const PromptsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prompts Screen</Text>
      {/* TODO: Implement prompts UI */}
    </View>
  );
};

export default PromptsScreen;

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