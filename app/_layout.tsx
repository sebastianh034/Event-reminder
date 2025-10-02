import { useEffect } from 'react';
import { Stack } from 'expo-router';
import SignIn from './signin';
import { AuthProvider } from '../context/authcontext';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
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

  // // Get push token for remote notifications
  // try {
  //   const projectId = '164b1a12-fa07-49f6-9eba-f07651fceb45';
  //   const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  //   console.log('Expo Push Token:', tokenData.data);
  //   // You can send this token to your backend to send push notifications
  // } catch (error) {
  //   console.error('Failed to get push token:', error);
  // }

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
