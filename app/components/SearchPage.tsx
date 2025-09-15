import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
import ArtistPage from './ArtistPage'; // Import your existing ArtistPage
import { Artist, Event, fakeArtistData, fakeConcertData, fakePastEvents } from './data/fakedata';

const { width } = Dimensions.get('window');

interface ExtendedArtist extends Artist {
  genre?: string;
  verified?: boolean;
  bio?: string;
  monthlyListeners?: string;
  topTracks?: string[];
  upcomingEvents?: Event[];
}

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
  function getArtistGenre(name: string): string {
    const genres: Record<string, string> = {
      'Kendrick Lamar': 'Hip-Hop, Rap',
      'Taylor Swift': 'Pop, Country',
      'Drake': 'Hip-Hop, R&B',
      'The Weeknd': 'R&B, Pop',
      'Billie Eilish': 'Pop, Alternative'
    };
    return genres[name] || 'Pop';
  }

  function getArtistBio(name: string): string {
    const bios: Record<string, string> = {
      'Kendrick Lamar': 'Pulitzer Prize-winning rapper and songwriter from Compton, California.',
      'Taylor Swift': 'Grammy-winning singer-songwriter known for narrative songs about her personal life.',
      'Drake': 'Canadian rapper, singer, and actor from Toronto.',
      'The Weeknd': 'Canadian singer, songwriter, and record producer from Toronto.',
      'Billie Eilish': 'American singer-songwriter known for her unique sound and style.'
    };
    return bios[name] || 'Popular recording artist.';
  }

  function getMonthlyListeners(followers: string): string {
    const num = parseFloat(followers.replace('M', ''));
    return `${(num * 15).toFixed(1)}M`;
  }

  function getTopTracks(name: string): string[] {
    const tracks: Record<string, string[]> = {
      'Kendrick Lamar': ['HUMBLE.', 'DNA.', 'Swimming Pools'],
      'Taylor Swift': ['Anti-Hero', 'Lavender Haze', 'Karma'],
      'Drake': ['God\'s Plan', 'In My Feelings', 'Hotline Bling'],
      'The Weeknd': ['Blinding Lights', 'The Hills', 'Can\'t Feel My Face'],
      'Billie Eilish': ['bad guy', 'everything i wanted', 'Happier Than Ever']
    };
    return tracks[name] || ['Popular Song 1', 'Popular Song 2', 'Popular Song 3'];
  }

  // Similar artists recommendations - now as full artist objects
  const similarArtists: Record<string, ExtendedArtist[]> = {
    'Taylor Swift': [
      {
        id: 101,
        name: 'Olivia Rodrigo',
        followers: '3.2M',
        image: 'https://example.com/olivia.jpg',
        isFollowing: false,
        genre: 'Pop, Alternative',
        verified: true,
        bio: 'Grammy-winning singer-songwriter known for emotional pop-rock anthems.',
        monthlyListeners: '48.0M',
        topTracks: ['drivers license', 'good 4 u', 'vampire'],
        upcomingEvents: []
      },
      {
        id: 102,
        name: 'Phoebe Bridgers',
        followers: '1.8M',
        image: 'https://example.com/phoebe.jpg',
        isFollowing: false,
        genre: 'Indie, Folk',
        verified: true,
        bio: 'Indie rock singer-songwriter known for introspective lyrics.',
        monthlyListeners: '27.0M',
        topTracks: ['Motion Sickness', 'Kyoto', 'I Know the End'],
        upcomingEvents: []
      },
      {
        id: 103,
        name: 'Lorde',
        followers: '2.9M',
        image: 'https://example.com/lorde.jpg',
        isFollowing: false,
        genre: 'Pop, Alternative',
        verified: true,
        bio: 'New Zealand singer-songwriter known for alternative pop music.',
        monthlyListeners: '35.5M',
        topTracks: ['Royals', 'Green Light', 'Solar Power'],
        upcomingEvents: []
      }
    ],
    'Kendrick Lamar': [
      {
        id: 104,
        name: 'J. Cole',
        followers: '4.1M',
        image: 'https://example.com/jcole.jpg',
        isFollowing: false,
        genre: 'Hip-Hop, Rap',
        verified: true,
        bio: 'American rapper, singer, and record producer from North Carolina.',
        monthlyListeners: '42.3M',
        topTracks: ['Middle Child', 'No Role Modelz', 'GOMD'],
        upcomingEvents: []
      },
      {
        id: 105,
        name: 'Tyler, The Creator',
        followers: '3.8M',
        image: 'https://example.com/tyler.jpg',
        isFollowing: false,
        genre: 'Hip-Hop, Alternative',
        verified: true,
        bio: 'American rapper, singer, and record producer known for unique style.',
        monthlyListeners: '38.7M',
        topTracks: ['EARFQUAKE', 'See You Again', 'Yonkers'],
        upcomingEvents: []
      }
    ],
    'Drake': [
      {
        id: 106,
        name: 'Future',
        followers: '3.5M',
        image: 'https://example.com/future.jpg',
        isFollowing: false,
        genre: 'Hip-Hop, Trap',
        verified: true,
        bio: 'American rapper, singer, and songwriter from Atlanta.',
        monthlyListeners: '41.2M',
        topTracks: ['Mask Off', 'Life Is Good', 'Jumpman'],
        upcomingEvents: []
      },
      {
        id: 107,
        name: 'Travis Scott',
        followers: '4.7M',
        image: 'https://example.com/travis.jpg',
        isFollowing: false,
        genre: 'Hip-Hop, Trap',
        verified: true,
        bio: 'American rapper, singer, and record producer from Houston.',
        monthlyListeners: '46.8M',
        topTracks: ['SICKO MODE', 'goosebumps', 'Antidote'],
        upcomingEvents: []
      }
    ]
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
    <TouchableOpacity
      style={styles.artistCard}
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
      <TouchableOpacity
        style={[
          styles.followButton,
          followedArtists.has(item.id) && styles.followingButton
        ]}
        onPress={() => toggleFollow(item.id)}
      >
        <Text style={[
          styles.followButtonText,
          followedArtists.has(item.id) && styles.followingButtonText
        ]}>
          {followedArtists.has(item.id) ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

//   const renderEventCard = ({ item }: { item: Event }) => (
//     <View style={styles.eventCard}>
//       <View style={styles.eventInfo}>
//         <Text style={styles.eventVenue}>{item.venue}</Text>
//         <Text style={styles.eventLocation}>
//           <Ionicons name="location-outline" size={14} color="#9CA3AF" />
//           {' '}{item.location}
//         </Text>
//         <Text style={styles.eventDate}>
//           <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
//           {' '}{item.date}
//         </Text>
//       </View>
//       <View style={[styles.eventStatus, { backgroundColor: item.statusColor }]}>
//         <Text style={styles.eventStatusText}>{item.status}</Text>
//       </View>
//     </View>
//   );

  const renderSimilarArtist = ({ item }: { item: ExtendedArtist }) => (
    <TouchableOpacity
      style={styles.artistCard}
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
      <TouchableOpacity
        style={[
          styles.followButton,
          followedArtists.has(item.id) && styles.followingButton
        ]}
        onPress={() => toggleFollow(item.id)}
      >
        <Text style={[
          styles.followButtonText,
          followedArtists.has(item.id) && styles.followingButtonText
        ]}>
          {followedArtists.has(item.id) ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
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
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
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