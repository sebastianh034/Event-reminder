import React, { useState } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { PressableStateCallbackType } from "react-native";
import * as Haptics from 'expo-haptics';


interface ArtistFollowButtonProps {
  artistId: number;
  artistName: string;
  initialFollowState: boolean;
  onFollowChange?: (artistId: number, isFollowing: boolean) => void;
  style?: object;
  size?: 'small' | 'medium' | 'large';
}

const ArtistFollowButton: React.FC<ArtistFollowButtonProps> = ({ 
  artistId,
  artistName,
  initialFollowState,
  onFollowChange,
  style,
  size = 'medium'
}) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowState);

  const handlePress = () => {
    const newFollowState = !isFollowing;

    // Success haptic when following, light impact when unfollowing
    if (newFollowState) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsFollowing(newFollowState);

    // Log the action
    console.log(`${newFollowState ? 'Followed' : 'Unfollowed'} ${artistName}`);

    // Call the optional callback
    if (onFollowChange) {
      onFollowChange(artistId, newFollowState);
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
        pressed && styles.followButtonPressed
      ]}
      onPress={handlePress}
    >
      <Text style={[
        styles.followText,
        sizeStyles.text,
        isFollowing ? styles.followingText : styles.notFollowingText
      ]}>
        {isFollowing ? 'Following' : 'Follow'}
      </Text>
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