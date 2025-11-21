import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushMessage {
  to: string;
  sound: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { artistName, eventDetails } = await req.json();

    if (!artistName) {
      throw new Error('artistName is required');
    }

    console.log(`[Push Notifications] Sending notifications for artist: ${artistName}`);

    // Get the artist from database
    const { data: artist, error: artistError } = await supabaseClient
      .from('artists')
      .select('id, spotify_id, name')
      .eq('name', artistName)
      .single();

    if (artistError || !artist) {
      console.error('[Push Notifications] Artist not found:', artistError);
      return new Response(
        JSON.stringify({ error: 'Artist not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all users following this artist
    const { data: followers, error: followersError } = await supabaseClient
      .from('followed_artists')
      .select('user_id')
      .eq('artist_id', artist.id);

    if (followersError) {
      console.error('[Push Notifications] Error fetching followers:', followersError);
      throw followersError;
    }

    if (!followers || followers.length === 0) {
      console.log('[Push Notifications] No followers found for this artist');
      return new Response(
        JSON.stringify({ message: 'No followers to notify' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Push Notifications] Found ${followers.length} followers`);

    // Get push tokens for all followers
    const userIds = followers.map((f) => f.user_id);
    const { data: pushTokens, error: tokensError } = await supabaseClient
      .from('push_tokens')
      .select('token, user_id')
      .in('user_id', userIds);

    if (tokensError) {
      console.error('[Push Notifications] Error fetching push tokens:', tokensError);
      throw tokensError;
    }

    if (!pushTokens || pushTokens.length === 0) {
      console.log('[Push Notifications] No push tokens found for followers');
      return new Response(
        JSON.stringify({ message: 'No push tokens found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Push Notifications] Found ${pushTokens.length} push tokens`);

    // Create notification messages
    const messages: PushMessage[] = pushTokens.map((token) => ({
      to: token.token,
      sound: 'default',
      title: `🎵 New ${artist.name} Event!`,
      body: eventDetails?.venue
        ? `${artist.name} is performing at ${eventDetails.venue}`
        : `New event added for ${artist.name}`,
      data: {
        artistId: artist.spotify_id,
        artistName: artist.name,
        type: 'new_event',
      },
    }));

    // Send notifications to Expo Push API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log('[Push Notifications] Expo API response:', result);

    return new Response(
      JSON.stringify({
        success: true,
        notificationsSent: messages.length,
        result
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Push Notifications] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
