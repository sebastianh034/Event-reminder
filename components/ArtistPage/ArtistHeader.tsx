import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
} from 'react-native';
import { type Artist } from '../../types';
import BackButton from '../backbutton';
import ArtistFollowButton from '../FollowButton';

interface ArtistHeaderProps {
  artist: Artist;
  isUserSignedIn?: boolean;
}

const ArtistHeader: React.FC<ArtistHeaderProps> = ({
  artist,
  isUserSignedIn = true,
}) => {
  const fallbackColors = [
    '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'
  ];
  const fallbackColor = fallbackColors[artist.id % fallbackColors.length];

  return (
    <View style={styles.profileHeader}>
      <BackButton />

      <View style={styles.artistImageContainer}>
        {artist.image ? (
          <ImageBackground
            source={{ uri: artist.image }}
            style={styles.artistImage}
            imageStyle={styles.artistImageStyle}
          >
            <View style={styles.artistOverlay} />
            <View style={styles.artistInfo}>
              <View style={styles.artistNameRow}>
                <Text style={styles.artistName}>{artist.name}</Text>
              </View>
              <View style={styles.bottomRow}>
                {isUserSignedIn && (
                  <ArtistFollowButton
                    artistId={artist.id}
                    artistName={artist.name}
                    spotifyId={artist.spotifyId}
                    genre={artist.genre}
                    imageUrl={artist.image}
                    followersCount={artist.followers ? parseInt(artist.followers.replace(/,/g, '')) : undefined}
                    popularity={artist.popularity}
                    bio={artist.bio}
                    initialFollowState={artist.isFollowing}
                  />
                )}
              </View>
            </View>
          </ImageBackground>
        ) : (
          <View style={[styles.artistImage, { backgroundColor: fallbackColor }]}>
            <View style={styles.artistInfo}>
              <View style={styles.artistNameRow}>
                <Text style={styles.artistName}>{artist.name}</Text>
              </View>
              <View style={styles.bottomRow}>
                {isUserSignedIn && (
                  <ArtistFollowButton
                    artistId={artist.id}
                    artistName={artist.name}
                    spotifyId={artist.spotifyId}
                    genre={artist.genre}
                    imageUrl={artist.image}
                    followersCount={artist.followers ? parseInt(artist.followers.replace(/,/g, '')) : undefined}
                    popularity={artist.popularity}
                    bio={artist.bio}
                    initialFollowState={artist.isFollowing}
                  />
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  artistImageContainer: {
    marginBottom: 20,
  },
  artistImage: {
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  artistImageStyle: {
    borderRadius: 15,
  },
  artistOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  artistInfo: {
    padding: 20,
    justifyContent: 'space-between',
    height: '100%',
  },
  artistNameRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  artistName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default ArtistHeader;
