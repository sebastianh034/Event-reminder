import React from 'react';
import {
  Text,
  StyleSheet,
} from 'react-native';

const MainTitle: React.FC = () => {
  return (
    <>
      <Text style={styles.mainTitle}>Never miss your</Text>
      <Text style={styles.mainTitle}>favorite artists again</Text>
    </>
  );
};

const styles = StyleSheet.create({
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 38,
  },
});

export default MainTitle;