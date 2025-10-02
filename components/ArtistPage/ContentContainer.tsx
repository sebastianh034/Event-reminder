import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ContentContainerProps {
  children: React.ReactNode;
}

const ContentContainer: React.FC<ContentContainerProps> = ({ children }) => {
  return <View style={styles.contentContainer}>{children}</View>;
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
});

export default ContentContainer;
