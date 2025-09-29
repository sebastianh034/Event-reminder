import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { fakeArtistData, fakeConcertData } from '../components/data/fakedata';
import {
  ExtendedArtist,
  similarArtists,
  getArtistGenre,
  getArtistBio,
  getMonthlyListeners,
  getTopTracks
} from '../components/data/ArtistsFakeData';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchHeader from '../components/SearchPage/SearchHeader';
import SearchInput from '../components/SearchPage/SearchInput';
import SearchResultsContainer from '../components/SearchPage/SearchResultsContainer';
import SearchResultsSection from '../components/SearchPage/SearchResultsSection';
import SimilarArtistsSection from '../components/SearchPage/SimilarArtistsSection';
import RecommendedArtistsSection from '../components/SearchPage/RecommendedArtistsSection';
import PopularArtistsSection from '../components/SearchPage/PopularArtistsSection';


const ArtistSearchPage: React.FC = () => {
  // Get search params from the URL
  const { query } = useLocalSearchParams();
  const initialQuery = typeof query === 'string' ? query : '';

  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [searchResults, setSearchResults] = useState<ExtendedArtist[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [followedArtists, setFollowedArtists] = useState<Set<number>>(new Set([2, 4]));

  const extendedArtistData: ExtendedArtist[] = fakeArtistData.map(artist => ({
    ...artist,
    genre: getArtistGenre(artist.name),
    verified: true,
    bio: getArtistBio(artist.name),
    monthlyListeners: getMonthlyListeners(artist.followers),
    topTracks: getTopTracks(artist.name),
    upcomingEvents: fakeConcertData.filter(event => event.artist === artist.name)
  }));

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    setTimeout(() => {
      const results = extendedArtistData.filter(artist =>
        artist.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
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

  const getPopularArtists = () => {
    return extendedArtistData.slice(0, 4);
  };

  const handleArtistPress = (artist: ExtendedArtist) => {
    router.push(`/artist/${artist.id}`);
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);


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
            isSearching={isSearching}
            autoFocus={!!initialQuery}
          />

          <ScrollView style={styles.scrollView}>
            {searchQuery.length > 0 ? (
              <SearchResultsContainer>
                <SearchResultsSection
                  searchResults={searchResults}
                  followedArtists={followedArtists}
                  onArtistPress={handleArtistPress}
                  onToggleFollow={toggleFollow}
                />

                {searchResults.length > 0 && similarArtists[searchResults[0].name] && (
                  <SimilarArtistsSection
                    similarArtists={similarArtists[searchResults[0].name]}
                    followedArtists={followedArtists}
                    onArtistPress={handleArtistPress}
                    onToggleFollow={toggleFollow}
                  />
                )}

                {searchResults.length === 0 && (
                  <RecommendedArtistsSection
                    artists={getPopularArtists()}
                    followedArtists={followedArtists}
                    onArtistPress={handleArtistPress}
                    onToggleFollow={toggleFollow}
                  />
                )}
              </SearchResultsContainer>
            ) : (
              <SearchResultsContainer>
                <PopularArtistsSection
                  artists={getPopularArtists()}
                  followedArtists={followedArtists}
                  onArtistPress={handleArtistPress}
                  onToggleFollow={toggleFollow}
                />
              </SearchResultsContainer>
            )}
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