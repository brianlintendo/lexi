import React from 'react';
import { View, Text, ViewProps } from 'react-native';

interface HeaderProps extends ViewProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

const Header: React.FC<HeaderProps> = ({ title, children, className = '', titleClassName = '', ...props }) => (
  <View className={`flex-row items-center justify-between px-6 pb-4 bg-transparent ${className}`} {...props}>
    <Text className={`font-bold text-gray-900 text-center flex-1 ${titleClassName}`}>{title}</Text>
    {children ? <View className="absolute right-6">{children}</View> : null}
  </View>
);

export default Header; 