import { useState } from 'react';
import { Alert } from 'react-native';
import { uploadProfilePicture } from '../utils/imageUpload';
import { updateUserProfile } from '../utils/profileSync';

interface User {
  id: string;
  name?: string;
  email?: string;
  profilePicture?: string;
}

interface ProfileData {
  name: string;
  email: string;
  profilePicture?: string;
}

export function useProfileUpdate(user: User | null, updateUser: (data: Partial<User>) => Promise<void>) {
  const [uploading, setUploading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const updateProfile = async (profileData: ProfileData, onSuccess?: () => void) => {
    if (!profileData.name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return false;
    }

    if (!profileData.email.trim()) {
      Alert.alert('Error', 'Email cannot be empty');
      return false;
    }

    if (!validateEmail(profileData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return false;
    }

    try {
      setUploading(true);
      console.log('[Edit Profile] Starting profile update for user:', user.id);
      console.log('[Edit Profile] Current values - Name:', user.name, 'Email:', user.email);
      console.log('[Edit Profile] New values - Name:', profileData.name.trim(), 'Email:', profileData.email.trim());

      let finalProfilePictureUrl = profileData.profilePicture;

      if (profileData.profilePicture &&
          profileData.profilePicture !== user?.profilePicture &&
          profileData.profilePicture.startsWith('file://')) {
        console.log('[Edit Profile] Uploading new profile picture...');
        const uploadedUrl = await uploadProfilePicture(user.id, profileData.profilePicture);

        if (uploadedUrl) {
          finalProfilePictureUrl = uploadedUrl;
          console.log('[Edit Profile] Profile picture uploaded successfully:', uploadedUrl);
        } else {
          console.log('[Edit Profile] Failed to upload profile picture');
          Alert.alert('Warning', 'Failed to upload profile picture. Other changes will still be saved.');
        }
      }

      console.log('[Edit Profile] Updating user in context...');
      await updateUser({
        name: profileData.name.trim(),
        email: profileData.email.trim(),
        profilePicture: finalProfilePictureUrl || undefined,
      });

      console.log('[Edit Profile] Updating profile in Supabase database...');
      const success = await updateUserProfile(user.id, {
        name: profileData.name.trim(),
        email: profileData.email.trim(),
        profilePicture: finalProfilePictureUrl || undefined,
      });

      console.log('[Edit Profile] Database update result:', success);

      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: onSuccess,
        },
      ]);

      return true;
    } catch (error) {
      console.error('[Edit Profile] Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
      return false;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    updateProfile
  };
}
