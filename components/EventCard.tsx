import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { type Event, formatEventDate, getEventStatusColor, getEventStatusLabel } from '../utils/eventsService';
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

  // Format date from ISO string
  const formattedDate = formatEventDate(event.event_date);
  const statusColor = getEventStatusColor(event.status);
  const statusLabel = getEventStatusLabel(event.status);

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
          <Text style={styles.artistName}>{event.artist_name}</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Text style={styles.venue}>{event.venue}</Text>
          <Text style={styles.location}>{event.location}</Text>
          {event.price_range && (
            <Text style={styles.price}>{event.price_range}</Text>
          )}
        </View>

        {/* Right side - Status Badge */}
        <View style={styles.rightContent}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {statusLabel}
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
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  venue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  price: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 2,
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
    color: 'white',
  },
});

export default EventCard;