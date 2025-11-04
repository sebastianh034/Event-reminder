import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { ExtendedArtist } from '../../types';
import ArtistResultCard from './ArtistResultCard';

interface SimilarArtistsSectionProps {
  similarArtists: ExtendedArtist[];
  followedArtists: Set<number>;
  onArtistPress: (artist: ExtendedArtist) => void;
  onToggleFollow: (artistId: number) => void;
}

const SimilarArtistsSection: React.FC<SimilarArtistsSectionProps> = ({
  similarArtists,
  followedArtists,
  onArtistPress,
  onToggleFollow,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Similar Artists</Text>
      <FlatList
        data={similarArtists}
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

export default SimilarArtistsSection;