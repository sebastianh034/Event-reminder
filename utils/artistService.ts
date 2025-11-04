import { supabase } from './supabase';
import { fetchAndSaveArtistEvents } from './eventsAPI';

/**
 * Save or update an artist in the database
 * Returns the artist UUID from the database
 */
export async function saveArtist(artistData: {
  name: string;
  spotifyId: string;
  genre?: string;
  imageUrl?: string;
  followersCount?: number;
  popularity?: number;
  bio?: string;
}): Promise<string | null> {
  try {
    // Check if artist already exists by Spotify ID
    const { data: existingArtist } = await supabase
      .from('artists')
      .select('id')
      .eq('spotify_id', artistData.spotifyId)
      .single();

    if (existingArtist) {
      // Artist exists, update it
      const { error } = await supabase
        .from('artists')
        .update({
          name: artistData.name,
          genre: artistData.genre,
          image_url: artistData.imageUrl,
          followers_count: artistData.followersCount,
          popularity: artistData.popularity,
          bio: artistData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingArtist.id);

      if (error) {
        console.error('Error updating artist:', error);
        return null;
      }

      return existingArtist.id;
    } else {
      // Artist doesn't exist, create it
      const { data: newArtist, error } = await supabase
        .from('artists')
        .insert({
          name: artistData.name,
          spotify_id: artistData.spotifyId,
          genre: artistData.genre,
          image_url: artistData.imageUrl,
          followers_count: artistData.followersCount,
          popularity: artistData.popularity,
          bio: artistData.bio,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating artist:', error);
        return null;
      }

      return newArtist?.id || null;
    }
  } catch (error) {
    console.error('Error in saveArtist:', error);
    return null;
  }
}

/**
 * Follow an artist
 */
export async function followArtist(
  userId: string,
  artistData: {
    name: string;
    spotifyId: string;
    genre?: string;
    imageUrl?: string;
    followersCount?: number;
    popularity?: number;
    bio?: string;
  }
): Promise<boolean> {
  try {

    // First, save/update the artist in the database
    const artistId = await saveArtist(artistData);

    if (!artistId) {
      console.error('[Follow] Failed to save artist');
      return false;
    }


    // Check current Supabase session
    const { data: sessionData } = await supabase.auth.getSession();

    // Then, create the followed_artists relationship
    const { data, error } = await supabase
      .from('followed_artists')
      .insert({
        user_id: userId,
        artist_id: artistId,
      })
      .select();

    if (error) {
      // If error is duplicate (already following), consider it success
      if (error.code === '23505') {
        return true;
      }
      console.error('[Follow] Error creating followed_artists relationship:', error);
      return false;
    }


    // Fetch and save Ticketmaster events for this artist (async, don't wait)
    fetchAndSaveArtistEvents(artistId, artistData.name, undefined, artistData.genre)
      .then(result => {
        if (result.success && result.ticketmasterId) {
          // Update artist with Ticketmaster ID
          supabase
            .from('artists')
            .update({ ticketmaster_id: result.ticketmasterId })
            .eq('id', artistId)
            .then(() => {
            });
        } else {
        }
      })
      .catch(error => {
        console.error('[Follow] Error fetching Ticketmaster events:', error);
      });

    return true;
  } catch (error) {
    console.error('[Follow] Exception in followArtist:', error);
    return false;
  }
}

/**
 * Unfollow an artist
 */
export async function unfollowArtist(
  userId: string,
  spotifyId: string
): Promise<boolean> {
  try {

    // First, get the artist UUID from Spotify ID
    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('spotify_id', spotifyId)
      .single();

    if (!artist) {
      console.error('[Unfollow] Artist not found');
      return false;
    }

    // Then, delete the followed_artists relationship
    const { error } = await supabase
      .from('followed_artists')
      .delete()
      .eq('user_id', userId)
      .eq('artist_id', artist.id);

    if (error) {
      console.error('[Unfollow] Error unfollowing artist:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Unfollow] Exception in unfollowArtist:', error);
    return false;
  }
}

/**
 * Get all artists the user is following
 * Returns array of Spotify IDs
 */
export async function getFollowedArtists(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('followed_artists')
      .select(`
        artists (
          spotify_id
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('[Follow] Error fetching followed artists:', error);
      return [];
    }

    // Extract spotify_ids from the nested data
    const spotifyIds = data
      ?.map((item: any) => item.artists?.spotify_id)
      .filter((id: string | undefined) => id !== undefined) || [];

    return spotifyIds;
  } catch (error) {
    console.error('[Follow] Exception in getFollowedArtists:', error);
    return [];
  }
}

/**
 * Check if user is following a specific artist
 */
export async function isFollowingArtist(
  userId: string,
  spotifyId: string
): Promise<boolean> {
  try {
    // First, get the artist UUID from Spotify ID
    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('spotify_id', spotifyId)
      .single();

    if (!artist) {
      return false;
    }

    // Then, check if followed_artists relationship exists
    const { data, error } = await supabase
      .from('followed_artists')
      .select('id')
      .eq('user_id', userId)
      .eq('artist_id', artist.id)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  } catch (error) {
    return false;
  }
}
