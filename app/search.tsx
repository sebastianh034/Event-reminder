import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import type { ExtendedArtist } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchHeader from '../components/SearchPage/SearchHeader';
import SearchInput from '../components/SearchPage/SearchInput';
import SearchResultsContainer from '../components/SearchPage/SearchResultsContainer';
import SearchResultsSection from '../components/SearchPage/SearchResultsSection';
import { useArtistSearch } from '../hooks/useArtistSearch';


const ArtistSearchPage: React.FC = () => {
  const { query } = useLocalSearchParams();
  const initialQuery = typeof query === 'string' ? query : '';

  const { searchQuery, setSearchQuery, searchResults, isSearching, handleSearch } = useArtistSearch(initialQuery);

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
                onArtistPress={handleArtistPress}
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