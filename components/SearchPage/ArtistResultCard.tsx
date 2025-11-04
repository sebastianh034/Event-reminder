import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExtendedArtist } from '../../types';
import ArtistFollowButton from '../FollowButton';

interface ArtistResultCardProps {
  artist: ExtendedArtist;
  onPress: (artist: ExtendedArtist) => void;
  onFollowPress?: (artistId: number) => void;
  isFollowed?: boolean;
}

const ArtistResultCard: React.FC<ArtistResultCardProps> = ({
  artist,
  onPress,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.artistCard,
        pressed && styles.artistCardPressed
      ]}
      onPress={() => onPress(artist)}
    >
      <Image source={{ uri: artist.image }} style={styles.artistImage} />
      <View style={styles.artistInfo}>
        <View style={styles.artistHeader}>
          <Text style={styles.artistName}>{artist.name}</Text>
          {artist.verified && (
            <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
          )}
        </View>
        <Text style={styles.artistGenre}>{artist.genre}</Text>
        <Text style={styles.artistFollowers}>{artist.followers} followers</Text>
      </View>
      <ArtistFollowButton
        artistId={artist.id}
        artistName={artist.name}
        spotifyId={artist.spotifyId}
        genre={artist.genre}
        imageUrl={artist.image}
        followersCount={typeof artist.followers === 'string' ? parseInt(artist.followers.replace(/,/g, '')) : undefined}
        popularity={artist.popularity}
        bio={artist.bio}
        initialFollowState={false}
        size="small"
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  artistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  artistCardPressed: {
    backgroundColor: 'rgba(55, 65, 81, 0.9)',
    transform: [{ scale: 0.98 }],
  },
  artistImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6B7280',
  },
  artistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  artistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  artistName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 6,
  },
  artistGenre: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 2,
  },
  artistFollowers: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  followButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  followButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  followButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#3B82F6',
  },
});

export default ArtistResultCard;