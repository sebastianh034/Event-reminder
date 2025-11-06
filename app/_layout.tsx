import { useEffect, useRef } from 'react';
import { Stack, router } from 'expo-router';
import { AuthProvider } from '../context/authcontext';
import { NotificationProvider } from '../context/notificationContext';
import { LocationProvider } from '../context/locationContext';
import { FollowedArtistsProvider } from '../context/followedArtistsContext';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../utils/supabase';
import '../Notification-Handler/Notification-Handler';

async function requestPermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  let finalStatus = status;

  if (status !== 'granted') {
    const { status: askStatus } = await Notifications.requestPermissionsAsync();
    finalStatus = askStatus;
  }

  if (finalStatus !== 'granted') {
    alert('Permission not granted for notifications!');
    return false;
  }

  // iOS specific setup
  if (Platform.OS === 'ios') {
    await Notifications.setNotificationCategoryAsync('default', []);
  }

  // Android specific setup - notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
}

async function handleNotificationNavigation(data: any) {
  if (data.artistId) {
    try {
      // Fetch full artist data from database
      const { data: artist, error } = await supabase
        .from('artists')
        .select('id, name, spotify_id, image_url')
        .eq('id', data.artistId)
        .single();

      if (error || !artist) {
        console.error('Error fetching artist for notification:', error);
        // Fallback: navigate with just the artist name from notification
        setTimeout(() => {
          router.push(`/artist/${data.artistId}?name=${data.artist || 'Unknown Artist'}`);
        }, 100);
        return;
      }

      // Navigate with full artist data
      const artistId = artist.spotify_id || artist.id;
      const params = new URLSearchParams({
        name: artist.name,
        image: artist.image_url || '',
        followers: '0', // Followers not stored in DB, using default
      });

      setTimeout(() => {
        router.push(`/artist/${artistId}?${params.toString()}`);
      }, 100);
    } catch (error) {
      console.error('Error handling notification navigation:', error);
    }
  }
}

export default function RootLayout() {
  const responseListener = useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener>>();

  useEffect(() => {
    requestPermissions();

    // Check if app was opened by tapping a notification
    Notifications.getLastNotificationResponseAsync()
      .then(async response => {
        if (response) {
          const data = response.notification.request.content.data;
          await handleNotificationNavigation(data);
        }
      });

    // Handle notification taps while app is running
    responseListener.current = Notifications.addNotificationResponseReceivedListener(async response => {
      const data = response.notification.request.content.data;
      await handleNotificationNavigation(data);
    });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <AuthProvider>
      <FollowedArtistsProvider>
        <NotificationProvider>
          <LocationProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="search" options={{ headerShown: false }} />
              <Stack.Screen name="artist/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="signin" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
              <Stack.Screen name="editprofile" options={{ headerShown: false }} />
            </Stack>
          </LocationProvider>
        </NotificationProvider>
      </FollowedArtistsProvider>
    </AuthProvider>
  );
}
