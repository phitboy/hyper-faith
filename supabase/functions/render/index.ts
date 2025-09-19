import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { generateOmamoriSVG } from "../_shared/renderer.ts"

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
    const url = new URL(req.url)
    const tokenId = url.pathname.split('/').pop()

    if (!tokenId || isNaN(Number(tokenId))) {
      return new Response(
        JSON.stringify({ error: 'Invalid token ID' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get contract address from environment
    const contractAddress = Deno.env.get('CONTRACT_ADDRESS')
    const rpcUrl = Deno.env.get('RPC_URL') || 'https://rpc.hyperliquid.xyz/evm'

    if (!contractAddress) {
      return new Response(
        JSON.stringify({ error: 'Contract address not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch token data from contract
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: contractAddress,
          data: `0xc0831416${Number(tokenId).toString(16).padStart(64, '0')}` // getTokenData(uint256)
        }, 'latest'],
        id: 1
      })
    })

    const result = await response.json()
    
    if (result.error) {
      throw new Error(`Contract call failed: ${result.error.message}`)
    }

    // Decode the result (6 values: seed, materialId, majorId, minorId, punchCount, hypeBurned)
    const data = result.result
    if (!data || data === '0x') {
      throw new Error('Token does not exist')
    }

    // Parse hex data (each value is 32 bytes)
    const seed = BigInt('0x' + data.slice(2, 66))
    const materialId = parseInt(data.slice(66, 130), 16)
    const majorId = parseInt(data.slice(130, 194), 16)
    const minorId = parseInt(data.slice(194, 258), 16)
    const punchCount = parseInt(data.slice(258, 322), 16)
    const hypeBurned = BigInt('0x' + data.slice(322, 386))

    // Generate high-quality SVG
    const svg = generateOmamoriSVG(seed, materialId, majorId, minorId, punchCount, hypeBurned)

    // Return SVG with proper headers
    return new Response(svg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    })

  } catch (error) {
    console.error('Error rendering SVG:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to render SVG',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

