import { supabase } from './supabase';

let accessToken: string | null = null;
let tokenExpiry: number = 0;
let cachedCredentials: { clientId: string; clientSecret: string } | null = null;

/**
 * Get Spotify credentials from Supabase
 */
async function getSpotifyCredentials(): Promise<{ clientId: string; clientSecret: string } | null> {
  // Return cached credentials if available
  if (cachedCredentials) {
    return cachedCredentials;
  }

  try {
    const { data, error } = await supabase
      .from('Spotify_config')
      .select('key, value')
      .in('key', ['spotify_client_id', 'spotify_client_secret']);

    if (error || !data || data.length === 0) {
      console.error('Error fetching Spotify credentials:', error);
      return null;
    }

    const clientId = data.find(item => item.key === 'spotify_client_id')?.value;
    const clientSecret = data.find(item => item.key === 'spotify_client_secret')?.value;

    if (!clientId || !clientSecret) {
      console.error('Spotify credentials not found in database');
      return null;
    }

    // Cache the credentials
    cachedCredentials = { clientId, clientSecret };
    return cachedCredentials;
  } catch (error) {
    console.error('Exception fetching Spotify credentials:', error);
    return null;
  }
}

/**
 * Get Spotify access token using Client Credentials flow
 */
async function getAccessToken(): Promise<string | null> {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  // Get credentials from Supabase
  const credentials = await getSpotifyCredentials();
  if (!credentials) {
    console.error('Unable to fetch Spotify credentials');
    return null;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${credentials.clientId}:${credentials.clientSecret}`),
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();

    if (data.access_token) {
      accessToken = data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
      return accessToken;
    }

    console.error('Failed to get Spotify access token:', data);
    return null;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    return null;
  }
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string; height: number; width: number }[];
  followers: { total: number };
  popularity: number;
  external_urls: { spotify: string };
}

/**
 * Search for artists on Spotify
 * @param query - Search query (artist name)
 * @param limit - Number of results to return (default 20)
 */
export async function searchArtists(query: string, limit: number = 20): Promise<SpotifyArtist[]> {
  const token = await getAccessToken();
  if (!token) {
    console.error('No Spotify access token available');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data.artists && data.artists.items) {
      return data.artists.items;
    }

    return [];
  } catch (error) {
    console.error('Error searching Spotify artists:', error);
    return [];
  }
}

/**
 * Get artist details by Spotify ID
 * @param artistId - Spotify artist ID
 */
export async function getArtist(artistId: string): Promise<SpotifyArtist | null> {
  const token = await getAccessToken();
  if (!token) {
    console.error('No Spotify access token available');
    return null;
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.error('Error getting Spotify artist:', error);
    return null;
  }
}

/**
 * Get multiple artists by Spotify IDs
 * @param artistIds - Array of Spotify artist IDs (max 50)
 */
export async function getArtists(artistIds: string[]): Promise<SpotifyArtist[]> {
  const token = await getAccessToken();
  if (!token) {
    console.error('No Spotify access token available');
    return [];
  }

  try {
    const ids = artistIds.slice(0, 50).join(','); // Spotify allows max 50 IDs
    const response = await fetch(`https://api.spotify.com/v1/artists?ids=${ids}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.artists) {
      return data.artists.filter((artist: SpotifyArtist | null) => artist !== null);
    }

    return [];
  } catch (error) {
    console.error('Error getting Spotify artists:', error);
    return [];
  }
}
