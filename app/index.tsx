import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { type Artist } from '../components/data/fakedata';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/authcontext';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import HeaderSection from '../components/HomePage/HeaderSection';
import SearchBar from '../components/HomePage/SearchBar';
import ContentContainer from '../components/HomePage/ContentContainer';
import PopularArtistsSection from '../components/HomePage/PopularArtistsSection';

const HomePage: React.FC = () => {
  // Use auth context instead of simulated state
  const { isSignedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');

  useFocusEffect(
    useCallback(() => {
      setSearchQuery('');
    }, [])
  );

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

      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#1d4ed8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <HeaderSection onSignInPress={handleSignInPress} />

            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
            />

            <ContentContainer>
              <PopularArtistsSection
                onArtistPress={handleArtistPress}
                onFollowPress={handleFollowPress}
                isUserSignedIn={isSignedIn}
              />
            </ContentContainer>
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
});

export default HomePage;