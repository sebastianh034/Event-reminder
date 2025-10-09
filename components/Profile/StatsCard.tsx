import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  number: number;
  label: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, iconColor, number, label }) => (
  <View style={styles.statItem}>
    <Ionicons name={icon} size={24} color={iconColor} />
    <Text style={styles.statNumber}>{number}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

interface StatsCardProps {
  upcomingEvents: number;
  pastEvents: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ upcomingEvents, pastEvents }) => {
  return (
    <View style={styles.statsContainer}>
      <StatItem
        icon="calendar-outline"
        iconColor="#3B82F6"
        number={upcomingEvents}
        label="Upcoming Events"
      />
      <View style={styles.statDivider} />
      <StatItem
        icon="checkmark-circle-outline"
        iconColor="#10B981"
        number={pastEvents}
        label="Past Events"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default StatsCard;
