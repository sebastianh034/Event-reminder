import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthFormProps {
  isSignUp: boolean;
  loading: boolean;
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
  };
  onInputChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onForgotPassword?: () => void;
  onBiometricPress?: () => void;
  biometricAvailable?: boolean;
  biometricType?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  isSignUp,
  loading,
  formData,
  onInputChange,
  onSubmit,
  onForgotPassword,
  onBiometricPress,
  biometricAvailable = false,
  biometricType = 'Biometric',
}) => {
  return (
    <View style={styles.form}>
      {isSignUp && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={formData.name}
            onChangeText={(value) => onInputChange('name', value)}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          value={formData.email}
          onChangeText={(value) => onInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          value={formData.password}
          onChangeText={(value) => onInputChange('password', value)}
          secureTextEntry
          returnKeyType={isSignUp ? "next" : "done"}
        />
      </View>

      {isSignUp && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={formData.confirmPassword}
            onChangeText={(value) => onInputChange('confirmPassword', value)}
            secureTextEntry
            returnKeyType="done"
          />
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.authButton,
          (loading || pressed) && styles.authButtonPressed
        ]}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.authButtonText}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Text>
        )}
      </Pressable>

      {!isSignUp && biometricAvailable && (
        <Pressable
          style={({ pressed }) => [
            styles.biometricButton,
            pressed && styles.biometricButtonPressed
          ]}
          onPress={onBiometricPress}
        >
          <Ionicons name="finger-print" size={24} color="#ffffff" />
          <Text style={styles.biometricButtonText}>
            Sign in with {biometricType}
          </Text>
        </Pressable>
      )}

      {!isSignUp && (
        <Pressable style={styles.forgotPassword} onPress={onForgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  authButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  authButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  authButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.5)',
    gap: 8,
  },
  biometricButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  biometricButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 12,
  },
  forgotPasswordText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default AuthForm;