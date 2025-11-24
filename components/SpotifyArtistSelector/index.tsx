import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { followArtist } from '../../utils/artistService';

interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string }[];
  followers: { total: number };
  genres: string[];
  popularity: number;
}

interface SpotifyArtistSelectorProps {
  visible: boolean;
  artists: SpotifyArtist[];
  onClose: () => void;
  userId: string;
}

const SpotifyArtistSelector: React.FC<SpotifyArtistSelectorProps> = ({
  visible,
  artists,
  onClose,
  userId,
}) => {
  const [selectedArtists, setSelectedArtists] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  const toggleArtist = (artistId: string) => {
    setSelectedArtists((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(artistId)) {
        newSet.delete(artistId);
      } else {
        newSet.add(artistId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedArtists(new Set(artists.map((a) => a.id)));
  };

  const deselectAll = () => {
    setSelectedArtists(new Set());
  };

  const handleImport = async () => {
    if (selectedArtists.size === 0) {
      Alert.alert('No Artists Selected', 'Please select at least one artist to follow.');
      return;
    }

    setImporting(true);

    try {
      let successCount = 0;
      let failCount = 0;

      for (const artistId of selectedArtists) {
        const artist = artists.find((a) => a.id === artistId);
        if (!artist) continue;

        const success = await followArtist(userId, {
          name: artist.name,
          spotifyId: artist.id,
          genre: artist.genres[0],
          imageUrl: artist.images[0]?.url,
          followersCount: artist.followers.total,
          popularity: artist.popularity,
        });

        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      }

      Alert.alert(
        'Import Complete',
        `Successfully followed ${successCount} artist${successCount !== 1 ? 's' : ''}${
          failCount > 0 ? `\n${failCount} failed` : ''
        }`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('[Spotify Selector] Error importing artists:', error);
      Alert.alert('Error', 'Failed to import artists. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M followers`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K followers`;
    }
    return `${count} followers`;
  };

  const renderArtistItem = ({ item }: { item: SpotifyArtist }) => {
    const isSelected = selectedArtists.has(item.id);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.artistItem,
          pressed && styles.artistItemPressed,
          isSelected && styles.artistItemSelected,
        ]}
        onPress={() => toggleArtist(item.id)}
      >
        <View style={styles.artistRow}>
          <Image
            source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/100' }}
            style={styles.artistImage}
            contentFit="cover"
            transition={200}
          />

          <View style={styles.artistInfo}>
            <Text style={styles.artistName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.genres.length > 0 && (
              <Text style={styles.artistGenre} numberOfLines={1}>
                {item.genres[0]}
              </Text>
            )}
            <Text style={styles.artistFollowers}>{formatFollowers(item.followers.total)}</Text>
          </View>

          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Ionicons name="checkmark" size={18} color="#ffffff" />}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#1d4ed8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={28} color="#ffffff" />
            </Pressable>
            <Text style={styles.headerTitle}>Select Artists</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            <View style={styles.infoCard}>
              <Ionicons name="musical-notes" size={24} color="#3B82F6" />
              <Text style={styles.infoText}>
                Found {artists.length} followed artist{artists.length !== 1 ? 's' : ''} from your Spotify
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.actionButton} onPress={selectAll}>
                <Text style={styles.actionButtonText}>Select All</Text>
              </Pressable>
              <Pressable style={styles.actionButton} onPress={deselectAll}>
                <Text style={styles.actionButtonText}>Deselect All</Text>
              </Pressable>
            </View>

            <Text style={styles.selectedCount}>
              {selectedArtists.size} selected
            </Text>

            <FlatList
              data={artists}
              renderItem={renderArtistItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />

            <Pressable
              style={({ pressed }) => [
                styles.importButton,
                pressed && styles.importButtonPressed,
                (importing || selectedArtists.size === 0) && styles.importButtonDisabled,
              ]}
              onPress={handleImport}
              disabled={importing || selectedArtists.size === 0}
            >
              {importing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.importButtonText}>
                  Follow {selectedArtists.size} Artist{selectedArtists.size !== 1 ? 's' : ''}
                </Text>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedCount: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 12,
  },
  list: {
    paddingBottom: 16,
  },
  artistItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  artistItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  artistItemSelected: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artistImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  artistInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  artistName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  artistGenre: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  artistFollowers: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  importButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  importButtonPressed: {
    backgroundColor: '#2563EB',
  },
  importButtonDisabled: {
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
  },
  importButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SpotifyArtistSelector;
