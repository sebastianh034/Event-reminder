import { useState, useEffect } from 'react';
import {
  getEventsByArtistName,
  getPastEventsByArtistName,
  type Event as SupabaseEvent,
} from '../utils/eventsService';
import { fetchAndSaveArtistEvents } from '../utils/eventsAPI';
import { supabase } from '../utils/supabase';

interface Artist {
  name: string;
  spotifyId: string;
  image: string;
}

export function useArtistEvents(artist: Artist) {
  const [allEvents, setAllEvents] = useState<SupabaseEvent[]>([]);
  const [allPastEvents, setAllPastEvents] = useState<SupabaseEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = async () => {
    if (!artist.name) return;

    setLoading(true);
    try {
      let upcomingEvents = await getEventsByArtistName(artist.name, true);
      let pastEvents = await getPastEventsByArtistName(artist.name);

      if (upcomingEvents.length === 0) {
        const { data: existingArtist } = await supabase
          .from('artists')
          .select('id, ticketmaster_id')
          .eq('name', artist.name)
          .single();

        let artistDbId = existingArtist?.id;

        if (!artistDbId) {
          const { data: newArtist } = await supabase
            .from('artists')
            .insert({
              name: artist.name,
              spotify_id: artist.spotifyId,
              image_url: artist.image,
            })
            .select('id')
            .single();
          artistDbId = newArtist?.id;
        }

        if (artistDbId) {
          const result = await fetchAndSaveArtistEvents(
            artistDbId,
            artist.name,
            existingArtist?.ticketmaster_id
          );

          if (result.ticketmasterId && !existingArtist?.ticketmaster_id) {
            await supabase
              .from('artists')
              .update({ ticketmaster_id: result.ticketmasterId })
              .eq('id', artistDbId);
          }

          upcomingEvents = await getEventsByArtistName(artist.name, true);
          pastEvents = await getPastEventsByArtistName(artist.name);
        }
      }

      setAllEvents(upcomingEvents);
      setAllPastEvents(pastEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshEvents = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  useEffect(() => {
    loadEvents();
  }, [artist.name]);

  return {
    allEvents,
    allPastEvents,
    loading,
    refreshing,
    loadEvents,
    refreshEvents
  };
}
