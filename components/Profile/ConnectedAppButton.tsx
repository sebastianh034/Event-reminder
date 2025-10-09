import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConnectedAppButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  appName: string;
  isConnected: boolean;
  onPress: () => void;
}

const ConnectedAppButton: React.FC<ConnectedAppButtonProps> = ({
  icon,
  iconColor,
  appName,
  isConnected,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.appButton} onPress={onPress}>
      <View style={styles.appLeft}>
        <Ionicons name={icon} size={24} color={iconColor} />
        <Text style={styles.appText}>{appName}</Text>
      </View>
      {isConnected ? (
        <Text style={styles.connectedText}>Connected</Text>
      ) : (
        <Text style={styles.connectText}>Connect</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  appButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  appLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  connectedText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  connectText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});

export default ConnectedAppButton;
