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
    shouldShowBanner: true,
    shouldShowList: true,
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

  // Try to get push token (works on physical devices and some emulators with dev builds)
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return;
  }

  try {

    // Add a timeout to prevent blocking on simulators/emulators
    const tokenPromise = Notifications.getExpoPushTokenAsync({
      projectId: '164b1a12-fa07-49f6-9eba-f07651fceb45', // Your Expo project ID
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Push token request timed out')), 5000)
    );

    const pushToken = await Promise.race([tokenPromise, timeoutPromise]);
    token = pushToken.data;
  } catch (error: any) {
    if (error.message === 'Push token request timed out') {
    } else {
      console.error('[Push Notifications] ❌ Error getting push token:', error);
    }
    if (!Device.isDevice) {
    }
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
  } else {
  }
}
