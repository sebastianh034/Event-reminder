import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SettingCardProps {
  title: string;
  children: React.ReactNode;
}

const SettingCard: React.FC<SettingCardProps> = ({ title, children }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
});

export default SettingCard;
