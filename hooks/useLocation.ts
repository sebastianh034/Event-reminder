import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface UserLocation {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

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
    if (!permissionGranted) {
      await requestLocationPermission();
    } else {
      await getCurrentLocation();
    }
  };

  return {
    location,
    permissionGranted,
    isLoading,
    error,
    refreshLocation,
  };
}
