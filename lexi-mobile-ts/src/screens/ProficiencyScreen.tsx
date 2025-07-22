import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ProficiencyScreen: User proficiency selection during onboarding or settings
const ProficiencyScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Proficiency Screen</Text>
      {/* TODO: Implement proficiency selection UI */}
    </View>
  );
};

export default ProficiencyScreen;

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