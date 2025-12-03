import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ArtistHeader from '../../components/ArtistPage/ArtistHeader';
import ContentContainer from '../../components/ArtistPage/ContentContainer';
import EventsSection from '../../components/ArtistPage/EventsSection';
import PastEventsSection from '../../components/ArtistPage/PastEventsSection';
import DistanceFilter from '../../components/ArtistPage/DistanceFilter';
import { useLocation } from '../../context/locationContext';
import { filterEventsByDistance } from '../../utils/distance';
import { type Event as SupabaseEvent } from '../../utils/eventsService';
import { DEFAULT_SEARCH_RADIUS_MILES } from '../../constants';
import { useArtistEvents } from '../../hooks/useArtistEvents';

export default function ArtistPage() {
  const params = useLocalSearchParams();
  const { id, name, image, followers } = params;
  const [maxDistance, setMaxDistance] = useState(DEFAULT_SEARCH_RADIUS_MILES);
  const { location, locationEnabled, permissionGranted, refreshLocation } = useLocation();

  const artist = useMemo(() => ({
    name: (name as string) || 'Unknown Artist',
    spotifyId: (id as string) || '',
    image: (image as string) || 'https://via.placeholder.com/300',
  }), [name, id, image]);

  const artistForHeader = useMemo(() => ({
    id: 0,
    spotifyId: (id as string) || '',
    name: (name as string) || 'Unknown Artist',
    image: (image as string) || 'https://via.placeholder.com/300',
    followers: (followers as string) || '0',
    isFollowing: false,
  }), [id, name, image, followers]);

  const { allEvents, allPastEvents, loading, refreshing, refreshEvents } = useArtistEvents(artist);

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

  const handleEventPress = (event: SupabaseEvent): void => {
    // Event press handler - can be used for navigation or other actions in the future
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
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshEvents}
                tintColor="#ffffff"
              />
            }
          >
            <ArtistHeader artist={artistForHeader} isUserSignedIn={true} />

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
                loading={loading}
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
              <PastEventsSection
                pastEvents={pastEvents}
                onEventPress={handleEventPress}
                loading={loading}
              />
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