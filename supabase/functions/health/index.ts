import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const contractAddress = Deno.env.get('CONTRACT_ADDRESS')
    const rpcUrl = Deno.env.get('RPC_URL') || 'https://rpc.hyperliquid.xyz/evm'
    const baseUrl = Deno.env.get('BASE_URL')

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        renderer: 'operational',
        metadata: 'operational',
        blockchain: {
          rpc: rpcUrl,
          contract: contractAddress || 'not_configured'
        },
        supabase: {
          url: baseUrl || 'not_configured'
        }
      },
      version: '1.0.0'
    }

    return new Response(JSON.stringify(healthData, null, 2), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })

  } catch (error) {
    console.error('Health check error:', error)
    return new Response(
      JSON.stringify({ 
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
