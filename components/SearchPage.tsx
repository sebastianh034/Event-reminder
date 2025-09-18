import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Artist, Event, fakeArtistData, fakeConcertData, fakePastEvents } from './data/fakedata';
import { 
  ExtendedArtist, 
  similarArtists,
  getArtistGenre,
  getArtistBio,
  getMonthlyListeners,
  getTopTracks
} from './data/ArtistsFakeData'; 
import BackButton from './backbutton';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

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

  const renderArtistCard = ({ item }: { item: ExtendedArtist }) => (
    <Pressable
      style={({ pressed }) => [
        styles.artistCard,
        pressed && styles.artistCardPressed
      ]}
      onPress={() => handleArtistPress(item)}
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
        onPress={(e) => {
          e.stopPropagation();
          toggleFollow(item.id);
        }}
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
      onPress={() => handleArtistPress(item)}
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
        onPress={(e) => {
          e.stopPropagation();
          toggleFollow(item.id);
        }}
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#1d4ed8']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <BackButton/>
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
                autoFocus={!!initialQuery}
              />
              {isSearching && (
                <ActivityIndicator size="small" color="#9CA3AF" style={styles.loadingIcon} />
              )}
            </View>
          </View>

          <ScrollView style={styles.scrollView}>
            {searchQuery.length > 0 ? (
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