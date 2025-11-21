import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import { useAuth } from './authcontext';
import { setupPushNotifications, removePushTokenFromSupabase } from '../utils/pushNotifications';

interface NotificationContextType {
  notificationsEnabled: boolean;
  toggleNotifications: (value: boolean) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { user } = useAuth();

  // Load notification preference on mount
  useEffect(() => {
    loadNotificationPreference();
  }, []);

  // Setup push notifications when user signs in
  useEffect(() => {
    if (user?.id && notificationsEnabled) {
      setupPushNotifications(user.id);
    }
  }, [user?.id, notificationsEnabled]);

  const loadNotificationPreference = async () => {
    try {
      const value = await AsyncStorage.getItem('notificationsEnabled');
      if (value !== null) {
        setNotificationsEnabled(JSON.parse(value));
      }
    } catch (error) {
      console.error('Error loading notification preference:', error);
    }
  };

  const toggleNotifications = async (value: boolean) => {
    try {
      if (value) {
        // User wants to enable notifications
        const { status } = await Notifications.getPermissionsAsync();

        if (status !== 'granted') {
          // Request permission
          const { status: newStatus } = await Notifications.requestPermissionsAsync();

          if (newStatus !== 'granted') {
            Alert.alert(
              'Permission Required',
              'Please enable notifications in your device settings to receive alerts.',
              [{ text: 'OK' }]
            );
            return; // Don't enable if permission denied
          }
        }

        // Register push notifications
        if (user?.id) {
          await setupPushNotifications(user.id);
        }
      } else {
        // User wants to disable notifications
        // Cancel all scheduled notifications
        await Notifications.cancelAllScheduledNotificationsAsync();

        // Remove push token from database
        if (user?.id) {
          await removePushTokenFromSupabase(user.id);
        }
      }

      // Save preference
      await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(value));
      setNotificationsEnabled(value);
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  return (
    <NotificationContext.Provider value={{ notificationsEnabled, toggleNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
