import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getFollowedArtists } from '../utils/artistService';
import { useAuth } from './authcontext';

interface FollowedArtistsContextType {
  followedArtistIds: Set<string>;
  isFollowing: (spotifyId: string) => boolean;
  addFollowedArtist: (spotifyId: string) => void;
  removeFollowedArtist: (spotifyId: string) => void;
  refreshFollowedArtists: () => Promise<void>;
  isLoading: boolean;
}

const FollowedArtistsContext = createContext<FollowedArtistsContextType | undefined>(undefined);

export const FollowedArtistsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [followedArtistIds, setFollowedArtistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Load followed artists when user signs in
  useEffect(() => {
    if (user) {
      refreshFollowedArtists();
    } else {
      // Clear followed artists when user signs out
      setFollowedArtistIds(new Set());
    }
  }, [user]);

  const refreshFollowedArtists = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const spotifyIds = await getFollowedArtists(user.id);
      setFollowedArtistIds(new Set(spotifyIds));
      console.log('[Followed Artists] Loaded', spotifyIds.length, 'followed artists');
    } catch (error) {
      console.error('[Followed Artists] Error loading followed artists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFollowing = (spotifyId: string): boolean => {
    return followedArtistIds.has(spotifyId);
  };

  const addFollowedArtist = (spotifyId: string) => {
    setFollowedArtistIds(prev => new Set([...prev, spotifyId]));
  };

  const removeFollowedArtist = (spotifyId: string) => {
    setFollowedArtistIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(spotifyId);
      return newSet;
    });
  };

  return (
    <FollowedArtistsContext.Provider
      value={{
        followedArtistIds,
        isFollowing,
        addFollowedArtist,
        removeFollowedArtist,
        refreshFollowedArtists,
        isLoading,
      }}
    >
      {children}
    </FollowedArtistsContext.Provider>
  );
};

export const useFollowedArtists = (): FollowedArtistsContextType => {
  const context = useContext(FollowedArtistsContext);
  if (!context) {
    throw new Error('useFollowedArtists must be used within a FollowedArtistsProvider');
  }
  return context;
};
