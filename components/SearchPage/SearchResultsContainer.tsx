import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

interface SearchResultsContainerProps {
  children: React.ReactNode;
}

const SearchResultsContainer: React.FC<SearchResultsContainerProps> = ({ children }) => {
  return (
    <View style={styles.resultsContainer}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  resultsContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
});

export default SearchResultsContainer;