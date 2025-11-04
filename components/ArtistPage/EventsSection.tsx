import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EventCard from '../EventCard';
import EventCardSkeleton from '../skeletons/EventCardSkeleton';
import { type Event } from '../../utils/eventsService';

interface EventsSectionProps {
  events: Event[];
  onEventPress: (event: Event) => void;
  title?: string;
  emptyMessage?: string;
  loading?: boolean;
}

const EventsSection: React.FC<EventsSectionProps> = ({
  events,
  onEventPress,
  title = 'Events',
  emptyMessage = 'No Future Events',
  loading = false,
}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {loading ? (
        // Show skeleton loaders while loading
        <>
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </>
      ) : events.length > 0 ? (
        events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onPress={() => onEventPress(event)}
          />
        ))
      ) : (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>{emptyMessage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  noEventsContainer: {
    backgroundColor: 'rgba(75, 85, 99, 0.5)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  noEventsText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default EventsSection;
