import React from 'react';
import {
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { ExtendedArtist } from '../data/ArtistsFakeData';
import ArtistResultCard from './ArtistResultCard';
import ArtistCardSkeleton from '../skeletons/ArtistCardSkeleton';

interface SearchResultsSectionProps {
  searchResults: ExtendedArtist[];
  followedArtists: Set<number>;
  onArtistPress: (artist: ExtendedArtist) => void;
  onToggleFollow: (artistId: number) => void;
  isSearching?: boolean;
}

const SearchResultsSection: React.FC<SearchResultsSectionProps> = ({
  searchResults,
  followedArtists,
  onArtistPress,
  onToggleFollow,
  isSearching = false,
}) => {
  return (
    <>
      <Text style={styles.sectionTitle}>
        {isSearching ? 'Searching...' : searchResults.length > 0 ? 'Search Results' : 'No Results Found'}
      </Text>

      {isSearching ? (
        // Show skeleton loaders while searching
        <>
          <ArtistCardSkeleton />
          <ArtistCardSkeleton />
          <ArtistCardSkeleton />
        </>
      ) : searchResults.length > 0 ? (
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
      ) : null}
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