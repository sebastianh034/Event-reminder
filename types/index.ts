// Artist type for UI components (matches Spotify data structure)
export interface Artist {
  id: number;
  name: string;
  followers: string;
  image: string;
  isFollowing: boolean;
  spotifyId?: string;
  genre?: string;
  popularity?: number;
  bio?: string;
}

// Extended artist type with additional details
export interface ExtendedArtist extends Artist {
  verified?: boolean;
  monthlyListeners?: string;
  topTracks?: string[];
}
