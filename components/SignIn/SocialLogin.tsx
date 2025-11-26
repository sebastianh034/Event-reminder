import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

interface SocialLoginProps {
  onApplePress?: () => void;
  onGooglePress?: () => void;
}

const SocialLogin: React.FC<SocialLoginProps> = ({ 
  onApplePress, 
  onGooglePress 
}) => {
  const handleApplePress = () => {
    if (onApplePress) {
      onApplePress();
    }
  };

  const handleGooglePress = () => {
    if (onGooglePress) {
      onGooglePress();
    }
  };

  return (
    <View style={styles.socialContainer}>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialButtons}>
            <Pressable style={styles.socialButton} onPress={handleApplePress}>
            <AntDesign name="apple" size={20} color="white" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Apple</Text>
            </Pressable>
        
            <Pressable style={styles.socialButton} onPress={handleGooglePress}>
            <AntDesign name="google" size={20} color="white" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Google</Text>
            </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  socialContainer: {
    marginTop: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  socialIcon: {
  marginRight: 8,
},
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    paddingHorizontal: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  socialButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  socialButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SocialLogin;