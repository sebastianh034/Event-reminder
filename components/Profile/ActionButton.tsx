import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress: () => void;
  isDanger?: boolean;
  isLast?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  text,
  onPress,
  isDanger = false,
  isLast = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.actionButton, isLast && styles.lastButton]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={24}
        color={isDanger ? '#EF4444' : '#3B82F6'}
      />
      <Text style={[styles.actionButtonText, isDanger && styles.dangerText]}>
        {text}
      </Text>
      <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  lastButton: {
    borderBottomWidth: 0,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
    flex: 1,
  },
  dangerText: {
    color: '#EF4444',
  },
});

export default ActionButton;
