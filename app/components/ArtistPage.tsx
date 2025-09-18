import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Pressable,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import EventCard from './EventCard';
import { type Artist, type Event } from '../components/data/fakedata';

const { width, height } = Dimensions.get('window');

interface ArtistPageProps {
  artist: Artist;
  events?: Event[];
  pastEvents?: Event[];
  onBackPress?: () => void;
  isUserSignedIn?: boolean;
}

const ArtistPage: React.FC<ArtistPageProps> = ({
  artist,
  events = [],
  pastEvents = [],
  onBackPress,
  isUserSignedIn = false,
}) => {
  const [isFollowing, setIsFollowing] = useState(artist.isFollowing);

  const handleFollowPress = (): void => {
    setIsFollowing(!isFollowing);
    console.log(`${!isFollowing ? 'Followed' : 'Unfollowed'} ${artist.name}`);
  };

  const handleEventPress = (event: Event): void => {
    console.log(`Pressed ${event.artist} event on ${event.date}`);
  };

  const fallbackColors = [
    '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'
  ];
  const fallbackColor = fallbackColors[artist.id % fallbackColors.length];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#1d4ed8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Artist Profile Header */}
          <View style={styles.profileHeader}>
            {/* Back Button */}
            <Pressable 
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed
              ]}
              onPress={onBackPress}
            >
              <Text style={styles.backButtonText}>←</Text>
            </Pressable>

            {/* Artist Image/Info */}
            <View style={styles.artistImageContainer}>
              {artist.image ? (
                <ImageBackground
                  source={{ uri: artist.image }}
                  style={styles.artistImage}
                  imageStyle={styles.artistImageStyle}
                >
                  <View style={styles.artistOverlay} />
                  <View style={styles.artistInfo}>
                    <View style={styles.artistNameRow}>
                      <Text style={styles.artistName}>{artist.name}</Text>
                    </View>
                    <View style={styles.bottomRow}>
                      {/* Follow Button - positioned to the bottom right */}
                      {isUserSignedIn && (
                        <Pressable 
                          style={({ pressed }) => [
                            styles.followButtonInline,
                            isFollowing ? styles.followingButton : styles.notFollowingButton,
                            pressed && styles.followButtonPressed
                          ]}
                          onPress={handleFollowPress}
                        >
                          <Text style={[
                            styles.followText,
                            isFollowing ? styles.followingText : styles.notFollowingText
                          ]}>
                            {isFollowing ? 'Following' : 'Follow'}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </ImageBackground>
              ) : (
                <View style={[styles.artistImage, { backgroundColor: fallbackColor }]}>
                  <View style={styles.artistInfo}>
                    <View style={styles.artistNameRow}>
                      <Text style={styles.artistName}>{artist.name}</Text>
                    </View>
                    <View style={styles.bottomRow}>
                      {/* Follow Button - positioned to the bottom right */}
                      {isUserSignedIn && (
                        <Pressable 
                          style={({ pressed }) => [
                            styles.followButtonInline,
                            isFollowing ? styles.followingButton : styles.notFollowingButton,
                            pressed && styles.followButtonPressed
                          ]}
                          onPress={handleFollowPress}
                        >
                          <Text style={[
                            styles.followText,
                            isFollowing ? styles.followingText : styles.notFollowingText
                          ]}>
                            {isFollowing ? 'Following' : 'Follow'}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Content Container */}
          <View style={styles.contentContainer}>
            
            {/* Events Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Events</Text>
              
              {events.length > 0 ? (
                events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onPress={() => handleEventPress(event)}
                  />
                ))
              ) : (
                <View style={styles.noEventsContainer}>
                  <Text style={styles.noEventsText}>No Future Events</Text>
                </View>
              )}
            </View>

            {/* Past Events Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Past Events</Text>
              
              {pastEvents.length > 0 ? (
                pastEvents.map((event) => (
                  <EventCard
                    key={`past-${event.id}`}
                    event={event}
                    onPress={() => handleEventPress(event)}
                  />
                ))
              ) : (
                <View style={styles.noEventsContainer}>
                  <Text style={styles.noEventsText}>No Past Events</Text>
                </View>
              )}
            </View>

          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
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
  scrollContainer: {
    flex: 1,
  },
  profileHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
  },
  backButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  artistImageContainer: {
    marginBottom: 20,
  },
  artistImage: {
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  artistImageStyle: {
    borderRadius: 15,
  },
  artistOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  artistInfo: {
    padding: 20,
    justifyContent: 'space-between',
    height: '100%',
  },
  artistNameRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  artistName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  locationInfo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  followButtonInline: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
    marginLeft: 12,
  },
  followButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  notFollowingButton: {
    backgroundColor: '#3B82F6',
  },
  followingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  followText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notFollowingText: {
    color: 'white',
  },
  followingText: {
    color: 'white',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
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

export default ArtistPage;