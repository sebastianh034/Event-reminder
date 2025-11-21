import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { Artist } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/authcontext';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useNotifications } from '../context/notificationContext';
import { useFollowedArtists } from '../context/followedArtistsContext';
import HeaderSection from '../components/HomePage/HeaderSection';
import SearchBar from '../components/HomePage/SearchBar';
import ContentContainer from '../components/HomePage/ContentContainer';
import PopularArtistsSection from '../components/HomePage/PopularArtistsSection';
import SwipeableContent from '../components/HomePage/SwipeableContent';
import FollowingEventsSection from '../components/HomePage/FollowingEventsSection';
import { getFollowedArtistsEvents, type Event as SupabaseEvent } from '../utils/eventsService';

const HomePage: React.FC = () => {
  // Use auth context instead of simulated state
  const { isSignedIn, user } = useAuth();
  const { notificationsEnabled } = useNotifications();
  const { refreshFollowedArtists } = useFollowedArtists();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [events, setEvents] = useState<SupabaseEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load events when user signs in or page focuses
  useFocusEffect(
    useCallback(() => {
      setSearchQuery('');
      if (isSignedIn && user?.id) {
        loadEvents();
        // Refresh followed artists to ensure follow buttons show correct state
        refreshFollowedArtists();
      }
    }, [isSignedIn, user?.id])
  );

  const loadEvents = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const fetchedEvents = await getFollowedArtistsEvents(user.id);
      setEvents(fetchedEvents);
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

  const handleSignInPress = (): void => {
    router.push('./signin');
  };

  const handleArtistPress = (artist: Artist): void => {
    router.push({
      pathname: `/artist/[id]`,
      params: {
        id: artist.id.toString(),
        spotifyId: artist.id.toString(),
        name: artist.name,
        image: artist.image,
        followers: artist.followers,
      }
    });
  };

  const handleSearchSubmit = (): void => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/search',
        params: { query: searchQuery }
      });
    }
  };

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
        trigger: null,
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
            <HeaderSection onSignInPress={handleSignInPress} />

            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
            />

            <ContentContainer>
              {isSignedIn ? (
                <SwipeableContent>
                  <FollowingEventsSection
                    events={events}
                    loading={loading}
                    onEventPress={handleEventPress}
                  />
                  <PopularArtistsSection
                    onArtistPress={handleArtistPress}
                    isUserSignedIn={isSignedIn}
                  />
                </SwipeableContent>
              ) : (
                <PopularArtistsSection
                  onArtistPress={handleArtistPress}
                  isUserSignedIn={isSignedIn}
                />
              )}
            </ContentContainer>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  backgroundGradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    marginTop: -3,
  },
  scrollContainer: {
    flex: 1,
  },
});

export default HomePage;