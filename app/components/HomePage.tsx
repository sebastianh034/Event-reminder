import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ArtistCard from './ArtistCard';
import ArtistPage from './ArtistPage';
import ArtistSearchPage from './SearchPage'; // Import your search page
import { fakeArtistData, fakeConcertData, fakePastEvents, type Artist, type Event } from './data/fakedata';

const { width, height } = Dimensions.get('window');

const HomePage: React.FC = () => {
  // For now, we'll simulate user not being signed in
  const isUserSignedIn = true; // Change this to true to show follow buttons
  
  // Navigation state
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [showSearchPage, setShowSearchPage] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  
  // Ref for TextInput to programmatically focus
  const searchInputRef = useRef<TextInput>(null);

  const handleSignInPress = (): void => {
    console.log('Sign In pressed!');
  };

  const handleArtistPress = (artist: Artist): void => {
    console.log(`Navigate to ${artist.name} artist page`);
    setSelectedArtist(artist);
  };

  const handleBackPress = (): void => {
    setSelectedArtist(null);
  };

  const handleSearchBackPress = (): void => {
    setShowSearchPage(false);
    setSearchQuery(''); // Clear search when going back
  };

  const handleFollowPress = (artistId: number, isFollowing: boolean): void => {
    console.log(`${isFollowing ? 'Followed' : 'Unfollowed'} artist ID: ${artistId}`);
  };

  const handleSearchSubmit = (): void => {
    if (searchQuery.trim()) {
      setShowSearchPage(true);
    }
  };

  // Filter events for the selected artist
  const getArtistEvents = (artistName: string): Event[] => {
    return fakeConcertData.filter(event => event.artist === artistName);
  };

  // Filter past events for the selected artist
  const getArtistPastEvents = (artistName: string): Event[] => {
    return fakePastEvents.filter(event => event.artist === artistName);
  };

  // Show search page if user has searched
  if (showSearchPage) {
    return (
      <ArtistSearchPage 
        initialSearchQuery={searchQuery}
        onBackPress={handleSearchBackPress}
      />
    );
  }

  // If an artist is selected, show their page
  if (selectedArtist) {
    const artistEvents = getArtistEvents(selectedArtist.name);
    const artistPastEvents = getArtistPastEvents(selectedArtist.name);
    
    return (
      <ArtistPage
        artist={selectedArtist}
        events={artistEvents}
        pastEvents={artistPastEvents} // Now passing real past events data
        isUserSignedIn={isUserSignedIn}
        onBackPress={handleBackPress}
      />
    );
  }

  // Otherwise, show the homepage
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Main Background Gradient */}
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#1d4ed8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Header Section */}
          <View style={styles.headerSection}>
            {/* Top row with Sign In button */}
            <View style={styles.headerTopRow}>
              <View style={styles.spacer} />
              <TouchableOpacity 
                style={styles.signInButton}
                onPress={handleSignInPress}
                activeOpacity={0.8}
              >
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            </View>
            
            {/* Title */}
            <Text style={styles.mainTitle}>Never miss your</Text>
            <Text style={styles.mainTitle}>favorite artists again</Text>
          </View>

          {/* Interactive Search Bar */}
          <View style={styles.searchContainer}>
            <View 
              style={[
                styles.searchBar,
                isSearchFocused && styles.searchBarFocused
              ]}
            >
              <Ionicons 
                name="search" 
                size={20} 
                color="rgba(255, 255, 255, 0.7)" 
                style={styles.searchIcon} 
              />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search for Artists"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Content Sections Container */}
          <View style={styles.contentContainer}>
            
            {/* Popular Artists Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Popular artists</Text>
              
              {/* Artist Cards */}
              {fakeArtistData.map((artist: Artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onPress={() => handleArtistPress(artist)}
                  onFollowPress={handleFollowPress}
                  isUserSignedIn={isUserSignedIn}
                />
              ))}
            </View>

          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    width: '100%',
  },
  spacer: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 38,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(20px)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBarFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowOpacity: 0.4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  signInButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 80,
  },
  signInText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
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

export default HomePage;