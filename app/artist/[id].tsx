import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { type Event, fakeArtistData, fakeConcertData, fakePastEvents } from '../../components/data/fakedata';
import { SafeAreaView } from 'react-native-safe-area-context';
import ArtistHeader from '../../components/ArtistPage/ArtistHeader';
import ContentContainer from '../../components/ArtistPage/ContentContainer';
import EventsSection from '../../components/ArtistPage/EventsSection';
import PastEventsSection from '../../components/ArtistPage/PastEventsSection';
import DistanceFilter from '../../components/ArtistPage/DistanceFilter';
import { useLocation } from '../../context/locationContext';
import { filterEventsByDistance } from '../../utils/distance';
import * as Notifications from 'expo-notifications';
import { useNotifications } from '../../context/notificationContext';

export default function ArtistPage() {
  const { id } = useLocalSearchParams();
  const [maxDistance, setMaxDistance] = useState(100);
  const { location, locationEnabled, permissionGranted, refreshLocation } = useLocation();
  const { notificationsEnabled } = useNotifications();

  const artist = fakeArtistData.find(a => a.id.toString() === id);

  if (!artist) {
    return null;
  }

  const allEvents = fakeConcertData.filter(event => event.artist === artist.name);
  const allPastEvents = fakePastEvents.filter(event => event.artist === artist.name);

  // Filter events by distance if location is available and enabled
  const { nearbyEvents, farAwayEvents } = useMemo(() => {
    if (!location || !permissionGranted || !locationEnabled) {
      return { nearbyEvents: allEvents, farAwayEvents: [] };
    }
    const nearby = filterEventsByDistance(allEvents, location.latitude, location.longitude, maxDistance);
    const farAway = allEvents.filter(event => !nearby.includes(event));
    return { nearbyEvents: nearby, farAwayEvents: farAway };
  }, [allEvents, location, permissionGranted, locationEnabled, maxDistance]);

  // Past events always show all, regardless of distance
  const pastEvents = allPastEvents;

  const handleEventPress = async (event: Event): Promise<void> => {
    console.log(`Pressed ${event.artist} event on ${event.date}`);

    // Only send notification if enabled
    if (notificationsEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${event.artist} - ${event.status}`,
          body: `${event.venue} • ${event.date}\n${event.location}`,
          data: {
            eventId: event.id,
            artist: event.artist,
            artistId: artist.id.toString()
          },
        },
        trigger: null, // Send immediately
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#1d4ed8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <ArtistHeader artist={artist} isUserSignedIn={true} />

            <DistanceFilter
              distance={maxDistance}
              onDistanceChange={setMaxDistance}
              locationEnabled={locationEnabled && permissionGranted}
              onEnableLocation={refreshLocation}
            />

            <ContentContainer>
              <EventsSection
                events={nearbyEvents}
                onEventPress={handleEventPress}
                emptyMessage={
                  allEvents.length === 0
                    ? 'No Future Events'
                    : farAwayEvents.length > 0
                    ? 'No Events Inside Radius'
                    : 'No Future Events'
                }
              />
              {farAwayEvents.length > 0 && (
                <EventsSection
                  events={farAwayEvents}
                  onEventPress={handleEventPress}
                  title="Farther Away"
                />
              )}
              <PastEventsSection pastEvents={pastEvents} onEventPress={handleEventPress} />
            </ContentContainer>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});