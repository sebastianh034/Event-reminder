import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { useAuth } from '../context/authcontext';

interface ProfileHeaderProps {
  onSignInPress: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onSignInPress }) => {
  const { isSignedIn, user, signOut } = useAuth();

  const handleProfilePress = () => {
    signOut();
  };

  return (
    <View style={styles.headerTopRow}>
      <View style={styles.spacer} />
      {isSignedIn ? (
        // Profile button when signed in
        <Pressable 
          style={({ pressed }) => [
            styles.profileButton,
            pressed && styles.profileButtonPressed
          ]}
          onPress={handleProfilePress}
        >
          <Image 
            source={{ uri: user?.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
            style={styles.profileImage}
          />
        </Pressable>
      ) : (
        // Sign in button when not signed in
        <Pressable 
          style={({ pressed }) => [
            styles.signInButton,
            pressed && styles.signInButtonPressed
          ]}
          onPress={onSignInPress}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    width: '100%',
  },
  spacer: {
    flex: 1,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  signInButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 80,
  },
  signInButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  signInText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ProfileHeader;