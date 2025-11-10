import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

interface ProfileHeaderProps {
  name: string;
  email: string;
  profilePicture: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  email,
  profilePicture,
}) => {
  return (
    <View style={styles.userInfo}>
      <Image
        source={{ uri: profilePicture }}
        style={styles.profileImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.userDetails}>
        <Text style={styles.userName}>{name}</Text>
        <Text style={styles.userEmail}>{email}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default ProfileHeader;
