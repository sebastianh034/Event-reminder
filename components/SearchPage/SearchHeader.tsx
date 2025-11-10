import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import BackButton from '../BackButton';

const SearchHeader: React.FC = () => {
  return (
    <View style={styles.header}>
      <BackButton/>
      <Text style={styles.headerTitle}>Search Artists</Text>
      <View style={styles.placeholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
});

export default SearchHeader;