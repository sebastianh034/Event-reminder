import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../context/authcontext';
import BackButton from '../components/BackButton';
import ProfilePictureEditor from '../components/EditProfile/ProfilePictureEditor';
import FormInput from '../components/EditProfile/FormInput';
import ActionButtons from '../components/EditProfile/ActionButtons';
import { useFormData } from '../hooks/useFormData';
import { useProfileUpdate } from '../hooks/useProfileUpdate';

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();

  const { formData, handleChange } = useFormData({
    name: user?.name || '',
    email: user?.email || '',
    profilePicture: user?.profilePicture || '',
  });

  const { uploading, updateProfile } = useProfileUpdate(user, updateUser);

  const handleSave = async () => {
    await updateProfile(formData, () => router.back());
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
              profilePicture={formData.profilePicture}
              onImageChange={(value) => handleChange('profilePicture', value)}
            />

            {/* Form */}
            <View style={styles.formContainer}>
              <FormInput
                label="Name"
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                placeholder="Enter your name"
              />

              <FormInput
                label="Email"
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
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
