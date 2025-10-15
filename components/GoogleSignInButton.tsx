import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Alert } from 'react-native';
import { signInWithGoogle, configureGoogleSignIn } from '@/utils/googleSignIn';
import { useAuth } from '@/context/authcontext';

interface GoogleSignInButtonProps {
  onSignInSuccess?: (userInfo: any) => void;
  onSignInError?: (error: string) => void;
}

export default function GoogleSignInButton({
  onSignInSuccess,
  onSignInError
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  React.useEffect(() => {
    // Configure Google Sign-In when component mounts
    configureGoogleSignIn();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const result = await signInWithGoogle();
    setIsLoading(false);

    if (result.success && result.userInfo) {
      console.log('User Info:', result.userInfo);

      await signIn({
        id: result.userInfo.user.id,
        name: result.userInfo.user.name,
        email: result.userInfo.user.email,
        profilePicture: result.userInfo.user.photo,
      });

      onSignInSuccess?.(result.userInfo);
    } else {
      Alert.alert('Sign In Failed', result.error || 'Unknown error');
      onSignInError?.(result.error || 'Unknown error');
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleGoogleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={styles.buttonContent}>
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
