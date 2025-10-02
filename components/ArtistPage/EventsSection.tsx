import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EventCard from '../EventCard';
import { type Event } from '../data/fakedata';

interface EventsSectionProps {
  events: Event[];
  onEventPress: (event: Event) => void;
}

const EventsSection: React.FC<EventsSectionProps> = ({ events, onEventPress }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Events</Text>

      {events.length > 0 ? (
        events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onPress={() => onEventPress(event)}
          />
        ))
      ) : (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>No Future Events</Text>
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
