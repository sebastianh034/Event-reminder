import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar, 
  ScrollView,
  Dimensions,
  Pressable,
  Image,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ArtistCard from './ArtistCard';
import { fakeArtistData, type Artist } from './data/fakedata';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width, height } = Dimensions.get('window');
import { useAuth } from './authcontext';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import ProfileHeader from './pfp';

const HomePage: React.FC = () => {
  // Use auth context instead of simulated state
  const { isSignedIn, user, signOut, loading } = useAuth();
  
    useFocusEffect(
    useCallback(() => {
      setSearchQuery('');
    }, [])
  );

  // Search state (but no navigation state needed anymore)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  
  // Ref for TextInput to programmatically focus
  const searchInputRef = useRef<TextInput>(null);

  const handleSignInPress = (): void => {
    console.log("pressed");
    router.push('./signin'); 
  };

  const handleArtistPress = (artist: Artist): void => {
    console.log(`Navigate to ${artist.name} artist page`);
    router.push(`/artist/${artist.id}`);
  };

  const handleFollowPress = (artistId: number, isFollowing: boolean): void => {
    console.log(`${isFollowing ? 'Followed' : 'Unfollowed'} artist ID: ${artistId}`);
  };

  const handleSearchSubmit = (): void => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/search',
        params: { query: searchQuery }
      });
    }
  };

return (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
    
    {/* Main Background Gradient */}
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6', '#1d4ed8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.backgroundGradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                  
        {/* Header Section */}
        <View style={styles.headerSection}>
          <ProfileHeader onSignInPress={handleSignInPress} />
          
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
                  isUserSignedIn={isSignedIn}
                />
              ))}
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  </View>
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
  safeArea: {
    flex: 1,
    marginTop: -3,
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