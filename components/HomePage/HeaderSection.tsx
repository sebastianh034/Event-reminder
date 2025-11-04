import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import ProfileHeader from '../ProfileHeaderButton';
import MainTitle from './MainTitle';

interface HeaderSectionProps {
  onSignInPress: () => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ onSignInPress }) => {
  return (
    <View style={styles.headerSection}>
      <ProfileHeader onSignInPress={onSignInPress} />
      <MainTitle />
    </View>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
});

export default HeaderSection;