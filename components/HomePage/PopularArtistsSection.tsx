import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import ArtistCard from '../ArtistCard';
import ArtistCardSkeleton from '../skeletons/ArtistCardSkeleton';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay to test skeleton screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Popular artists</Text>
      {isLoading ? (
        // Show 3 skeleton cards while loading
        <>
          <ArtistCardSkeleton />
          <ArtistCardSkeleton />
          <ArtistCardSkeleton />
        </>
      ) : (
        // Show actual data after loading
        fakeArtistData.map((artist: Artist) => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            onPress={() => onArtistPress(artist)}
            onFollowPress={onFollowPress}
            isUserSignedIn={isUserSignedIn}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
});

export default PopularArtistsSection;