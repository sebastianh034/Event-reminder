import { supabase } from './supabase';

interface SpotifyCredentials {
  clientId: string | null;
  clientSecret: string | null;
}

/**
 * Fetches Spotify API credentials from Supabase app_config table
 * @returns Spotify client ID and secret
 */
export async function getSpotifyCredentials(): Promise<SpotifyCredentials> {
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('key, value')
      .in('key', ['spotify_client_id', 'spotify_client_secret']);

    if (error) {
      console.error('Error fetching Spotify credentials:', error);
      return { clientId: null, clientSecret: null };
    }

    if (!data || data.length === 0) {
      console.error('No Spotify credentials found in database');
      return { clientId: null, clientSecret: null };
    }

    const clientId = data.find(item => item.key === 'spotify_client_id')?.value || null;
    const clientSecret = data.find(item => item.key === 'spotify_client_secret')?.value || null;

    return { clientId, clientSecret };
  } catch (error) {
    console.error('Exception fetching Spotify credentials:', error);
    return { clientId: null, clientSecret: null };
  }
}

/**
 * Fetches a single config value from Supabase
 * @param key - The config key to fetch
 * @returns The config value or null
 */
export async function getConfigValue(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      console.error(`Error fetching config value for ${key}:`, error);
      return null;
    }

    return data?.value || null;
  } catch (error) {
    console.error(`Exception fetching config value for ${key}:`, error);
    return null;
  }
}