import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../context/authcontext';
import { uploadProfilePicture } from '../utils/imageUpload';
import { updateUserProfile } from '../utils/profileSync';
import BackButton from '../components/BackButton';
import ProfilePictureEditor from '../components/EditProfile/ProfilePictureEditor';
import FormInput from '../components/EditProfile/FormInput';
import ActionButtons from '../components/EditProfile/ActionButtons';

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Email cannot be empty');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      setUploading(true);
      console.log('[Edit Profile] Starting profile update for user:', user.id);
      console.log('[Edit Profile] Current values - Name:', user.name, 'Email:', user.email);
      console.log('[Edit Profile] New values - Name:', name.trim(), 'Email:', email.trim());

      let finalProfilePictureUrl = profilePicture;

      // Check if profile picture changed and is a local file
      if (profilePicture && profilePicture !== user?.profilePicture && profilePicture.startsWith('file://')) {
        console.log('[Edit Profile] Uploading new profile picture...');
        // Upload the new profile picture
        const uploadedUrl = await uploadProfilePicture(user.id, profilePicture);

        if (uploadedUrl) {
          finalProfilePictureUrl = uploadedUrl;
          console.log('[Edit Profile] Profile picture uploaded successfully:', uploadedUrl);
        } else {
          console.log('[Edit Profile] Failed to upload profile picture');
          Alert.alert('Warning', 'Failed to upload profile picture. Other changes will still be saved.');
        }
      }

      // Update user in context
      console.log('[Edit Profile] Updating user in context...');
      await updateUser({
        name: name.trim(),
        email: email.trim(),
        profilePicture: finalProfilePictureUrl || undefined,
      });

      // Update in database
      console.log('[Edit Profile] Updating profile in Supabase database...');
      const success = await updateUserProfile(user.id, {
        name: name.trim(),
        email: email.trim(),
        profilePicture: finalProfilePictureUrl || undefined,
      });

      console.log('[Edit Profile] Database update result:', success);

      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('[Edit Profile] Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#1d4ed8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <BackButton />
              <Text style={styles.headerTitle}>Edit Profile</Text>
            </View>

            {/* Profile Picture */}
            <ProfilePictureEditor
              profilePicture={profilePicture}
              onImageChange={setProfilePicture}
            />

            {/* Form */}
            <View style={styles.formContainer}>
              <FormInput
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
              />

              <FormInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Upload Indicator */}
              {uploading && (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.uploadingText}>Uploading profile picture...</Text>
                </View>
              )}

              {/* Action Buttons */}
              {!uploading ? (
                <ActionButtons onSave={handleSave} onCancel={handleCancel} />
              ) : (
                <View style={styles.uploadingContainer}>
                  <Text style={styles.uploadingText}>Please wait...</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  uploadingText: {
    color: '#ffffff',
    marginLeft: 12,
    fontSize: 14,
  },
});
