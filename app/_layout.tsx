import { useEffect } from 'react';
import { Stack } from 'expo-router';
import SignIn from './signin';
import { AuthProvider } from '../context/authcontext';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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

  if (Platform.OS === 'ios') {
    await Notifications.setNotificationCategoryAsync('default', []);
  }

  return true;
}

export default function RootLayout() {
  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="artist/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="signin" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
