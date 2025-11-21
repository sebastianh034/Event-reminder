import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import * as Notifications from 'expo-notifications';
import { useNotifications } from '../../context/notificationContext';
import {
  getEventsByArtistName,
  getPastEventsByArtistName,
  type Event as SupabaseEvent,
} from '../../utils/eventsService';
import { fetchAndSaveArtistEvents } from '../../utils/eventsAPI';
import { supabase } from '../../utils/supabase';
import { DEFAULT_SEARCH_RADIUS_MILES } from '../../constants';
import { useAuth } from '../../context/authcontext';
import { useFollowedArtists } from '../../context/followedArtistsContext';

export default function ArtistPage() {
  const params = useLocalSearchParams();
  const { id, name, image, followers } = params;
  const { user } = useAuth();
  const { refreshFollowedArtists } = useFollowedArtists();
  const [maxDistance, setMaxDistance] = useState(DEFAULT_SEARCH_RADIUS_MILES);
  const { location, locationEnabled, permissionGranted, refreshLocation } = useLocation();
  const { notificationsEnabled } = useNotifications();
  const [allEvents, setAllEvents] = useState<SupabaseEvent[]>([]);
  const [allPastEvents, setAllPastEvents] = useState<SupabaseEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Create artist object from Spotify data passed through params
  const artist = {
    id: 0, // Temporary numeric ID
    spotifyId: (id as string) || '',
    name: (name as string) || 'Unknown Artist',
    image: (image as string) || 'https://via.placeholder.com/300',
    followers: (followers as string) || '0',
    isFollowing: false, // Will be determined by context in FollowButton
  };

  // Load events when component mounts
  useEffect(() => {
    loadEvents();
  }, [artist.name]);

  // Refresh followed artists context every time the page comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        refreshFollowedArtists();
      }
    }, [user?.id])
  );


  const loadEvents = async () => {
    if (!artist.name) return;

    setLoading(true);
    try {
      // First, try to get events from database
      let upcomingEvents = await getEventsByArtistName(artist.name, true);
      let pastEvents = await getPastEventsByArtistName(artist.name);

      // If no upcoming events found, fetch from Ticketmaster
      if (upcomingEvents.length === 0) {

        // Check if artist exists in database, if not create it
        const { data: existingArtist } = await supabase
          .from('artists')
          .select('id, ticketmaster_id')
          .eq('name', artist.name)
          .single();

        let artistDbId = existingArtist?.id;

        // If artist doesn't exist, create it
        if (!artistDbId) {
          const { data: newArtist } = await supabase
            .from('artists')
            .insert({
              name: artist.name,
              spotify_id: artist.spotifyId,
              image_url: artist.image,
            })
            .select('id')
            .single();
          artistDbId = newArtist?.id;
        }

        // Fetch events from Ticketmaster
        if (artistDbId) {
          const result = await fetchAndSaveArtistEvents(
            artistDbId,
            artist.name,
            existingArtist?.ticketmaster_id
          );

          // Update artist with Ticketmaster ID if we got one
          if (result.ticketmasterId && !existingArtist?.ticketmaster_id) {
            await supabase
              .from('artists')
              .update({ ticketmaster_id: result.ticketmasterId })
              .eq('id', artistDbId);
          }

          // Fetch the newly saved events
          upcomingEvents = await getEventsByArtistName(artist.name, true);
          pastEvents = await getPastEventsByArtistName(artist.name);
        }
      }

      setAllEvents(upcomingEvents);
      setAllPastEvents(pastEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

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

  const handleEventPress = async (event: SupabaseEvent): Promise<void> => {
    // Only send notification if enabled
    if (notificationsEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${event.artist_name} - ${event.status}`,
          body: `${event.venue} • ${event.event_date}\n${event.location}`,
          data: {
            eventId: event.id,
            artist: event.artist_name,
            artistId: event.artist_id
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
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#ffffff"
              />
            }
          >
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