import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import ArtistCard from '../ArtistCard';
import { fakeArtistData, type Artist } from '../data/fakedata';

interface PopularArtistsSectionProps {
  onArtistPress: (artist: Artist) => void;
  onFollowPress: (artistId: number, isFollowing: boolean) => void;
  isUserSignedIn: boolean;
}

const PopularArtistsSection: React.FC<PopularArtistsSectionProps> = ({
  onArtistPress,
  onFollowPress,
  isUserSignedIn,
}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Popular artists</Text>
      {fakeArtistData.map((artist: Artist) => (
        <ArtistCard
          key={artist.id}
          artist={artist}
          onPress={() => onArtistPress(artist)}
          onFollowPress={onFollowPress}
          isUserSignedIn={isUserSignedIn}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
});

export default PopularArtistsSection;