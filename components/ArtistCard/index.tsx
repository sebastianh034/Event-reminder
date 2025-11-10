import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { BlurView } from 'expo-blur';
import { type Artist } from '../../types';
import ArtistFollowButton from '../FollowButton';
import * as Haptics from 'expo-haptics';

interface ArtistCardProps {
  artist: Artist;
  onPress?: () => void;
  isUserSignedIn?: boolean;
}

const ArtistCard: React.FC<ArtistCardProps> = ({
  artist,
  onPress,
  isUserSignedIn = false
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
      onPress={handlePress}
    >
      <ImageBackground
        source={{ uri: artist.image }}
        style={styles.imageBackground}
        imageStyle={styles.backgroundImage}
      >
        {/* Frosted glass overlay for text readability */}
        <BlurView intensity={20} tint="dark" style={styles.blurOverlay}>
          {/* Content Container */}
          <View style={styles.cardContent}>
            {/* Left side - Artist Name */}
            <View style={styles.leftContent}>
              <Text style={styles.artistName}>{artist.name}</Text>
            </View>

            {/* Right side - Follow Button (only if signed in) */}
            {isUserSignedIn && (
              <ArtistFollowButton
                artistId={artist.id}
                artistName={artist.name}
                spotifyId={artist.spotifyId}
                genre={artist.genre}
                imageUrl={artist.image}
                followersCount={artist.followers ? parseInt(artist.followers.replace(/,/g, '')) : undefined}
                popularity={artist.popularity}
                bio={artist.bio}
                initialFollowState={artist.isFollowing}
              />
            )}
          </View>
        </BlurView>
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 120,
    borderRadius: 15,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backgroundImage: {
    borderRadius: 15,
    resizeMode: 'cover',
    height: '150%',
    top: '2%',
  },
  fallbackBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: 15,
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 15,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  artistName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  followerCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
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
    textAlign: 'center',
  },
  notFollowingText: {
    color: 'white',
  },
  followingText: {
    color: 'white',
  },
});

export default ArtistCard;