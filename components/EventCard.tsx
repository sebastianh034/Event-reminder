import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { type Event } from '../components/data/fakedata';
import * as Haptics from 'expo-haptics';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    }
  };
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Low Stock':
        return { backgroundColor: '#F59E0B', color: '#000' }; // Yellow
      case 'Sold Out':
        return { backgroundColor: '#EF4444', color: '#FFF' }; // Red
      case 'Tickets Soon':
        return { backgroundColor: '#10B981', color: '#FFF' }; // Green
      case 'Available':
        return { backgroundColor: '#3B82F6', color: '#FFF' }; // Blue
      default:
        return { backgroundColor: '#6B7280', color: '#FFF' }; // Gray
    }
  };

  const statusStyle = getStatusStyle(event.status);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
      onPress={handlePress}
    >
      <View style={styles.cardContent}>
        {/* Left side - Artist and Date Info */}
        <View style={styles.leftContent}>
          <Text style={styles.artistName}>{event.artist}</Text>
          <View style={styles.dateRow}>
            <Text style={styles.month}>{event.date.split(' ')[0]}</Text>
            <Text style={styles.day}>{event.date.split(' ')[1]}</Text>
          </View>
          <Text style={styles.venue}>{event.venue}</Text>
          <Text style={styles.location}>{event.location}</Text>
        </View>

        {/* Right side - Status Badge */}
        <View style={styles.rightContent}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {event.status}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(75, 85, 99, 0.6)',
    borderRadius: 15,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardPressed: {
    backgroundColor: 'rgba(75, 85, 99, 0.8)',
    transform: [{ scale: 0.98 }],
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  artistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  month: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 6,
  },
  day: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  venue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default EventCard;