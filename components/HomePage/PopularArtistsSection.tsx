import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import ArtistCard from '../ArtistCard';
import ArtistCardSkeleton from '../skeletons/ArtistCardSkeleton';
import { type Artist } from '../data/fakedata';
import { searchArtists } from '../../utils/spotifyAPI';

interface PopularArtistsSectionProps {
  onArtistPress: (artist: Artist) => void;
  isUserSignedIn: boolean;
}

const PopularArtistsSection: React.FC<PopularArtistsSectionProps> = ({
  onArtistPress,
  isUserSignedIn,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    loadPopularArtists();
  }, []);

  const loadPopularArtists = async () => {
    setIsLoading(true);
    try {
      // Search for some popular artists to display
      const popularSearches = ['Drake', 'Taylor Swift', 'The Weeknd', 'Bad Bunny', 'Ariana Grande'];
      const randomArtist = popularSearches[Math.floor(Math.random() * popularSearches.length)];

      // Get artists from Spotify
      const spotifyResults = await searchArtists(randomArtist, 5);

      // Convert to Artist format
      const convertedArtists: Artist[] = spotifyResults.map((spotifyArtist, index) => ({
        id: index + 1000,
        spotifyId: spotifyArtist.id,
        name: spotifyArtist.name,
        image: spotifyArtist.images[0]?.url || 'https://via.placeholder.com/300',
        followers: spotifyArtist.followers.total.toLocaleString(),
        isFollowing: false,
        genre: spotifyArtist.genres[0],
        popularity: spotifyArtist.popularity,
      }));

      setArtists(convertedArtists);
    } catch (error) {
      console.error('Error loading popular artists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Popular artists</Text>
      {isLoading ? (
        // Show skeleton cards while loading
        <>
          <ArtistCardSkeleton />
          <ArtistCardSkeleton />
          <ArtistCardSkeleton />
        </>
      ) : (
        // Show real Spotify artists
        artists.map((artist: Artist) => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            onPress={() => onArtistPress(artist)}
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