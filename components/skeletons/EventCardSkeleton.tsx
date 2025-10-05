import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

export default function EventCardSkeleton() {
  return (
    <View style={styles.container}>
      <ShimmerPlaceholder style={styles.image} shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']} />
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.leftContent}>
            <ShimmerPlaceholder style={styles.title} shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']} />
            <ShimmerPlaceholder style={styles.subtitle} shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']} />
            <ShimmerPlaceholder style={styles.location} shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']} />
          </View>
          <ShimmerPlaceholder style={styles.button} shimmerColors={['#e3f2fd', '#bbdefb', '#e3f2fd']} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: 120,
    height: 120,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    width: '70%',
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  subtitle: {
    width: '50%',
    height: 14,
    borderRadius: 4,
    marginBottom: 8,
  },
  location: {
    width: '60%',
    height: 12,
    borderRadius: 4,
  },
  button: {
    width: 80,
    height: 36,
    borderRadius: 8,
  },
});
