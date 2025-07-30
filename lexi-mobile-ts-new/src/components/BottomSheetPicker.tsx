import React from 'react';
import { Modal, TouchableOpacity, View, Text, FlatList } from 'react-native';

interface Option {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface BottomSheetPickerProps {
  visible: boolean;
  onClose: () => void;
  options: Option[];
  onSelect: (value: string) => void;
  title?: string;
}

const BottomSheetPicker: React.FC<BottomSheetPickerProps> = ({ visible, onClose, options, onSelect, title }) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent
    onRequestClose={onClose}
  >
    <TouchableOpacity className="flex-1 bg-black/20" onPress={onClose} />
    <View className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl p-6 min-h-[220px] shadow-2xl">
      {title && <Text className="text-lg font-bold text-center mb-4">{title}</Text>}
      <FlatList
        data={options}
        keyExtractor={item => item.value}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row items-center py-3 px-2 rounded-xl mb-2"
            onPress={() => onSelect(item.value)}
          >
            {item.icon ? item.icon : null}
            <Text className="text-base ml-3">{item.label}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  </Modal>
);

export default BottomSheetPicker; 