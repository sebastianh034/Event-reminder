import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../components/authcontext';
import SocialLogin from '../components/SignIn/SocialLogin';
import AuthForm from '../components/SignIn/Form';
import GradientBackground from '../components/SignIn/GradientBackground';
import AuthHeader from '../components/SignIn/AuthHeader';
import AuthToggle from '../components/SignIn/AuthToggle';

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
        />

        <AuthToggle isSignUp={isSignUp} onToggle={toggleMode} />

        <SocialLogin
          onApplePress={() => console.log('Apple pressed')}
          onGooglePress={() => console.log('Google pressed')}
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