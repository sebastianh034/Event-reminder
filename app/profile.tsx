import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/authcontext';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import BackButton from '../components/BackButton';
import ProfileCard from '../components/Profile/ProfileCard';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ConnectedAppButton from '../components/Profile/ConnectedAppButton';
import ActionButton from '../components/Profile/ActionButton';
import EventsCalendar from '../components/EventsCalendar';
import FollowedArtists from '../components/FollowedArtists';
import SpotifyArtistSelector from '../components/SpotifyArtistSelector';
import { connectSpotify, fetchFollowedArtists } from '../utils/spotifyOAuth';
import {
  isSpotifyConnected,
  saveSpotifyConnection,
  disconnectSpotify,
} from '../utils/spotifyConnectionService';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [appleMusicConnected, setAppleMusicConnected] = useState(false);
  const [showArtistSelector, setShowArtistSelector] = useState(false);
  const [spotifyArtists, setSpotifyArtists] = useState<any[]>([]);
  const [connectingSpotify, setConnectingSpotify] = useState(false);

  // Check Spotify connection status on mount
  useEffect(() => {
    if (user?.id) {
      checkSpotifyConnection();
    }
  }, [user?.id]);

  const checkSpotifyConnection = async () => {
    if (!user?.id) return;
    const connected = await isSpotifyConnected(user.id);
    setSpotifyConnected(connected);
  };

  const handleEditProfile = () => {
    router.push('/editprofile');
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Change password functionality coming soon!');
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleConnectSpotify = async () => {
    if (spotifyConnected) {
      // Handle disconnect
      Alert.alert('Disconnect Spotify', 'Are you sure you want to disconnect your Spotify account?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;
            const success = await disconnectSpotify(user.id);
            if (success) {
              setSpotifyConnected(false);
              Alert.alert('Disconnected', 'Your Spotify account has been disconnected.');
            } else {
              Alert.alert('Error', 'Failed to disconnect Spotify. Please try again.');
            }
          },
        },
      ]);
    } else {
      // Handle connect
      if (!user?.id) {
        Alert.alert('Error', 'You must be signed in to connect Spotify.');
        return;
      }

      setConnectingSpotify(true);

      try {
        // Start OAuth flow
        const authResult = await connectSpotify();

        if (!authResult) {
          Alert.alert('Cancelled', 'Spotify connection was cancelled.');
          setConnectingSpotify(false);
          return;
        }

        // Save connection to database
        const saved = await saveSpotifyConnection(
          user.id,
          authResult.spotifyUserId,
          authResult.accessToken,
          authResult.refreshToken,
          authResult.expiresIn
        );

        if (!saved) {
          Alert.alert('Error', 'Failed to save Spotify connection. Please try again.');
          setConnectingSpotify(false);
          return;
        }

        // Fetch followed artists
        const artists = await fetchFollowedArtists(authResult.accessToken);

        if (artists.length === 0) {
          Alert.alert(
            'No Artists Found',
            "We couldn't find any followed artists on your Spotify account.",
            [{ text: 'OK' }]
          );
          setSpotifyConnected(true);
          setConnectingSpotify(false);
          return;
        }

        // Show artist selector modal
        setSpotifyArtists(artists);
        setSpotifyConnected(true);
        setConnectingSpotify(false);
        setShowArtistSelector(true);
      } catch (error) {
        console.error('[Profile] Error connecting Spotify:', error);
        Alert.alert('Error', 'Failed to connect to Spotify. Please try again.');
        setConnectingSpotify(false);
      }
    }
  };

  const handleConnectAppleMusic = () => {
    if (appleMusicConnected) {
      Alert.alert('Disconnect Apple Music', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          onPress: () => setAppleMusicConnected(false),
        },
      ]);
    } else {
      Alert.alert('Connect Apple Music', 'Apple Music integration coming soon!');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#1d4ed8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <BackButton />
            </View>

            {/* User Info Card */}
            <ProfileCard title="">
              <ProfileHeader
                name={user?.name || 'User'}
                email={user?.email || 'user@example.com'}
                profilePicture={user?.profilePicture || `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=${user?.email || 'default'}`}
              />
            </ProfileCard>

            {/* Followed Artists Card */}
            {user?.id && (
              <ProfileCard title="Followed Artists">
                <FollowedArtists userId={user.id} />
              </ProfileCard>
            )}

            {/* Events Calendar Card */}
            {user?.id && (
              <ProfileCard title="Upcoming Events">
                <EventsCalendar userId={user.id} />
              </ProfileCard>
            )}

            {/* Connected Apps Card */}
            <ProfileCard title="Connected Apps">
              <ConnectedAppButton
                icon="musical-notes"
                iconColor="#1DB954"
                appName="Spotify"
                isConnected={spotifyConnected}
                onPress={handleConnectSpotify}
              />
              <ConnectedAppButton
                icon="musical-note"
                iconColor="#FA243C"
                appName="Apple Music"
                isConnected={appleMusicConnected}
                onPress={handleConnectAppleMusic}
              />
            </ProfileCard>

            {/* Account Actions Card */}
            <ProfileCard title="">
              <ActionButton
                icon="person-outline"
                text="Edit Profile"
                onPress={handleEditProfile}
              />
              <ActionButton
                icon="settings-outline"
                text="Settings"
                onPress={() => router.push('/settings')}
              />
              <ActionButton
                icon="lock-closed-outline"
                text="Change Password"
                onPress={handleChangePassword}
              />
              <ActionButton
                icon="log-out-outline"
                text="Sign Out"
                onPress={handleSignOut}
                isDanger
                isLast
              />
            </ProfileCard>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Spotify Artist Selector Modal */}
      {user?.id && (
        <SpotifyArtistSelector
          visible={showArtistSelector}
          artists={spotifyArtists}
          onClose={() => setShowArtistSelector(false)}
          userId={user.id}
        />
      )}
    </View>
  );
}

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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
