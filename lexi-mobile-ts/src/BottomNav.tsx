import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const tabs = [
  {
    name: 'Journal',
    icon: 'book-outline',
    label: 'Journal',
  },
  {
    name: 'Saved',
    icon: 'star-outline',
    label: 'Phrases',
  },
  {
    name: 'Settings',
    icon: 'person-outline',
    label: 'Account',
  },
];

const NAV_HEIGHT = 88;

const BottomNav: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Only show on Journal, Saved, and Settings pages
  if (route.name !== 'Journal' && route.name !== 'Saved' && route.name !== 'Settings') {
    return null;
  }

  return (
    <View style={[styles.tabBar, { height: NAV_HEIGHT }]}> {/* Consistent height */}
      {tabs.map(tab => {
        const isActive = route.name === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabButton}
            onPress={() => navigation.navigate(tab.name as never)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon as any}
              size={28}
              color={isActive ? '#7A54FF' : '#6B6B6B'}
            />
            <Text style={[styles.tabLabel, isActive && styles.activeLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff', // Restored white pill background
    borderRadius: 36,
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    shadowColor: '#7A54FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 99,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B6B6B',
    marginTop: 2,
  },
  activeLabel: {
    color: '#7A54FF',
    fontWeight: '600',
  },
});

export default BottomNav; 