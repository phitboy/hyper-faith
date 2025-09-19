import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { renderOmamoriSVG, getMaterialName, getMaterialTier, getMajorName, getMinorName } from "../_shared/renderer.ts"

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

    // For now, we'll use mock data since we need to implement contract interaction
    // In production, you'd fetch this from the blockchain
    const mockTokenData = {
      seed: '0x1234567890abcdef',
      materialId: 21, // Gold
      majorId: 1, // Leverage
      minorId: 0, // Margin
      punchCount: 15,
      hypeBurned: '1000000000000000000' // 1 HYPE
    }

    // Generate human-readable names
    const materialName = getMaterialName(mockTokenData.materialId)
    const materialTier = getMaterialTier(mockTokenData.materialId)
    const majorName = getMajorName(mockTokenData.majorId)
    const minorName = getMinorName(mockTokenData.majorId, mockTokenData.minorId)

    // Generate high-quality SVG
    const svg = renderOmamoriSVG({
      seed: mockTokenData.seed,
      materialId: mockTokenData.materialId,
      majorId: mockTokenData.majorId,
      minorId: mockTokenData.minorId,
      punchCount: mockTokenData.punchCount,
      materialName,
      materialTier: materialTier as any,
    })

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

