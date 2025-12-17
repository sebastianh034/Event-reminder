import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface SwipeToSubmitProps {
  onSubmit: () => void;
  disabled?: boolean;
  text?: string;
  isSubmitting?: boolean;
}

const HOLD_DURATION = 3000; // 3 seconds
const TRACK_HEIGHT = 60;

const SwipeToSubmit: React.FC<SwipeToSubmitProps> = ({
  onSubmit,
  disabled = false,
  text = 'Hold to Submit',
  isSubmitting = false,
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const progressWidth = useRef(new Animated.Value(0)).current;
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTime = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (holdTimer.current) {
        clearTimeout(holdTimer.current);
      }
    };
  }, []);

  const handlePressIn = () => {
    if (disabled || isCompleted) return;

    setIsHolding(true);
    startTime.current = Date.now();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate progress bar
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: HOLD_DURATION,
      useNativeDriver: false,
    }).start();

    // Set timer for completion
    holdTimer.current = setTimeout(() => {
      setIsCompleted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        onSubmit();
      }, 200);
    }, HOLD_DURATION);
  };

  const handlePressOut = () => {
    if (isCompleted) return;

    setIsHolding(false);

    // Clear timer
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }

    // Reset progress bar
    Animated.timing(progressWidth, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const progressPercentage = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isCompleted}
      style={styles.container}
    >
      <View style={[styles.track, disabled && styles.trackDisabled]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressPercentage,
            },
          ]}
        />

        <View style={styles.content}>
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : isCompleted ? (
            <Ionicons name="checkmark-circle" size={28} color="#ffffff" />
          ) : disabled ? (
            <Ionicons name="lock-closed" size={24} color="#ffffff" />
          ) : (
            <Ionicons name="time-outline" size={24} color="#ffffff" />
          )}
          <Animated.Text style={styles.text}>
            {isSubmitting ? 'Submitting...' : isCompleted ? 'Submitted!' : disabled ? 'Fill Required Fields' : text}
          </Animated.Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 8,
    alignSelf: 'stretch',
  },
  track: {
    height: TRACK_HEIGHT,
    backgroundColor: '#10b981',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  trackDisabled: {
    backgroundColor: '#059669',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: '#059669',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default SwipeToSubmit;
