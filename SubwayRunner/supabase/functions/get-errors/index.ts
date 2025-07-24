import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { startDate, endDate, errorType, limit = 100, gameVersion } = await req.json()

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Build query
    let query = supabase
      .from('subway_runner_errors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 500)) // Max 500 errors

    // Apply filters
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }
    if (errorType) {
      query = query.eq('error_type', errorType)
    }
    if (gameVersion) {
      query = query.eq('game_version', gameVersion)
    }

    // Execute query
    const { data, error } = await query

    if (error) {
      throw error
    }

    // Add summary statistics
    const stats = {
      total: data?.length || 0,
      byType: {},
      byVersion: {},
      recentErrors: data?.slice(0, 10) || []
    }

    // Calculate statistics
    if (data && data.length > 0) {
      data.forEach(err => {
        // Count by type
        stats.byType[err.error_type] = (stats.byType[err.error_type] || 0) + 1
        
        // Count by version
        stats.byVersion[err.game_version] = (stats.byVersion[err.game_version] || 0) + 1
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data, 
        stats,
        query: { startDate, endDate, errorType, limit, gameVersion }
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})