import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// OnboardMotivationScreen: Motivation selection during onboarding
const OnboardMotivationScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onboard Motivation Screen</Text>
      {/* TODO: Implement motivation selection UI */}
    </View>
  );
};

export default OnboardMotivationScreen;

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