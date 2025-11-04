import React from 'react';
import {
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { ExtendedArtist } from '../../types';
import ArtistResultCard from './ArtistResultCard';

interface ArtistListSectionProps {
  artists: ExtendedArtist[];
  followedArtists: Set<number>;
  onArtistPress: (artist: ExtendedArtist) => void;
  onToggleFollow: (artistId: number) => void;
}

const ArtistListSection: React.FC<ArtistListSectionProps> = ({
  artists,
  followedArtists,
  onArtistPress,
  onToggleFollow,
}) => {
  return (
    <>
      <Text style={styles.sectionTitle}>Popular Artists</Text>
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
    </>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
});

export default ArtistListSection;