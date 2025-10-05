import React, { useState } from 'react';
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
import { signInWithGoogle } from '../utils/googleAuth';

const SignIn: React.FC = () => {
  const { signIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

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
      await new Promise(resolve => setTimeout(resolve, 2000));

      const userData = {
        id: Math.random().toString(),
        name: formData.name || 'User',
        email: formData.email,
        profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg'
      };

      await signIn(userData);

      Alert.alert(
        'Success', 
        isSignUp ? 'Account created successfully!' : 'Signed in successfully!',
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

      if (result.success && result.user) {
        const userData = {
          id: result.user.id,
          name: result.user.user_metadata?.full_name || result.user.email?.split('@')[0] || 'User',
          email: result.user.email || '',
          profilePicture: result.user.user_metadata?.avatar_url || 'https://randomuser.me/api/portraits/men/1.jpg'
        };

        await signIn(userData);
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

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
    // TODO: When Supabase is configured, use:
    // await supabase.auth.resetPasswordForEmail(formData.email)
    Alert.alert(
      'Reset Password',
      'Password reset functionality will be enabled once Supabase is configured.',
      [{ text: 'OK' }]
    );
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