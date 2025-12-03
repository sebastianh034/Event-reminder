import { useState } from 'react';
import { searchArtists } from '../utils/spotifyAPI';
import type { ExtendedArtist } from '../types';

export function useArtistSearch(initialQuery: string = '') {
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [searchResults, setSearchResults] = useState<ExtendedArtist[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const spotifyResults = await searchArtists(query, 10);

      const results: ExtendedArtist[] = spotifyResults.map((spotifyArtist, index) => ({
        id: index + 1000,
        spotifyId: spotifyArtist.id,
        name: spotifyArtist.name,
        genre: spotifyArtist.genres[0] || 'Artist',
        image: spotifyArtist.images[0]?.url || 'https://via.placeholder.com/300',
        followers: spotifyArtist.followers.total.toLocaleString(),
        isFollowing: false,
        verified: spotifyArtist.popularity > 50,
        popularity: spotifyArtist.popularity,
        bio: `${spotifyArtist.name} is a popular artist on Spotify with ${spotifyArtist.followers.total.toLocaleString()} followers.`,
        monthlyListeners: spotifyArtist.followers.total.toLocaleString(),
      }));

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching artists:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    handleSearch
  };
}
