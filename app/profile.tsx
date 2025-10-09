import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/authcontext';
import { router } from 'expo-router';
import { getFollowedArtistsEvents } from '../components/data/fakedata';
import { fakePastEvents } from '../components/data/fakedata';
import BackButton from '../components/backbutton';
import ProfileCard from '../components/Profile/ProfileCard';
import ProfileHeader from '../components/Profile/ProfileHeader';
import StatsCard from '../components/Profile/StatsCard';
import ConnectedAppButton from '../components/Profile/ConnectedAppButton';
import ActionButton from '../components/Profile/ActionButton';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [appleMusicConnected, setAppleMusicConnected] = useState(false);

  // Calculate stats
  const upcomingEventsCount = getFollowedArtistsEvents().length;
  const pastEventsCount = fakePastEvents.length;

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

  const handleConnectSpotify = () => {
    if (spotifyConnected) {
      Alert.alert('Disconnect Spotify', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          onPress: () => setSpotifyConnected(false),
        },
      ]);
    } else {
      Alert.alert('Connect Spotify', 'Spotify integration coming soon!');
      // TODO: Implement Spotify OAuth
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
      // TODO: Implement Apple Music integration
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
                profilePicture={user?.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg'}
              />
            </ProfileCard>

            {/* Stats Card */}
            <ProfileCard title="Stats">
              <StatsCard
                upcomingEvents={upcomingEventsCount}
                pastEvents={pastEventsCount}
              />
            </ProfileCard>

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
