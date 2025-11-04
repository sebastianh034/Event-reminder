/**
 * Events Service - Fetch events from Supabase
 */

import { supabase } from './supabase';

/**
 * Event interface matching our Supabase schema
 */
export interface Event {
  id: string;
  artist_id: string;
  artist_name: string;
  event_name: string;
  venue: string;
  location: string;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  event_date: string;
  status: 'on_sale' | 'sold_out' | 'cancelled' | 'postponed' | 'announced';
  tickets_available: boolean;
  ticket_url: string | null;
  price_range: string | null;
  image_url: string | null;
  external_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all upcoming events for artists the user is following
 *
 * @param userId - The user's UUID
 * @returns Array of events
 */
export async function getFollowedArtistsEvents(userId: string): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        artists!inner (
          followed_artists!inner (
            user_id
          )
        )
      `)
      .eq('artists.followed_artists.user_id', userId)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(10);

    if (error) {
      console.error('[Events Service] Error fetching followed artists events:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Events Service] Exception in getFollowedArtistsEvents:', error);
    return [];
  }
}

/**
 * Get all events for a specific artist
 *
 * @param artistId - The artist's UUID
 * @param includeUpcomingOnly - Whether to only return upcoming events
 * @returns Array of events
 */
export async function getEventsByArtistId(
  artistId: string,
  includeUpcomingOnly: boolean = true
): Promise<Event[]> {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .eq('artist_id', artistId);

    if (includeUpcomingOnly) {
      query = query.gte('event_date', new Date().toISOString());
    }

    query = query.order('event_date', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('[Events Service] Error fetching artist events:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Events Service] Exception in getEventsByArtistId:', error);
    return [];
  }
}

/**
 * Get all events for a specific artist by artist name
 *
 * @param artistName - The artist's name
 * @param includeUpcomingOnly - Whether to only return upcoming events
 * @returns Array of events
 */
export async function getEventsByArtistName(
  artistName: string,
  includeUpcomingOnly: boolean = true
): Promise<Event[]> {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .eq('artist_name', artistName);

    if (includeUpcomingOnly) {
      query = query.gte('event_date', new Date().toISOString());
    }

    query = query.order('event_date', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('[Events Service] Error fetching artist events by name:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Events Service] Exception in getEventsByArtistName:', error);
    return [];
  }
}

/**
 * Get past events for a specific artist
 *
 * @param artistId - The artist's UUID
 * @returns Array of past events
 */
export async function getPastEventsByArtistId(artistId: string): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('artist_id', artistId)
      .lt('event_date', new Date().toISOString())
      .order('event_date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('[Events Service] Error fetching past artist events:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Events Service] Exception in getPastEventsByArtistId:', error);
    return [];
  }
}

/**
 * Get past events for a specific artist by name
 *
 * @param artistName - The artist's name
 * @returns Array of past events
 */
export async function getPastEventsByArtistName(artistName: string): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('artist_name', artistName)
      .lt('event_date', new Date().toISOString())
      .order('event_date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('[Events Service] Error fetching past artist events by name:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Events Service] Exception in getPastEventsByArtistName:', error);
    return [];
  }
}

/**
 * Get all past events for artists the user is following
 *
 * @param userId - The user's UUID
 * @returns Array of past events
 */
export async function getPastFollowedArtistsEvents(userId: string): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        artists!inner (
          followed_artists!inner (
            user_id
          )
        )
      `)
      .eq('artists.followed_artists.user_id', userId)
      .lt('event_date', new Date().toISOString())
      .order('event_date', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[Events Service] Error fetching past followed artists events:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Events Service] Exception in getPastFollowedArtistsEvents:', error);
    return [];
  }
}

/**
 * Format event date to readable string
 *
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Get event status color
 *
 * @param status - Event status
 * @returns Color string
 */
export function getEventStatusColor(status: string): string {
  switch (status) {
    case 'on_sale':
      return '#10B981'; // green
    case 'sold_out':
      return '#EF4444'; // red
    case 'cancelled':
      return '#6B7280'; // gray
    case 'postponed':
      return '#F59E0B'; // orange
    case 'announced':
      return '#3B82F6'; // blue
    default:
      return '#9CA3AF'; // light gray
  }
}

/**
 * Get event status label
 *
 * @param status - Event status
 * @returns Status label
 */
export function getEventStatusLabel(status: string): string {
  switch (status) {
    case 'on_sale':
      return 'On Sale';
    case 'sold_out':
      return 'Sold Out';
    case 'cancelled':
      return 'Cancelled';
    case 'postponed':
      return 'Postponed';
    case 'announced':
      return 'Announced';
    default:
      return 'Unknown';
  }
}
