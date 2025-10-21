import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

export default function ArtistCardSkeleton() {
  return (
    <View style={styles.container}>
      <ShimmerPlaceholder style={styles.image} shimmerColors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']} />
      <View style={styles.content}>
        <ShimmerPlaceholder style={styles.title} shimmerColors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']} />
        <ShimmerPlaceholder style={styles.subtitle} shimmerColors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginRight: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 12,
  },
  title: {
    width: '80%',
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  subtitle: {
    width: '60%',
    height: 12,
    borderRadius: 4,
  },
});
