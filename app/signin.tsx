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
import { syncUserProfile } from '../utils/profileSync';
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

const SignIn: React.FC = () => {
  const { signIn } = useAuth();
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

  const checkBiometrics = async () => {
    const { available, biometricType } = await checkBiometricAvailability();
    setBiometricAvailable(available);
    setBiometricType(getBiometricTypeName(biometricType));

    // If biometrics are enabled and available, prompt immediately
    if (available) {
      const enabled = await isBiometricEnabled();
      if (enabled) {
        promptBiometricAuth();
      }
    }
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
      }
    }
  };

  const performSignIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Sign in with Supabase
      const result = await signInWithEmail(email, password);

      if (!result.success || !result.user) {
        Alert.alert('Error', result.error || 'Failed to sign in');
        return;
      }

      // Update local auth context
      const userData = {
        id: result.user.id,
        name: result.user.name || email.split('@')[0] || 'User',
        email: result.user.email,
        profilePicture: undefined
      };

      await signIn(userData);

      // Sync profile with Supabase database
      await syncUserProfile(userData);

      Alert.alert('Success', 'Signed in successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
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
        return;
      }

      // Update local auth context
      const userData = {
        id: result.user.id,
        name: result.user.name || formData.name || 'User',
        email: result.user.email,
        profilePicture: undefined
      };

      await signIn(userData);

      // Sync profile with Supabase database
      await syncUserProfile(userData);

      // Offer to enable biometric auth after successful sign-in (only if user hasn't dismissed it)
      if (!isSignUp && biometricAvailable) {
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
                },
              },
              {
                text: 'Enable',
                onPress: async () => {
                  await enableBiometricAuth(formData.email, formData.password);
                },
              },
            ]
          );
        }
      }

      Alert.alert(
        'Success',
        isSignUp ? 'Account created successfully! Please check your email to verify.' : 'Signed in successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
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
        const googleUser = result.userInfo.data.user;
        const userData = {
          id: googleUser.id,
          name: googleUser.name || googleUser.email.split('@')[0] || 'User',
          email: googleUser.email,
          profilePicture: googleUser.photo || undefined
        };

        await signIn(userData);

        // Sync profile with Supabase database
        await syncUserProfile(userData);

        Alert.alert('Success', 'Signed in with Google!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to sign in with Google');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
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
          onApplePress={() => console.log('Apple pressed')}
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