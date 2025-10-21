import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { type Event } from '../data/fakedata';
import EventCard from '../EventCard';
import EventCardSkeleton from '../skeletons/EventCardSkeleton';

interface FollowingEventsSectionProps {
  events: Event[];
  onEventPress: (event: Event) => void;
}

const FollowingEventsSection: React.FC<FollowingEventsSectionProps> = ({ events, onEventPress }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay to test skeleton screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Upcoming Events</Text>
      <Text style={styles.subtitle}>From artists you follow</Text>

      {isLoading ? (
        // Show skeleton cards while loading
        <View style={styles.eventsContainer}>
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No upcoming events from followed artists</Text>
          <Text style={styles.emptySubtext}>Follow some artists to see their events here!</Text>
        </View>
      ) : (
        <View style={styles.eventsContainer}>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => onEventPress(event)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  eventsContainer: {
    gap: 12,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});

export default FollowingEventsSection;
