import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getFollowedArtistsWithDetails, unfollowArtist } from '../../utils/artistService';
import { useFollowedArtists } from '../../context/followedArtistsContext';

interface FollowedArtistsProps {
  userId: string;
}

interface Artist {
  id: string;
  name: string;
  spotify_id: string;
  genre?: string;
  image_url?: string;
  followers_count?: number;
  popularity?: number;
}

const FollowedArtists: React.FC<FollowedArtistsProps> = ({ userId }) => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);
  const { refreshFollowedArtists } = useFollowedArtists();

  useEffect(() => {
    loadFollowedArtists();
  }, [userId]);

  const loadFollowedArtists = async () => {
    setLoading(true);
    try {
      const fetchedArtists = await getFollowedArtistsWithDetails(userId);
      setArtists(fetchedArtists);
    } catch (error) {
      console.error('Error loading followed artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (artist: Artist) => {
    Alert.alert(
      'Unfollow Artist',
      `Are you sure you want to unfollow ${artist.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfollow',
          style: 'destructive',
          onPress: async () => {
            setUnfollowingId(artist.spotify_id);
            try {
              const success = await unfollowArtist(userId, artist.spotify_id);
              if (success) {
                // Remove artist from local state
                setArtists((prev) => prev.filter((a) => a.spotify_id !== artist.spotify_id));
                // Refresh the context
                await refreshFollowedArtists();
              } else {
                Alert.alert('Error', 'Failed to unfollow artist. Please try again.');
              }
            } catch (error) {
              console.error('Error unfollowing artist:', error);
              Alert.alert('Error', 'Failed to unfollow artist. Please try again.');
            } finally {
              setUnfollowingId(null);
            }
          },
        },
      ]
    );
  };

  const handleArtistPress = (artist: Artist) => {
    router.push({
      pathname: `/artist/[id]`,
      params: {
        id: artist.spotify_id,
        name: artist.name,
        image: artist.image_url || '',
        followers: artist.followers_count?.toString() || '0',
      },
    });
  };

  const formatFollowers = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const renderArtistItem = ({ item }: { item: Artist }) => (
    <Pressable
      style={({ pressed }) => [
        styles.artistItem,
        pressed && styles.artistItemPressed,
      ]}
      onPress={() => handleArtistPress(item)}
    >
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/100' }}
        style={styles.artistImage}
        contentFit="cover"
        transition={200}
      />

      <View style={styles.artistInfo}>
        <Text style={styles.artistName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.genre && (
          <Text style={styles.artistGenre} numberOfLines={1}>
            {item.genre}
          </Text>
        )}
        {item.followers_count !== undefined && (
          <View style={styles.followersContainer}>
            <Ionicons name="people-outline" size={14} color="#9CA3AF" />
            <Text style={styles.followersText}>
              {formatFollowers(item.followers_count)} followers
            </Text>
          </View>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.unfollowButton,
          pressed && styles.unfollowButtonPressed,
          unfollowingId === item.spotify_id && styles.unfollowButtonDisabled,
        ]}
        onPress={(e) => {
          e.stopPropagation();
          handleUnfollow(item);
        }}
        disabled={unfollowingId === item.spotify_id}
      >
        {unfollowingId === item.spotify_id ? (
          <ActivityIndicator size="small" color="#EF4444" />
        ) : (
          <Ionicons name="person-remove-outline" size={20} color="#EF4444" />
        )}
      </Pressable>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading followed artists...</Text>
      </View>
    );
  }

  if (artists.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="musical-notes-outline" size={64} color="#6B7280" />
        <Text style={styles.emptyText}>No followed artists</Text>
        <Text style={styles.emptySubtext}>
          Start following artists to see them here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={artists}
        renderItem={renderArtistItem}
        keyExtractor={(item) => item.spotify_id}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#E5E7EB',
    fontSize: 16,
    marginTop: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  listContainer: {
    paddingVertical: 8,
  },
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  artistItemPressed: {
    opacity: 0.7,
  },
  artistImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  artistInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  artistName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  artistGenre: {
    color: '#9CA3AF',
    fontSize: 13,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  followersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  followersText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  unfollowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unfollowButtonPressed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    transform: [{ scale: 0.95 }],
  },
  unfollowButtonDisabled: {
    opacity: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
});

export default FollowedArtists;
