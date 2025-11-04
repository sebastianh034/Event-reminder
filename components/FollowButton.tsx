import React, { useState } from 'react';
import { Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { followArtist, unfollowArtist } from '../utils/artistService';
import { useAuth } from '../context/authcontext';
import { useFollowedArtists } from '../context/followedArtistsContext';
import { router } from 'expo-router';


interface ArtistFollowButtonProps {
  artistId: number;
  artistName: string;
  spotifyId?: string;
  genre?: string;
  imageUrl?: string;
  followersCount?: number;
  popularity?: number;
  bio?: string;
  initialFollowState: boolean;
  onFollowChange?: (artistId: number, isFollowing: boolean) => void;
  style?: object;
  size?: 'small' | 'medium' | 'large';
}

const ArtistFollowButton: React.FC<ArtistFollowButtonProps> = ({
  artistId,
  artistName,
  spotifyId,
  genre,
  imageUrl,
  followersCount,
  popularity,
  bio,
  initialFollowState,
  onFollowChange,
  style,
  size = 'medium'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { isFollowing: isFollowingFromContext, addFollowedArtist, removeFollowedArtist } = useFollowedArtists();

  // Check if following from context (real-time state)
  const isFollowing = spotifyId ? isFollowingFromContext(spotifyId) : initialFollowState;

  const handlePress = async () => {
    if (isLoading) return;

    // If user is not signed in, prompt them to create an account
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'You need to create an account or sign in to follow artists.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/signin') }
        ]
      );
      return;
    }

    const newFollowState = !isFollowing;
    setIsLoading(true);

    try {
      let success = false;

      if (newFollowState) {
        // Follow the artist
        if (!spotifyId) {
          console.error('Cannot follow artist: Spotify ID is missing');
          return;
        }

        success = await followArtist(user.id, {
          name: artistName,
          spotifyId: spotifyId,
          genre: genre,
          imageUrl: imageUrl,
          followersCount: followersCount,
          popularity: popularity,
          bio: bio,
        });

        if (success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        // Unfollow the artist
        if (!spotifyId) {
          console.error('Cannot unfollow artist: Spotify ID is missing');
          return;
        }

        success = await unfollowArtist(user.id, spotifyId);

        if (success) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }

      if (success) {
        // Update the context
        if (newFollowState && spotifyId) {
          addFollowedArtist(spotifyId);
        } else if (!newFollowState && spotifyId) {
          removeFollowedArtist(spotifyId);
        }

        // Call the optional callback
        if (onFollowChange) {
          onFollowChange(artistId, newFollowState);
        }
      }
    } catch (error) {
      console.error('Error in handlePress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get size-specific styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          button: styles.smallButton,
          text: styles.smallText,
        };
      case 'large':
        return {
          button: styles.largeButton,
          text: styles.largeText,
        };
      default: // medium
        return {
          button: styles.mediumButton,
          text: styles.mediumText,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.followButton,
        sizeStyles.button,
        isFollowing ? styles.followingButton : styles.notFollowingButton,
        style,
        pressed && styles.followButtonPressed,
        isLoading && styles.disabled
      ]}
      onPress={handlePress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text style={[
          styles.followText,
          sizeStyles.text,
          isFollowing ? styles.followingText : styles.notFollowingText
        ]}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  followButton: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  disabled: {
    opacity: 0.6,
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
    fontWeight: '600',
    textAlign: 'center',
  },
  notFollowingText: {
    color: 'white',
  },
  followingText: {
    color: 'white',
  },
  // Small size
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 60,
  },
  smallText: {
    fontSize: 12,
  },
  // Medium size
  mediumButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    minWidth: 80,
  },
  mediumText: {
    fontSize: 14,
  },
  // Large size
  largeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    minWidth: 100,
  },
  largeText: {
    fontSize: 16,
  },
});

export default ArtistFollowButton;