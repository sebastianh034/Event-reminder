import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { ExtendedArtist } from '../data/ArtistsFakeData';
import ArtistResultCard from './ArtistResultCard';

interface RecommendedArtistsSectionProps {
  artists: ExtendedArtist[];
  followedArtists: Set<number>;
  onArtistPress: (artist: ExtendedArtist) => void;
  onToggleFollow: (artistId: number) => void;
}

const RecommendedArtistsSection: React.FC<RecommendedArtistsSectionProps> = ({
  artists,
  followedArtists,
  onArtistPress,
  onToggleFollow,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recommended Artists</Text>
      <FlatList
        data={artists}
        renderItem={({ item }) => (
          <ArtistResultCard
            artist={item}
            onPress={onArtistPress}
            onFollowPress={onToggleFollow}
            isFollowed={followedArtists.has(item.id)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
});

export default RecommendedArtistsSection;