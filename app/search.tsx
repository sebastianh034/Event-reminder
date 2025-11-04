import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { searchArtists } from '../utils/spotifyAPI';
import type { ExtendedArtist } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchHeader from '../components/SearchPage/SearchHeader';
import SearchInput from '../components/SearchPage/SearchInput';
import SearchResultsContainer from '../components/SearchPage/SearchResultsContainer';
import SearchResultsSection from '../components/SearchPage/SearchResultsSection';


const ArtistSearchPage: React.FC = () => {
  // Get search params from the URL
  const { query } = useLocalSearchParams();
  const initialQuery = typeof query === 'string' ? query : '';

  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [searchResults, setSearchResults] = useState<ExtendedArtist[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [followedArtists, setFollowedArtists] = useState<Set<number>>(new Set());

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      // Search Spotify for artists
      const spotifyResults = await searchArtists(query, 10);

      // Convert Spotify artists to ExtendedArtist format
      const results: ExtendedArtist[] = spotifyResults.map((spotifyArtist, index) => ({
        id: index + 1000,
        spotifyId: spotifyArtist.id,
        name: spotifyArtist.name,
        genre: spotifyArtist.genres[0] || 'Artist',
        image: spotifyArtist.images[0]?.url || 'https://via.placeholder.com/300',
        followers: spotifyArtist.followers.total.toLocaleString(),
        isFollowing: false,
        verified: spotifyArtist.popularity > 50,
        popularity: spotifyArtist.popularity,
        bio: `${spotifyArtist.name} is a popular artist on Spotify with ${spotifyArtist.followers.total.toLocaleString()} followers.`,
        monthlyListeners: spotifyArtist.followers.total.toLocaleString(),
        topTracks: [],
        upcomingEvents: [],
      }));

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching artists:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleFollow = (artistId: number) => {
    const newFollowed = new Set(followedArtists);
    if (newFollowed.has(artistId)) {
      newFollowed.delete(artistId);
    } else {
      newFollowed.add(artistId);
    }
    setFollowedArtists(newFollowed);
  };

  const handleArtistPress = (artist: ExtendedArtist) => {
    // Pass artist data through route params
    router.push({
      pathname: `/artist/[id]`,
      params: {
        id: artist.spotifyId || artist.id.toString(),
        spotifyId: artist.spotifyId || '',
        name: artist.name,
        image: artist.image,
        genre: artist.genre || '',
        followers: artist.followers,
        bio: artist.bio || '',
        monthlyListeners: artist.monthlyListeners || '',
      }
    });
  };

  // Only search on initial query from URL
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmitSearch = () => {
    handleSearch(searchQuery);
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#1d4ed8']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <SearchHeader />

          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSubmitSearch}
            isSearching={isSearching}
            autoFocus={!!initialQuery}
          />

          <ScrollView style={styles.scrollView}>
            <SearchResultsContainer>
              <SearchResultsSection
                searchResults={searchResults}
                followedArtists={followedArtists}
                onArtistPress={handleArtistPress}
                onToggleFollow={toggleFollow}
                isSearching={isSearching}
              />
            </SearchResultsContainer>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});

export default ArtistSearchPage;