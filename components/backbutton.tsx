import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface BackButtonProps {
  onPress?: () => void;
  style?: object;
  textStyle?: object;
}

const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  style,
  textStyle
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.backButton,
        style,
        pressed && styles.backButtonPressed
      ]}
      onPress={handlePress}
    >
      <Text style={[styles.backButtonText, textStyle]}>←</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
  },
  backButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default BackButton;