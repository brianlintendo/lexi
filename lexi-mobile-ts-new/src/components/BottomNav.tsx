import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const tabs = [
  { name: 'Journal', icon: 'book-outline', label: 'Journal' },
  { name: 'Saved', icon: 'star-outline', label: 'Phrases' },
  { name: 'Settings', icon: 'person-outline', label: 'Account' },
];

const NAV_HEIGHT = 88;

const BottomNav: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Always show the bottom nav
  return (
    <View className="flex-row justify-around items-center bg-white rounded-full absolute left-4 right-4 bottom-6 shadow-lg z-50" style={{ height: NAV_HEIGHT }}>
      {tabs.map(tab => {
        const isActive = route.name === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            className="flex-1 items-center justify-center"
            onPress={() => navigation.navigate(tab.name as never)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon as any}
              size={28}
              color={isActive ? '#7A54FF' : '#6B6B6B'}
            />
            <Text className={`text-xs mt-1 ${isActive ? 'text-violet-600 font-bold' : 'text-gray-500'}`}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNav; 