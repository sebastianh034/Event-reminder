import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/authcontext';
import SocialLogin from '../components/SignIn/SocialLogin';
import AuthForm from '../components/SignIn/Form';
import GradientBackground from '../components/SignIn/GradientBackground';
import AuthHeader from '../components/SignIn/AuthHeader';
import AuthToggle from '../components/SignIn/AuthToggle';
import { signInWithGoogle } from '../utils/googleSignIn';
import { signUpWithEmail, signInWithEmail, resetPassword } from '../utils/supabaseAuth';
import {
  checkBiometricAvailability,
  authenticateWithBiometrics,
  isBiometricEnabled,
  getStoredCredentials,
  enableBiometricAuth,
  getBiometricTypeName,
  dismissBiometricPrompt,
  hasUserDismissedPrompt,
} from '../utils/biometricAuth';
import * as Location from 'expo-location';
import { useLocation } from '../context/locationContext';
import { useNotifications } from '../context/notificationContext';

const SignIn: React.FC = () => {
  const { signIn } = useAuth();
  const { toggleLocation } = useLocation();
  const { toggleNotifications } = useNotifications();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  // Check biometric availability on mount
  useEffect(() => {
    checkBiometrics();
  }, []);

  // Function to prompt new users for permissions
  const promptNewUserPermissions = async () => {
    // First, ask for location permission
    Alert.alert(
      'Enable Location',
      'Find concerts and events near you. You can change this later in Settings.',
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () => promptNotificationPermission(),
        },
        {
          text: 'Enable',
          onPress: async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
              await toggleLocation(true);
            }
            promptNotificationPermission();
          },
        },
      ]
    );
  };

  const promptNotificationPermission = () => {
    // Then, ask for notification permission
    Alert.alert(
      'Enable Notifications',
      'Get notified about new events from your favorite artists. You can change this later in Settings.',
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () => router.replace('/'),
        },
        {
          text: 'Enable',
          onPress: async () => {
            await toggleNotifications(true);
            router.replace('/');
          },
        },
      ]
    );
  };

  const checkBiometrics = async () => {
    const { available, biometricType } = await checkBiometricAvailability();
    console.log('[SignIn] Biometric availability:', available, 'Type:', biometricType);
    setBiometricAvailable(available);
    setBiometricType(getBiometricTypeName(biometricType));

    // Don't auto-prompt - let user choose between Face ID, Google, or email/password
    // The Face ID button will be shown in the UI if available and enabled
  };

  const promptBiometricAuth = async () => {
    const result = await authenticateWithBiometrics();

    if (result.success) {
      const credentials = await getStoredCredentials();

      if (credentials) {
        // Auto-fill and sign in
        setFormData(prev => ({
          ...prev,
          email: credentials.email,
          password: credentials.password,
        }));

        // Sign in automatically
        await performSignIn(credentials.email, credentials.password);
      } else {
        // No credentials stored yet
        Alert.alert(
          'No Credentials Stored',
          'Please sign in with your email and password first, then enable biometric authentication.'
        );
      }
    } else if (result.error) {
      console.log('[SignIn] Biometric authentication failed:', result.error);
    }
  };

  const performSignIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Sign in with Supabase
      const result = await signInWithEmail(email, password);

      if (!result.success || !result.user) {
        Alert.alert('Error', result.error || 'Failed to sign in');
        setLoading(false);
        return;
      }

      if (biometricAvailable) {
        const biometricEnabled = await isBiometricEnabled();
        const userDismissed = await hasUserDismissedPrompt();

        if (!biometricEnabled && !userDismissed) {
          setLoading(false); // Clear loading before showing alert
          Alert.alert(
            `Enable ${biometricType}?`,
            `Use ${biometricType} to sign in quickly next time?`,
            [
              {
                text: 'Not Now',
                style: 'cancel',
                onPress: async () => {
                  // Mark that user dismissed the prompt
                  await dismissBiometricPrompt();
                  // Navigate after dismissing
                  router.replace('/');
                },
              },
              {
                text: 'Enable',
                onPress: async () => {
                  await enableBiometricAuth(email, password);
                  // Navigate after enabling
                  router.replace('/');
                },
              },
            ]
          );
        } else {
          // If biometric already enabled or dismissed, navigate immediately
          setLoading(false);
          router.replace('/');
        }
      } else {
        // Biometrics not available, navigate to home
        setLoading(false);
        router.replace('/');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (isSignUp) {
      if (!formData.name) {
        Alert.alert('Error', 'Name is required for sign up');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return false;
      }
    }

    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let result;

      if (isSignUp) {
        // Sign up with Supabase
        result = await signUpWithEmail(formData.email, formData.password, formData.name);
      } else {
        // Sign in with Supabase
        result = await signInWithEmail(formData.email, formData.password);
      }

      if (!result.success || !result.user) {
        Alert.alert('Error', result.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      // Update local auth context
      // Note: Don't pass name/profilePicture here - let it load from database via auth context
      // DON'T call signIn() here - the auth context's SIGNED_IN event handler
      // will automatically load the correct profile from the database
      // This prevents showing old/incomplete data before the database load completes

      // Handle navigation and permission prompts based on sign in or sign up
      if (isSignUp) {
        // New user - prompt for location and notifications
        await promptNewUserPermissions();
      } else {
        // Existing user signing in - offer biometric auth or go to home
        if (biometricAvailable) {
          const biometricEnabled = await isBiometricEnabled();
          const userDismissed = await hasUserDismissedPrompt();

          if (!biometricEnabled && !userDismissed) {
            Alert.alert(
              `Enable ${biometricType}?`,
              `Use ${biometricType} to sign in quickly next time?`,
              [
                {
                  text: 'Not Now',
                  style: 'cancel',
                  onPress: async () => {
                    // Mark that user dismissed the prompt
                    await dismissBiometricPrompt();
                    // Navigate after dismissing
                    router.replace('/');
                  },
                },
                {
                  text: 'Enable',
                  onPress: async () => {
                    await enableBiometricAuth(formData.email, formData.password);
                    // Navigate after enabling
                    router.replace('/');
                  },
                },
              ]
            );
          } else {
            // If biometric already enabled or dismissed, navigate immediately
            router.replace('/');
          }
        } else {
          // Biometrics not available, navigate to home
          router.replace('/');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
    });
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();

      if (result.success && result.userInfo && result.userInfo.data) {
        // DON'T call signIn() here - the auth context's SIGNED_IN event handler
        // will automatically load the correct profile from the database
        // This prevents showing old/incomplete data before the database load completes

        Alert.alert('Success', 'Signed in with Google!', [
          { text: 'OK', onPress: () => { setLoading(false); router.back(); } }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to sign in with Google');
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    const result = await resetPassword(formData.email);

    if (result.success) {
      Alert.alert(
        'Check Your Email',
        'We sent you a password reset link. Please check your email.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to send reset email');
    }
  };

  return (
    <GradientBackground>
      <AuthHeader
        title={"Never miss your\nfavorite artists again"}
        subtitle="Get notified about concerts and events from artists you love"
      />

      <View style={styles.formContainer}>
        <AuthForm
          isSignUp={isSignUp}
          loading={loading}
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleAuth}
          onForgotPassword={handleForgotPassword}
          onBiometricPress={promptBiometricAuth}
          biometricAvailable={biometricAvailable}
          biometricType={biometricType}
        />

        <AuthToggle isSignUp={isSignUp} onToggle={toggleMode} />

        <SocialLogin
          onApplePress={() => Alert.alert('Coming Soon', 'Apple sign-in will be available in a future update.')}
          onGooglePress={handleGoogleSignIn}
        />
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
  },
});

export default SignIn;