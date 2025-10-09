import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../components/backbutton';
import SettingCard from '../components/Settings/SettingCard';
import SettingToggle from '../components/Settings/SettingToggle';
import SettingInfo from '../components/Settings/SettingInfo';
import { useNotifications } from '../context/notificationContext';
import { useLocation } from '../context/locationContext';
import {
  checkBiometricAvailability,
  isBiometricEnabled,
  disableBiometricAuth,
  getBiometricTypeName,
} from '../utils/biometricAuth';

export default function SettingsPage() {
  const { notificationsEnabled, toggleNotifications } = useNotifications();
  const { locationEnabled, toggleLocation } = useLocation();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const { available, biometricType } = await checkBiometricAvailability();
    setBiometricAvailable(available);
    setBiometricType(getBiometricTypeName(biometricType));

    if (available) {
      const enabled = await isBiometricEnabled();
      setBiometricEnabled(enabled);
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (!value) {
      // Disabling biometric auth
      Alert.alert(
        `Disable ${biometricType}?`,
        'You will need to sign in with your password next time.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              const success = await disableBiometricAuth();
              if (success) {
                setBiometricEnabled(false);
              }
            },
          },
        ]
      );
    } else {
      // Enabling biometric auth
      Alert.alert(
        `Enable ${biometricType}`,
        'Please sign in again to enable biometric authentication.',
        [{ text: 'OK' }]
      );
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
              <Text style={styles.headerTitle}>Settings</Text>
            </View>

            {/* Notifications Settings */}
            <SettingCard title="Notifications">
              <SettingToggle
                icon="notifications-outline"
                title="Push Notifications"
                description="Receive alerts about upcoming events"
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
              />
            </SettingCard>

            {/* Location Settings */}
            <SettingCard title="Location">
              <SettingToggle
                icon="location-outline"
                title="Location Services"
                description="Show events near you"
                value={locationEnabled}
                onValueChange={toggleLocation}
              />
            </SettingCard>

            {/* Security Settings */}
            {biometricAvailable && (
              <SettingCard title="Security">
                <SettingToggle
                  icon="finger-print"
                  title={biometricType}
                  description={`Use ${biometricType} to sign in`}
                  value={biometricEnabled}
                  onValueChange={handleToggleBiometric}
                />
              </SettingCard>
            )}

            {/* About */}
            <SettingCard title="About">
              <SettingInfo
                icon="information-circle-outline"
                title="Version"
                description="1.0.0"
              />
            </SettingCard>
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
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
});
