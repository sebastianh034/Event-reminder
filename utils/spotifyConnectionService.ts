import { supabase } from './supabase';
import { refreshSpotifyToken } from './spotifyOAuth';

export interface SpotifyConnection {
  id: string;
  user_id: string;
  spotify_user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  connected_at: string;
}

/**
 * Save Spotify connection to database
 */
export async function saveSpotifyConnection(
  userId: string,
  spotifyUserId: string,
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): Promise<boolean> {
  try {
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const { error } = await supabase
      .from('spotify_connections')
      .upsert(
        {
          user_id: userId,
          spotify_user_id: spotifyUserId,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt,
        },
        {
          onConflict: 'user_id',
        }
      );

    if (error) {
      console.error('[Spotify Connection] Error saving connection:', error);
      return false;
    }

    console.log('[Spotify Connection] Successfully saved connection');
    return true;
  } catch (error) {
    console.error('[Spotify Connection] Exception saving connection:', error);
    return false;
  }
}

/**
 * Get Spotify connection for user
 */
export async function getSpotifyConnection(userId: string): Promise<SpotifyConnection | null> {
  try {
    const { data, error } = await supabase
      .from('spotify_connections')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No connection found
        return null;
      }
      console.error('[Spotify Connection] Error fetching connection:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[Spotify Connection] Exception fetching connection:', error);
    return null;
  }
}

/**
 * Check if user has Spotify connected
 */
export async function isSpotifyConnected(userId: string): Promise<boolean> {
  const connection = await getSpotifyConnection(userId);
  return connection !== null;
}

/**
 * Get valid access token (refreshes if expired)
 */
export async function getValidAccessToken(userId: string): Promise<string | null> {
  try {
    const connection = await getSpotifyConnection(userId);
    if (!connection) {
      return null;
    }

    // Check if token is expired
    const expiresAt = new Date(connection.expires_at);
    const now = new Date();

    // If token expires in less than 5 minutes, refresh it
    if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      console.log('[Spotify Connection] Token expired or expiring soon, refreshing...');

      const refreshed = await refreshSpotifyToken(connection.refresh_token);
      if (!refreshed) {
        console.error('[Spotify Connection] Failed to refresh token');
        return null;
      }

      // Save new token
      await saveSpotifyConnection(
        userId,
        connection.spotify_user_id,
        refreshed.accessToken,
        connection.refresh_token,
        refreshed.expiresIn
      );

      return refreshed.accessToken;
    }

    return connection.access_token;
  } catch (error) {
    console.error('[Spotify Connection] Exception getting valid token:', error);
    return null;
  }
}

/**
 * Disconnect Spotify (delete connection)
 */
export async function disconnectSpotify(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('spotify_connections')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('[Spotify Connection] Error disconnecting:', error);
      return false;
    }

    console.log('[Spotify Connection] Successfully disconnected');
    return true;
  } catch (error) {
    console.error('[Spotify Connection] Exception disconnecting:', error);
    return false;
  }
}
