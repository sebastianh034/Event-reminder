import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EventCard from '../EventCard';
import { type Event } from '../data/fakedata';

interface PastEventsSectionProps {
  pastEvents: Event[];
  onEventPress: (event: Event) => void;
}

const PastEventsSection: React.FC<PastEventsSectionProps> = ({
  pastEvents,
  onEventPress
}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Past Events</Text>

      {pastEvents.length > 0 ? (
        pastEvents.map((event) => (
          <EventCard
            key={`past-${event.id}`}
            event={event}
            onPress={() => onEventPress(event)}
          />
        ))
      ) : (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>No Past Events</Text>
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

export default PastEventsSection;
