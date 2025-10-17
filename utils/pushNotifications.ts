import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and get Expo Push Token
 * Works for both iOS and Android
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    try {
      const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId: '164b1a12-fa07-49f6-9eba-f07651fceb45', // Your Expo project ID
      });
      token = pushToken.data;
      console.log('Push token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Save push token to Supabase database
 */
export async function savePushTokenToSupabase(
  token: string,
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('push_tokens')
      .upsert(
        {
          user_id: userId,
          token: token,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,platform',
        }
      );

    if (error) {
      console.error('Error saving push token:', error);
    } else {
      console.log('Push token saved successfully');
    }
  } catch (error) {
    console.error('Error in savePushTokenToSupabase:', error);
  }
}

/**
 * Remove push token from Supabase database (on sign out)
 */
export async function removePushTokenFromSupabase(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('platform', Platform.OS);

    if (error) {
      console.error('Error removing push token:', error);
    } else {
      console.log('Push token removed successfully');
    }
  } catch (error) {
    console.error('Error in removePushTokenFromSupabase:', error);
  }
}

/**
 * Register push notifications for the current user
 * Call this after user signs in
 */
export async function setupPushNotifications(userId: string): Promise<void> {
  const token = await registerForPushNotificationsAsync();

  if (token) {
    await savePushTokenToSupabase(token, userId);
  }
}
