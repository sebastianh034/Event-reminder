import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

interface DistanceFilterProps {
  distance: number;
  onDistanceChange: (distance: number) => void;
  locationEnabled: boolean;
  onEnableLocation: () => void;
}

export default function DistanceFilter({
  distance,
  onDistanceChange,
  locationEnabled,
  onEnableLocation,
}: DistanceFilterProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempDistance, setTempDistance] = useState(distance);

  const handleApply = () => {
    onDistanceChange(tempDistance);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setTempDistance(distance);
    setModalVisible(false);
  };

  const handleEnableLocation = () => {
    setModalVisible(false);
    onEnableLocation();
  };

  if (!locationEnabled) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.enableButton} onPress={handleEnableLocation}>
          <Ionicons name="location-outline" size={20} color="#3B82F6" />
          <Text style={styles.enableButtonText}>Enable Location for Distance Filter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="options-outline" size={20} color="#FFFFFF" />
        <Text style={styles.filterButtonText}>Distance: {distance} mi</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Distance</Text>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Show events within:</Text>
              <Text style={styles.distanceValue}>{tempDistance} miles</Text>

              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={500}
                step={5}
                value={tempDistance}
                onValueChange={setTempDistance}
                minimumTrackTintColor="#3B82F6"
                maximumTrackTintColor="#D1D5DB"
                thumbTintColor="#3B82F6"
              />

              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>5 mi</Text>
                <Text style={styles.sliderLabelText}>500 mi</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  enableButtonText: {
    marginLeft: 8,
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  sliderContainer: {
    marginBottom: 32,
  },
  sliderLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  distanceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
