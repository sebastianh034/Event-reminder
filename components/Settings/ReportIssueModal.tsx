import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ReportIssueModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: IssueData) => Promise<void>;
}

export interface IssueData {
  title: string;
  name: string;
  description: string;
  screenshots: string[];
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newScreenshots = result.assets.map(asset => asset.uri);
        setScreenshots([...screenshots, ...newScreenshots]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the issue');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        name: name.trim(),
        description: description.trim(),
        screenshots,
      });

      // Reset form
      setTitle('');
      setName('');
      setDescription('');
      setScreenshots([]);

      Alert.alert('Success', 'Issue reported successfully! Thank you for your feedback.');
      onClose();
    } catch (error) {
      console.error('Error submitting issue:', error);

      // Show the actual error message if available (for rate limiting)
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit issue. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title || name || description || screenshots.length > 0) {
      Alert.alert(
        'Discard Report?',
        'Are you sure you want to discard this issue report?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setTitle('');
              setName('');
              setDescription('');
              setScreenshots([]);
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleCancel}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#1e3a8a', '#3b82f6', '#1d4ed8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={handleCancel} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#ffffff" />
              </Pressable>
              <Text style={styles.headerTitle}>Report an Issue</Text>
              <View style={styles.closeButton} />
            </View>

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.content}>
                {/* Title Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    Issue Title <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Brief description of the issue"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={title}
                    onChangeText={setTitle}
                    maxLength={100}
                  />
                </View>

                {/* Name Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    Your Name <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="How should we address you?"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={name}
                    onChangeText={setName}
                    maxLength={50}
                  />
                </View>

                {/* Description Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    Description <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Please provide details about the issue..."
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                  />
                </View>

                {/* Screenshots Section */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Screenshots (Optional)</Text>
                  <Pressable style={styles.addImageButton} onPress={handlePickImage}>
                    <Ionicons name="image-outline" size={24} color="#ffffff" />
                    <Text style={styles.addImageText}>Add Screenshots</Text>
                  </Pressable>

                  {screenshots.length > 0 && (
                    <View style={styles.screenshotsContainer}>
                      {screenshots.map((uri, index) => (
                        <View key={index} style={styles.screenshotItem}>
                          <Image source={{ uri }} style={styles.screenshot} />
                          <Pressable
                            style={styles.removeButton}
                            onPress={() => handleRemoveScreenshot(index)}
                          >
                            <Ionicons name="close-circle" size={24} color="#ef4444" />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Submit Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.submitButton,
                    pressed && styles.submitButtonPressed,
                    isSubmitting && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="send" size={20} color="#ffffff" />
                      <Text style={styles.submitButtonText}>Submit Report</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 70,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  textArea: {
    minHeight: 150,
    paddingTop: 16,
  },
  addImageButton: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addImageText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  screenshotsContainer: {
    marginTop: 12,
    gap: 12,
  },
  screenshotItem: {
    position: 'relative',
  },
  screenshot: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitButtonPressed: {
    backgroundColor: '#059669',
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(16, 185, 129, 0.5)',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default ReportIssueModal;
