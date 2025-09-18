import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ArtistPage from './ArtistPage';
import { Artist, Event, fakeArtistData, fakeConcertData, fakePastEvents } from './data/fakedata';
import { 
  ExtendedArtist, 
  similarArtists,
  getArtistGenre,
  getArtistBio,
  getMonthlyListeners,
  getTopTracks
} from './data/ArtistsFakeData';

const { width } = Dimensions.get('window');

interface ArtistSearchPageProps {
  initialSearchQuery?: string;
  onBackPress?: () => void;
}

const ArtistSearchPage: React.FC<ArtistSearchPageProps> = ({ 
  initialSearchQuery = '', 
  onBackPress 
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [searchResults, setSearchResults] = useState<ExtendedArtist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<ExtendedArtist | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [followedArtists, setFollowedArtists] = useState<Set<number>>(new Set([2, 4])); // Taylor Swift and The Weeknd

  // Extended artist data with additional details for profiles
  const extendedArtistData: ExtendedArtist[] = fakeArtistData.map(artist => ({
    ...artist,
    genre: getArtistGenre(artist.name),
    verified: true,
    bio: getArtistBio(artist.name),
    monthlyListeners: getMonthlyListeners(artist.followers),
    topTracks: getTopTracks(artist.name),
    upcomingEvents: fakeConcertData.filter(event => event.artist === artist.name)
  }));

  // Helper functions to get artist events
  const getArtistEvents = (artistName: string): Event[] => {
    return fakeConcertData.filter(event => event.artist === artistName);
  };

  const getArtistPastEvents = (artistName: string): Event[] => {
    return fakePastEvents.filter(event => event.artist === artistName);
  };

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

  // Search when query changes or when component mounts with initial query
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Handle initial search query
  useEffect(() => {
    if (initialSearchQuery) {
      handleSearch(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const renderArtistCard = ({ item }: { item: ExtendedArtist }) => (
    <Pressable
      style={({ pressed }) => [
        styles.artistCard,
        pressed && styles.artistCardPressed
      ]}
      onPress={() => setSelectedArtist(item)}
    >
      <Image source={{ uri: item.image }} style={styles.artistImage} />
      <View style={styles.artistInfo}>
        <View style={styles.artistHeader}>
          <Text style={styles.artistName}>{item.name}</Text>
          {item.verified && (
            <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
          )}
        </View>
        <Text style={styles.artistGenre}>{item.genre}</Text>
        <Text style={styles.artistFollowers}>{item.followers} followers</Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.followButton,
          followedArtists.has(item.id) && styles.followingButton,
          pressed && styles.followButtonPressed
        ]}
        onPress={() => toggleFollow(item.id)}
      >
        <Text style={[
          styles.followButtonText,
          followedArtists.has(item.id) && styles.followingButtonText
        ]}>
          {followedArtists.has(item.id) ? 'Following' : 'Follow'}
        </Text>
      </Pressable>
    </Pressable>
  );

  const renderSimilarArtist = ({ item }: { item: ExtendedArtist }) => (
    <Pressable
      style={({ pressed }) => [
        styles.artistCard,
        pressed && styles.artistCardPressed
      ]}
      onPress={() => setSelectedArtist(item)}
    >
      <Image source={{ uri: item.image }} style={styles.artistImage} />
      <View style={styles.artistInfo}>
        <View style={styles.artistHeader}>
          <Text style={styles.artistName}>{item.name}</Text>
          {item.verified && (
            <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
          )}
        </View>
        <Text style={styles.artistGenre}>{item.genre}</Text>
        <Text style={styles.artistFollowers}>{item.followers} followers</Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.followButton,
          followedArtists.has(item.id) && styles.followingButton,
          pressed && styles.followButtonPressed
        ]}
        onPress={() => toggleFollow(item.id)}
      >
        <Text style={[
          styles.followButtonText,
          followedArtists.has(item.id) && styles.followingButtonText
        ]}>
          {followedArtists.has(item.id) ? 'Following' : 'Follow'}
        </Text>
      </Pressable>
    </Pressable>
  );

  // Show your existing ArtistPage if an artist is selected
  if (selectedArtist) {
    const artistEvents = getArtistEvents(selectedArtist.name);
    const artistPastEvents = getArtistPastEvents(selectedArtist.name);
    
    return (
      <ArtistPage
        artist={selectedArtist}
        events={artistEvents}
        pastEvents={artistPastEvents}
        isUserSignedIn={true}
        onBackPress={() => setSelectedArtist(null)}
      />
    );
  }

  // Main Search View
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#1d4ed8']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed
            ]}
            onPress={onBackPress}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>Search Artists</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for Artists"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={!!initialSearchQuery}
            />
            {isSearching && (
              <ActivityIndicator size="small" color="#9CA3AF" style={styles.loadingIcon} />
            )}
          </View>
        </View>

        <ScrollView style={styles.scrollView}>
          {searchQuery.length > 0 ? (
            /* Search Results */
            <View style={styles.resultsContainer}>
              <Text style={styles.sectionTitle}>
                {searchResults.length > 0 ? 'Search Results' : 'No Results Found'}
              </Text>
              
              {searchResults.length > 0 && (
                <FlatList
                  data={searchResults}
                  renderItem={renderArtistCard}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              )}

              {/* Show similar artists if searching for popular artist */}
              {searchResults.length > 0 && similarArtists[searchResults[0].name] && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Similar Artists</Text>
                  <FlatList
                    data={similarArtists[searchResults[0].name]}
                    renderItem={renderSimilarArtist}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                  />
                </View>
              )}

              {/* Recommended Artists if no results */}
              {searchResults.length === 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recommended Artists</Text>
                  <FlatList
                    data={getPopularArtists()}
                    renderItem={renderArtistCard}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                  />
                </View>
              )}
            </View>
          ) : (
            /* Popular Artists */
            <View style={styles.resultsContainer}>
              <Text style={styles.sectionTitle}>Popular Artists</Text>
              <FlatList
                data={getPopularArtists()}
                renderItem={renderArtistCard}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  backButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  loadingIcon: {
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  resultsContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
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
  section: {
    marginTop: 24,
  },
});

export default ArtistSearchPage;