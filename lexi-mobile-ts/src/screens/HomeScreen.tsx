import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// HomeScreen: Main landing page after splash/onboarding
const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      {/* TODO: Implement home page UI */}
    </View>
  );
};

export default HomeScreen;

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