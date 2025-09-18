import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { type Artist } from './data/fakedata';
import ArtistFollowButton from './FollowButton';

interface ArtistCardProps {
  artist: Artist;
  onPress?: () => void;
  onFollowPress?: (artistId: number, isFollowing: boolean) => void;
  isUserSignedIn?: boolean; 
}

const ArtistCard: React.FC<ArtistCardProps> = ({ 
  artist, 
  onPress, 
  onFollowPress, 
  isUserSignedIn = false 
}) => {
  const [isFollowing, setIsFollowing] = useState(artist.isFollowing);

  const handleFollowPress = (event: any): void => {
    event.stopPropagation(); 
    const newFollowState = !isFollowing;
    setIsFollowing(newFollowState);
    onFollowPress?.(artist.id, newFollowState);
  };

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
      onPress={onPress}
    >
      <ImageBackground
        source={{ uri: artist.image }}
        style={styles.imageBackground}
        imageStyle={styles.backgroundImage}
      >
        {/* Dark overlay for text readability */}
        <View style={styles.overlay} />
        
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
              initialFollowState={artist.isFollowing}
              onFollowChange={(id, isFollowing) => {
                // Optional: Handle follow state changes
                console.log(`Artist ${id} follow state: ${isFollowing}`);
              }}
            />
          )}
        </View>
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
  },
  fallbackBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: 15,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
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