/**
 * Events API - Manages event data between Ticketmaster and Supabase
 */

import { supabase } from './supabase';
import {
  fetchEventsByAttractionId,
  searchEventsByArtistName,
  getBestImageUrl,
  type TicketmasterEvent,
} from './ticketmasterAPI';

/**
 * Save Ticketmaster events to Supabase events table
 *
 * @param events - Array of Ticketmaster events
 * @param artistId - UUID of the artist in our database
 * @param artistName - Name of the artist
 * @returns Success boolean
 */
export async function saveEventsToSupabase(
  events: TicketmasterEvent[],
  artistId: string,
  artistName: string
): Promise<boolean> {
  try {
    if (events.length === 0) {
      return true;
    }

    // Transform Ticketmaster events to our database schema
    const eventsToInsert = events.map(event => {
      const venue = event._embedded?.venues?.[0];
      const startDate = event.dates?.start;

      return {
        artist_id: artistId,
        artist_name: artistName,
        event_name: event.name,
        venue: venue?.name || 'TBA',
        location: `${venue?.city?.name || ''}, ${venue?.state?.stateCode || venue?.country?.countryCode || ''}`.trim(),
        city: venue?.city?.name,
        state: venue?.state?.stateCode,
        country: venue?.country?.countryCode,
        latitude: venue?.location?.latitude ? parseFloat(venue.location.latitude) : null,
        longitude: venue?.location?.longitude ? parseFloat(venue.location.longitude) : null,
        event_date: startDate?.dateTime || startDate?.localDate || new Date().toISOString(),
        status: mapTicketmasterStatus(event.dates?.status?.code),
        tickets_available: event.dates?.status?.code !== 'offsale',
        ticket_url: event.url,
        price_range: formatPriceRange(event.priceRanges),
        image_url: getBestImageUrl(event.images),
        external_id: event.id, // Ticketmaster event ID
      };
    });

    // Use upsert to avoid duplicates (based on external_id unique constraint)
    const { error } = await supabase
      .from('events')
      .upsert(eventsToInsert, {
        onConflict: 'external_id',
        ignoreDuplicates: false, // Update existing events
      });

    if (error) {
      console.error('[Events API] Error saving events to Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Events API] Exception saving events:', error);
    return false;
  }
}

/**
 * Fetch events for an artist and save to Supabase
 * This is the main function to call when a user follows an artist
 *
 * @param artistId - UUID of artist in our database
 * @param artistName - Name of the artist
 * @param ticketmasterId - Ticketmaster attraction ID (if known)
 * @param genre - Optional genre for better matching
 * @returns Object with success status and ticketmaster ID
 */
export async function fetchAndSaveArtistEvents(
  artistId: string,
  artistName: string,
  ticketmasterId?: string,
  genre?: string
): Promise<{ success: boolean; ticketmasterId: string | null }> {
  try {
    let events: TicketmasterEvent[] = [];
    let attractionId = ticketmasterId;

    if (ticketmasterId) {
      // We already have the Ticketmaster ID, just fetch events
      events = await fetchEventsByAttractionId(ticketmasterId);
    } else {
      // Search for the artist and get their events
      const result = await searchEventsByArtistName(artistName, genre);

      if (result.attraction) {
        attractionId = result.attraction.id;
        events = result.events;
      }
    }

    if (!attractionId) {
      return { success: false, ticketmasterId: null };
    }

    // Save events to Supabase
    const saved = await saveEventsToSupabase(events, artistId, artistName);

    return {
      success: saved,
      ticketmasterId: attractionId,
    };
  } catch (error) {
    console.error('[Events API] Error in fetchAndSaveArtistEvents:', error);
    return { success: false, ticketmasterId: null };
  }
}

/**
 * Map Ticketmaster status codes to our event status
 */
function mapTicketmasterStatus(statusCode?: string): string {
  if (!statusCode) return 'announced';

  switch (statusCode.toLowerCase()) {
    case 'onsale':
      return 'on_sale';
    case 'offsale':
      return 'sold_out';
    case 'cancelled':
    case 'canceled':
      return 'cancelled';
    case 'postponed':
      return 'postponed';
    case 'rescheduled':
      return 'postponed';
    default:
      return 'announced';
  }
}

/**
 * Format price range from Ticketmaster data
 */
function formatPriceRange(
  priceRanges?: Array<{ type: string; currency: string; min: number; max: number }>
): string | null {
  if (!priceRanges || priceRanges.length === 0) return null;

  const range = priceRanges[0];
  const currency = range.currency === 'USD' ? '$' : range.currency;

  if (range.min === range.max) {
    return `${currency}${range.min}`;
  }

  return `${currency}${range.min} - ${currency}${range.max}`;
}

/**
 * Refresh events for a specific artist
 * Call this periodically to keep events up to date
 *
 * @param artistId - UUID of artist in our database
 * @returns Success boolean
 */
export async function refreshArtistEvents(artistId: string): Promise<boolean> {
  try {
    // Get artist details from database
    const { data: artist, error } = await supabase
      .from('artists')
      .select('id, name, ticketmaster_id, genre')
      .eq('id', artistId)
      .single();

    if (error || !artist) {
      console.error('[Events API] Artist not found:', artistId);
      return false;
    }

    // Fetch and save updated events
    const result = await fetchAndSaveArtistEvents(
      artist.id,
      artist.name,
      artist.ticketmaster_id,
      artist.genre
    );

    return result.success;
  } catch (error) {
    console.error('[Events API] Error refreshing artist events:', error);
    return false;
  }
}
