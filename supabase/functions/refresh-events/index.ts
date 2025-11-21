// Edge Function to automatically refresh events from Ticketmaster
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Database } from '../_shared/database.types.ts'

console.log("Event Refresh Function Started")

Deno.serve(async (req) => {
  try {
    // Create Supabase client with service role key for admin access
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        db: { schema: 'public' },
        auth: { persistSession: false }
      }
    )

    // Get Ticketmaster API key from app_config
    const { data: configData, error: configError } = await supabaseClient
      .from('app_config')
      .select('value')
      .eq('key', 'ticketmaster_api_key')
      .single()

    if (configError || !configData) {
      console.error('Config error details:', configError)
      console.error('Config data:', configData)
      throw new Error(`Failed to get Ticketmaster API key: ${configError?.message || 'No data returned'}`)
    }

    const ticketmasterApiKey = configData.value

    // Get all artists with Ticketmaster IDs
    const { data: artists, error: artistsError } = await supabaseClient
      .from('artists')
      .select('id, name, ticketmaster_id')
      .not('ticketmaster_id', 'is', null)

    if (artistsError) {
      throw new Error(`Failed to fetch artists: ${artistsError.message}`)
    }

    console.log(`Found ${artists?.length || 0} artists to refresh`)

    let successCount = 0
    let failedCount = 0

    // Refresh events for each artist
    for (const artist of artists || []) {
      try {
        // Fetch events from Ticketmaster
        const eventsResponse = await fetch(
          `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${ticketmasterApiKey}&attractionId=${artist.ticketmaster_id}&size=50&sort=date,asc`
        )

        if (!eventsResponse.ok) {
          console.log(`Failed to fetch events for ${artist.name}`)
          failedCount++
          continue
        }

        const eventsData = await eventsResponse.json()
        const events = eventsData._embedded?.events || []

        console.log(`Found ${events.length} events for ${artist.name}`)

        // Transform and upsert events
        const eventsToUpsert = events.map((event: any) => {
          const venue = event._embedded?.venues?.[0]
          const startDate = event.dates?.start

          return {
            artist_id: artist.id,
            artist_name: artist.name,
            event_name: event.name,
            venue: venue?.name || 'TBA',
            location: `${venue?.city?.name || ''}, ${venue?.state?.stateCode || venue?.country?.countryCode || ''}`.trim(),
            city: venue?.city?.name,
            state: venue?.state?.stateCode,
            country: venue?.country?.countryCode,
            latitude: venue?.location?.latitude ? parseFloat(venue.location.latitude) : null,
            longitude: venue?.location?.longitude ? parseFloat(venue.location.longitude) : null,
            event_date: startDate?.dateTime || startDate?.localDate || new Date().toISOString(),
            status: mapStatus(event.dates?.status?.code),
            tickets_available: event.dates?.status?.code !== 'offsale',
            ticket_url: event.url,
            price_range: formatPriceRange(event.priceRanges),
            image_url: getBestImageUrl(event.images),
            external_id: event.id,
          }
        })

        if (eventsToUpsert.length > 0) {
          // Check if these are new events before upserting
          const existingEventIds = new Set()
          const { data: existingEvents } = await supabaseClient
            .from('events')
            .select('external_id')
            .in('external_id', eventsToUpsert.map(e => e.external_id))

          if (existingEvents) {
            existingEvents.forEach(e => existingEventIds.add(e.external_id))
          }

          const { error: upsertError } = await supabaseClient
            .from('events')
            .upsert(eventsToUpsert, {
              onConflict: 'external_id',
              ignoreDuplicates: false,
            })

          if (upsertError) {
            console.log(`Error upserting events for ${artist.name}:`, upsertError)
            failedCount++
          } else {
            successCount++
            console.log(`✓ Refreshed ${eventsToUpsert.length} events for ${artist.name}`)

            // Send push notification for new events (not existing ones)
            const newEvents = eventsToUpsert.filter(e => !existingEventIds.has(e.external_id))
            if (newEvents.length > 0) {
              try {
                const notificationResponse = await fetch(
                  `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push-notifications`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                    },
                    body: JSON.stringify({
                      artistName: artist.name,
                      eventDetails: {
                        venue: newEvents[0].venue,
                        location: newEvents[0].location,
                        date: newEvents[0].event_date,
                      },
                    }),
                  }
                )

                if (notificationResponse.ok) {
                  console.log(`✓ Sent push notifications for ${artist.name}`)
                } else {
                  console.log(`Failed to send push notifications for ${artist.name}`)
                }
              } catch (notifError) {
                console.log(`Error sending push notifications for ${artist.name}:`, notifError)
              }
            }
          }
        } else {
          successCount++
          console.log(`✓ No events found for ${artist.name} (cleaned up old events)`)
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.log(`Error processing ${artist.name}:`, error)
        failedCount++
      }
    }

    // Clean up old events (older than 7 days past)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 7)

    const { data: deletedEvents, error: deleteError } = await supabaseClient
      .from('events')
      .delete()
      .lt('event_date', cutoffDate.toISOString())
      .select('id')

    const deletedCount = deletedEvents?.length || 0
    console.log(`Cleaned up ${deletedCount} old events`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Event refresh complete`,
        stats: {
          artistsProcessed: artists?.length || 0,
          successCount,
          failedCount,
          oldEventsDeleted: deletedCount,
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in refresh-events function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Helper functions
function mapStatus(statusCode?: string): string {
  if (!statusCode) return 'announced'

  switch (statusCode.toLowerCase()) {
    case 'onsale':
      return 'on_sale'
    case 'offsale':
      return 'sold_out'
    case 'cancelled':
    case 'canceled':
      return 'cancelled'
    case 'postponed':
    case 'rescheduled':
      return 'postponed'
    default:
      return 'announced'
  }
}

function formatPriceRange(priceRanges?: Array<{ type: string; currency: string; min: number; max: number }>): string | null {
  if (!priceRanges || priceRanges.length === 0) return null

  const range = priceRanges[0]
  const currency = range.currency === 'USD' ? '$' : range.currency

  if (range.min === range.max) {
    return `${currency}${range.min}`
  }

  return `${currency}${range.min} - ${currency}${range.max}`
}

function getBestImageUrl(images?: Array<{ url: string; ratio: string; width: number; height: number }>): string | null {
  if (!images || images.length === 0) return null

  // Prefer 16:9 ratio images
  const wideImage = images.find(img => img.ratio === '16_9')
  if (wideImage) return wideImage.url

  // Fall back to first image
  return images[0]?.url || null
}
