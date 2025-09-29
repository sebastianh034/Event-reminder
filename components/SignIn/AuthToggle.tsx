import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface AuthToggleProps {
  isSignUp: boolean;
  onToggle: () => void;
}

const AuthToggle: React.FC<AuthToggleProps> = ({ isSignUp, onToggle }) => {
  return (
    <View style={styles.toggleContainer}>
      <Text style={styles.toggleText}>
        {isSignUp ? "Already have an account?" : "Don't have an account?"}
      </Text>
      <Pressable onPress={onToggle}>
        <Text style={styles.toggleButton}>
          {isSignUp ? 'Sign In' : 'Create Account'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  toggleText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginRight: 6,
  },
  toggleButton: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AuthToggle;