import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_PROMPT_DISMISSED_KEY = 'biometric_prompt_dismissed';
const USER_EMAIL_KEY = 'biometric_user_email';
const USER_PASSWORD_KEY = 'biometric_user_password';

export interface BiometricType {
  available: boolean;
  biometricType: 'FaceID' | 'TouchID' | 'Fingerprint' | 'Iris' | 'None';
}

/**
 * Check if biometric authentication is available on the device
 */
export async function checkBiometricAvailability(): Promise<BiometricType> {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();

    if (!compatible) {
      return { available: false, biometricType: 'None' };
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();

    if (!enrolled) {
      return { available: false, biometricType: 'None' };
    }

    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    // Determine the biometric type
    let biometricType: 'FaceID' | 'TouchID' | 'Fingerprint' | 'Iris' | 'None' = 'None';

    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricType = Platform.OS === 'ios' ? 'FaceID' : 'Fingerprint';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricType = Platform.OS === 'ios' ? 'TouchID' : 'Fingerprint';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometricType = 'Iris';
    }

    return { available: true, biometricType };
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return { available: false, biometricType: 'None' };
  }
}

/**
 * Authenticate using biometrics
 */
export async function authenticateWithBiometrics(): Promise<{ success: boolean; error?: string }> {
  try {
    const { available } = await checkBiometricAvailability();

    if (!available) {
      return { success: false, error: 'Biometric authentication not available' };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to sign in',
      fallbackLabel: 'Use password',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false, // Allow device PIN/password as fallback
    });

    if (result.success) {
      return { success: true };
    } else {
      return { success: false, error: 'Authentication failed' };
    }
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return { success: false, error: 'An error occurred during authentication' };
  }
}

/**
 * Enable biometric authentication for a user
 * Stores credentials securely
 */
export async function enableBiometricAuth(email: string, password: string): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
    await SecureStore.setItemAsync(USER_EMAIL_KEY, email);
    await SecureStore.setItemAsync(USER_PASSWORD_KEY, password);
    return true;
  } catch (error) {
    console.error('Error enabling biometric auth:', error);
    return false;
  }
}

/**
 * Disable biometric authentication
 */
export async function disableBiometricAuth(): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
    await SecureStore.deleteItemAsync(USER_EMAIL_KEY);
    await SecureStore.deleteItemAsync(USER_PASSWORD_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_PROMPT_DISMISSED_KEY);
    return true;
  } catch (error) {
    console.error('Error disabling biometric auth:', error);
    return false;
  }
}

/**
 * Mark that the user has dismissed the biometric prompt
 */
export async function dismissBiometricPrompt(): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(BIOMETRIC_PROMPT_DISMISSED_KEY, 'true');
    return true;
  } catch (error) {
    console.error('Error dismissing biometric prompt:', error);
    return false;
  }
}

/**
 * Check if user has dismissed the biometric prompt
 */
export async function hasUserDismissedPrompt(): Promise<boolean> {
  try {
    const dismissed = await SecureStore.getItemAsync(BIOMETRIC_PROMPT_DISMISSED_KEY);
    return dismissed === 'true';
  } catch (error) {
    console.error('Error checking dismissed status:', error);
    return false;
  }
}

/**
 * Check if biometric authentication is enabled for this app
 */
export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking biometric enabled status:', error);
    return false;
  }
}

/**
 * Get stored credentials (only after successful biometric authentication)
 */
export async function getStoredCredentials(): Promise<{ email: string; password: string } | null> {
  try {
    const email = await SecureStore.getItemAsync(USER_EMAIL_KEY);
    const password = await SecureStore.getItemAsync(USER_PASSWORD_KEY);

    if (email && password) {
      return { email, password };
    }

    return null;
  } catch (error) {
    console.error('Error getting stored credentials:', error);
    return null;
  }
}

/**
 * Get biometric type name for display
 */
export function getBiometricTypeName(type: string): string {
  switch (type) {
    case 'FaceID':
      return 'Face ID';
    case 'TouchID':
      return 'Touch ID';
    case 'Fingerprint':
      return 'Fingerprint';
    case 'Iris':
      return 'Iris';
    default:
      return 'Biometric';
  }
}
