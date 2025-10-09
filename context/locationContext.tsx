import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  locationEnabled: boolean;
  toggleLocation: (value: boolean) => Promise<void>;
  location: UserLocation | null;
  permissionGranted: boolean;
  isLoading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load location preference and initialize on mount
  useEffect(() => {
    loadLocationPreference();
  }, []);

  const loadLocationPreference = async () => {
    try {
      const value = await AsyncStorage.getItem('locationEnabled');
      if (value !== null) {
        const enabled = JSON.parse(value);
        setLocationEnabled(enabled);
        if (enabled) {
          await requestLocationPermission();
        } else {
          setIsLoading(false);
        }
      } else {
        // Default is enabled, so request permission
        await requestLocationPermission();
      }
    } catch (error) {
      console.error('Error loading location preference:', error);
      setIsLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setPermissionGranted(false);
        setIsLoading(false);
        return;
      }

      setPermissionGranted(true);
      await getCurrentLocation();
    } catch (err) {
      setError('Failed to get location permission');
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setError(null);
    } catch (err) {
      setError('Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLocation = async () => {
    if (!locationEnabled) {
      Alert.alert('Location Disabled', 'Please enable location services in settings.');
      return;
    }

    if (!permissionGranted) {
      await requestLocationPermission();
    } else {
      await getCurrentLocation();
    }
  };

  const toggleLocation = async (value: boolean) => {
    try {
      if (value) {
        // User wants to enable location
        const { status } = await Location.getForegroundPermissionsAsync();

        if (status !== 'granted') {
          // Request permission
          const { status: newStatus } = await Location.requestForegroundPermissionsAsync();

          if (newStatus !== 'granted') {
            Alert.alert(
              'Permission Required',
              'Please enable location services in your device settings to see events near you.',
              [{ text: 'OK' }]
            );
            return; // Don't enable if permission denied
          }
        }

        setPermissionGranted(true);
        await getCurrentLocation();
      } else {
        // User wants to disable location
        setLocation(null);
        setPermissionGranted(false);
      }

      // Save preference
      await AsyncStorage.setItem('locationEnabled', JSON.stringify(value));
      setLocationEnabled(value);
    } catch (error) {
      console.error('Error toggling location:', error);
      Alert.alert('Error', 'Failed to update location settings');
    }
  };

  return (
    <LocationContext.Provider
      value={{
        locationEnabled,
        toggleLocation,
        location,
        permissionGranted,
        isLoading,
        error,
        refreshLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
