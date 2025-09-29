import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { ExtendedArtist } from '../data/ArtistsFakeData';
import ArtistResultCard from './ArtistResultCard';

interface SearchResultsSectionProps {
  searchResults: ExtendedArtist[];
  followedArtists: Set<number>;
  onArtistPress: (artist: ExtendedArtist) => void;
  onToggleFollow: (artistId: number) => void;
}

const SearchResultsSection: React.FC<SearchResultsSectionProps> = ({
  searchResults,
  followedArtists,
  onArtistPress,
  onToggleFollow,
}) => {
  return (
    <>
      <Text style={styles.sectionTitle}>
        {searchResults.length > 0 ? 'Search Results' : 'No Results Found'}
      </Text>

      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          renderItem={({ item }) => (
            <ArtistResultCard
              artist={item}
              onPress={onArtistPress}
              onFollowPress={onToggleFollow}
              isFollowed={followedArtists.has(item.id)}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
});

export default SearchResultsSection;