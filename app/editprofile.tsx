import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../context/authcontext';
import BackButton from '../components/backbutton';
import ProfilePictureEditor from '../components/EditProfile/ProfilePictureEditor';
import FormInput from '../components/EditProfile/FormInput';
import ActionButtons from '../components/EditProfile/ActionButtons';

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');

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

    try {
      // Update user in context
      await updateUser({
        name: name.trim(),
        email: email.trim(),
        profilePicture: profilePicture.trim() || user?.profilePicture,
      });

      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
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

              {/* Action Buttons */}
              <ActionButtons onSave={handleSave} onCancel={handleCancel} />
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
});
