/**
 * Ticketmaster API Integration
 * Handles fetching artist (attraction) data and events from Ticketmaster
 */

import { getConfigValue } from './spotifyConfig';

const TICKETMASTER_API_BASE = 'https://app.ticketmaster.com/discovery/v2';

/**
 * Get Ticketmaster API key from Supabase config
 */
async function getTicketmasterApiKey(): Promise<string | null> {
  return await getConfigValue('ticketmaster_api_key');
}

/**
 * Ticketmaster Attraction (Artist) interface
 */
export interface TicketmasterAttraction {
  id: string;
  name: string;
  url?: string;
  images?: Array<{
    url: string;
    ratio: string;
    width: number;
    height: number;
  }>;
  classifications?: Array<{
    segment?: { name: string };
    genre?: { name: string };
    subGenre?: { name: string };
  }>;
  upcomingEvents?: {
    _total: number;
  };
}

/**
 * Ticketmaster Event interface
 */
export interface TicketmasterEvent {
  id: string;
  name: string;
  url?: string;
  images?: Array<{
    url: string;
    ratio: string;
    width: number;
    height: number;
  }>;
  dates?: {
    start?: {
      localDate?: string;
      localTime?: string;
      dateTime?: string;
    };
    status?: {
      code: string;
    };
  };
  priceRanges?: Array<{
    type: string;
    currency: string;
    min: number;
    max: number;
  }>;
  _embedded?: {
    venues?: Array<{
      name: string;
      city?: { name: string };
      state?: { name: string; stateCode: string };
      country?: { name: string; countryCode: string };
      address?: { line1: string };
      location?: {
        latitude: string;
        longitude: string;
      };
    }>;
  };
  sales?: {
    public?: {
      startDateTime?: string;
      endDateTime?: string;
    };
  };
}

/**
 * Search for an attraction (artist) by name
 * Returns the best match based on Ticketmaster's relevance scoring
 *
 * @param artistName - The name of the artist to search for
 * @param genre - Optional genre to help narrow down results
 * @returns The best matching attraction or null
 */
export async function searchAttractionByName(
  artistName: string,
  genre?: string
): Promise<TicketmasterAttraction | null> {
  try {
    const apiKey = await getTicketmasterApiKey();
    if (!apiKey) {
      console.error('[Ticketmaster] API key not found');
      return null;
    }

    // Build query parameters
    const params = new URLSearchParams({
      apikey: apiKey,
      keyword: artistName,
      size: '5', // Get top 5 results
      sort: 'relevance,desc',
    });

    // Add genre classification if provided
    if (genre) {
      params.append('classificationName', genre);
    }

    const url = `${TICKETMASTER_API_BASE}/attractions.json?${params.toString()}`;


    const response = await fetch(url);

    if (!response.ok) {
      console.error('[Ticketmaster] API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    // Get the most relevant match (first result)
    const attractions = data._embedded?.attractions;
    if (!attractions || attractions.length === 0) {
      return null;
    }

    const bestMatch = attractions[0];

    return bestMatch;
  } catch (error) {
    console.error('[Ticketmaster] Error searching attraction:', error);
    return null;
  }
}

/**
 * Fetch events for a specific attraction ID
 *
 * @param attractionId - The Ticketmaster attraction ID
 * @param countryCode - Optional country code (e.g., 'US')
 * @param stateCode - Optional state code (e.g., 'CA')
 * @returns Array of events or empty array
 */
export async function fetchEventsByAttractionId(
  attractionId: string,
  countryCode?: string,
  stateCode?: string
): Promise<TicketmasterEvent[]> {
  try {
    const apiKey = await getTicketmasterApiKey();
    if (!apiKey) {
      console.error('[Ticketmaster] API key not found');
      return [];
    }

    // Build query parameters
    const params = new URLSearchParams({
      apikey: apiKey,
      attractionId: attractionId,
      size: '50', // Get up to 50 events
      sort: 'date,asc', // Sort by date ascending (soonest first)
    });

    // Add location filters if provided
    if (countryCode) {
      params.append('countryCode', countryCode);
    }
    if (stateCode) {
      params.append('stateCode', stateCode);
    }

    const url = `${TICKETMASTER_API_BASE}/events.json?${params.toString()}`;


    const response = await fetch(url);

    if (!response.ok) {
      console.error('[Ticketmaster] API error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();

    const events = data._embedded?.events || [];

    return events;
  } catch (error) {
    console.error('[Ticketmaster] Error fetching events:', error);
    return [];
  }
}

/**
 * Search for events by artist name (combines attraction search + event fetch)
 * This is a convenience method that does both steps
 *
 * @param artistName - The name of the artist
 * @param genre - Optional genre to help with matching
 * @returns Array of events or empty array
 */
export async function searchEventsByArtistName(
  artistName: string,
  genre?: string
): Promise<{ attraction: TicketmasterAttraction | null; events: TicketmasterEvent[] }> {
  try {
    // First, find the attraction
    const attraction = await searchAttractionByName(artistName, genre);

    if (!attraction) {
      return { attraction: null, events: [] };
    }

    // Then fetch events for that attraction
    const events = await fetchEventsByAttractionId(attraction.id);

    return { attraction, events };
  } catch (error) {
    console.error('[Ticketmaster] Error in searchEventsByArtistName:', error);
    return { attraction: null, events: [] };
  }
}

/**
 * Get the best image URL from Ticketmaster images array
 * Prefers 16:9 ratio, falls back to first available
 *
 * @param images - Array of Ticketmaster images
 * @returns Image URL or undefined
 */
export function getBestImageUrl(
  images?: Array<{ url: string; ratio: string; width: number; height: number }>
): string | undefined {
  if (!images || images.length === 0) return undefined;

  // Prefer 16:9 ratio
  const wideImage = images.find(img => img.ratio === '16_9');
  if (wideImage) return wideImage.url;

  // Fall back to first image
  return images[0]?.url;
}
