import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

// This is required for the OAuth flow to work properly
WebBrowser.maybeCompleteAuthSession();

const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'myapp',
  path: 'oauth/callback',
});

console.log('[Spotify OAuth] Using redirect URI:', REDIRECT_URI);

const SCOPES = [
  'user-follow-read', // Read user's followed artists
];

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export interface SpotifyAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  spotifyUserId: string;
}

/**
 * Get Spotify credentials from database
 */
async function getSpotifyCredentials(): Promise<{ clientId: string; clientSecret: string } | null> {
  try {
    const { data, error } = await supabase
      .from('Spotify_config')
      .select('key, value')
      .in('key', ['spotify_client_id', 'spotify_client_secret']);

    if (error || !data || data.length === 0) {
      console.error('[Spotify OAuth] Error fetching credentials:', error);
      return null;
    }

    const clientId = data.find(item => item.key === 'spotify_client_id')?.value;
    const clientSecret = data.find(item => item.key === 'spotify_client_secret')?.value;

    if (!clientId || !clientSecret) {
      console.error('[Spotify OAuth] Credentials not found');
      return null;
    }

    return { clientId, clientSecret };
  } catch (error) {
    console.error('[Spotify OAuth] Exception fetching credentials:', error);
    return null;
  }
}

/**
 * Initiate Spotify OAuth flow
 * Opens Spotify login page and returns tokens on success
 */
export async function connectSpotify(): Promise<SpotifyAuthResponse | null> {
  try {
    console.log('[Spotify OAuth] Starting OAuth flow...');
    console.log('[Spotify OAuth] Redirect URI:', REDIRECT_URI);

    // Get credentials from database
    const credentials = await getSpotifyCredentials();
    if (!credentials) {
      console.error('[Spotify OAuth] Failed to get Spotify credentials');
      return null;
    }

    // Create and prompt auth request
    const authRequest = new AuthSession.AuthRequest({
      clientId: credentials.clientId,
      scopes: SCOPES,
      redirectUri: REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true, // Use PKCE for better security
    });

    const result = await authRequest.promptAsync(discovery);

    if (result.type === 'success' && result.params.code) {
      console.log('[Spotify OAuth] Authorization successful, exchanging code for token...');

      // Exchange code for tokens
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: credentials.clientId,
          code: result.params.code,
          redirectUri: REDIRECT_URI,
          extraParams: {
            code_verifier: authRequest.codeVerifier || '',
          },
        },
        discovery
      );

      if (tokenResult.accessToken) {
        console.log('[Spotify OAuth] Successfully authenticated!');

        // Get Spotify user ID
        const userProfile = await fetchSpotifyUserProfile(tokenResult.accessToken);

        if (!userProfile) {
          console.error('[Spotify OAuth] Failed to fetch user profile');
          return null;
        }

        return {
          accessToken: tokenResult.accessToken,
          refreshToken: tokenResult.refreshToken!,
          expiresIn: tokenResult.expiresIn!,
          spotifyUserId: userProfile.id,
        };
      }
    }

    console.log('[Spotify OAuth] OAuth flow cancelled or failed');
    return null;
  } catch (error) {
    console.error('[Spotify OAuth] Error during OAuth flow:', error);
    return null;
  }
}

/**
 * Fetch Spotify user profile
 */
async function fetchSpotifyUserProfile(accessToken: string): Promise<{ id: string; display_name: string } | null> {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.error('[Spotify OAuth] Error fetching user profile:', error);
    return null;
  }
}

/**
 * Refresh Spotify access token
 */
export async function refreshSpotifyToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number } | null> {
  try {
    // Get credentials from database
    const credentials = await getSpotifyCredentials();
    if (!credentials) {
      console.error('[Spotify OAuth] Failed to get Spotify credentials');
      return null;
    }

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${credentials.clientId}:${credentials.clientSecret}`),
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    });

    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      return {
        accessToken: tokenData.access_token,
        expiresIn: tokenData.expires_in,
      };
    }

    console.error('[Spotify OAuth] Failed to refresh token:', await tokenResponse.text());
    return null;
  } catch (error) {
    console.error('[Spotify OAuth] Error refreshing token:', error);
    return null;
  }
}

/**
 * Get user's followed artists from Spotify
 * @param accessToken - Spotify access token
 * @returns Array of followed artists with full details
 */
export async function fetchFollowedArtists(accessToken: string): Promise<any[]> {
  try {
    let allArtists: any[] = [];
    let nextUrl: string | null = 'https://api.spotify.com/v1/me/following?type=artist&limit=50';

    // Spotify API returns max 50 artists per request, so we need to paginate
    while (nextUrl) {
      const response = await fetch(nextUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error('[Spotify OAuth] Failed to fetch followed artists');
        break;
      }

      const data = await response.json();
      allArtists = allArtists.concat(data.artists.items);
      nextUrl = data.artists.next;
    }

    console.log(`[Spotify OAuth] Fetched ${allArtists.length} followed artists`);
    return allArtists;
  } catch (error) {
    console.error('[Spotify OAuth] Error fetching followed artists:', error);
    return [];
  }
}
