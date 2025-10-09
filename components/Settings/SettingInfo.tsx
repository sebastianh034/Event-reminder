import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingInfoProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const SettingInfo: React.FC<SettingInfoProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={24} color="#ffffff" />
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingText}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default SettingInfo;
