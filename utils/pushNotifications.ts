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

  console.log('[Push Notifications] Starting registration...');
  console.log('[Push Notifications] Platform:', Platform.OS);
  console.log('[Push Notifications] Is physical device:', Device.isDevice);

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });
    console.log('[Push Notifications] Android notification channel created');
  }

  // Try to get push token (works on physical devices and some emulators with dev builds)
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.log('[Push Notifications] Existing permission status:', existingStatus);

  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    console.log('[Push Notifications] Requesting permissions...');
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log('[Push Notifications] Permission request result:', finalStatus);
  }

  if (finalStatus !== 'granted') {
    console.log('[Push Notifications] Permission denied - cannot get push token');
    return;
  }

  try {
    console.log('[Push Notifications] Getting Expo push token...');

    // Add a timeout to prevent blocking on simulators/emulators
    const tokenPromise = Notifications.getExpoPushTokenAsync({
      projectId: '164b1a12-fa07-49f6-9eba-f07651fceb45', // Your Expo project ID
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Push token request timed out')), 5000)
    );

    const pushToken = await Promise.race([tokenPromise, timeoutPromise]);
    token = pushToken.data;
    console.log('[Push Notifications] ✅ Push token received:', token);
  } catch (error: any) {
    if (error.message === 'Push token request timed out') {
      console.log('[Push Notifications] ⏱️ Timeout - skipping push notifications (simulator/emulator)');
    } else {
      console.error('[Push Notifications] ❌ Error getting push token:', error);
    }
    if (!Device.isDevice) {
      console.log('[Push Notifications] Note: Push notifications may not work on emulators. Use a physical device for full testing.');
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
  console.log('[Push Notifications] Setting up push notifications for user:', userId);

  const token = await registerForPushNotificationsAsync();

  if (token) {
    console.log('[Push Notifications] Token received, saving to Supabase...');
    await savePushTokenToSupabase(token, userId);
  } else {
    console.log('[Push Notifications] No token received - check permissions or device compatibility');
  }
}
