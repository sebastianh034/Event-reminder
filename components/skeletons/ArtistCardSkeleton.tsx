import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

export default function ArtistCardSkeleton() {
  return (
    <View style={styles.container}>
      <ShimmerPlaceholder
        style={styles.fullCard}
        shimmerColors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.1)']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    borderRadius: 15,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  fullCard: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
