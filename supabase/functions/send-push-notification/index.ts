// Supabase Edge Function to send push notifications via Expo Push Service
// Deploy this to Supabase using: supabase functions deploy send-push-notification

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

interface PushNotificationRequest {
  userId?: string // Send to specific user
  userIds?: string[] // Send to multiple users
  title: string
  body: string
  data?: Record<string, any>
}

serve(async (req) => {
  try {
    // Parse request body
    const { userId, userIds, title, body, data }: PushNotificationRequest = await req.json()

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Build query for push tokens
    let query = supabaseClient
      .from('push_tokens')
      .select('token')

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds)
    } else {
      return new Response(
        JSON.stringify({ error: 'userId or userIds required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get push tokens from database
    const { data: tokens, error: dbError } = await query

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch push tokens' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No push tokens found for user(s)' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Prepare push notification messages
    const messages = tokens.map(({ token }) => ({
      to: token,
      sound: 'default',
      title: title,
      body: body,
      data: data || {},
    }))

    // Send push notifications to Expo Push Service
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    const result = await response.json()

    console.log('Expo Push Response:', result)

    return new Response(
      JSON.stringify({
        success: true,
        sentTo: tokens.length,
        expoPushResponse: result
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-push-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
