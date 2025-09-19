import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getMaterialName, getMaterialTier, getMajorName, getMinorName } from "../_shared/renderer.ts"

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

    // Get base URL for image rendering
    const baseUrl = Deno.env.get('BASE_URL') || 'https://impoplixuoggwnzgvqvx.supabase.co'
    
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

    // Format HYPE burned amount
    const hypeBurnedFormatted = (parseInt(mockTokenData.hypeBurned) / 1e18).toFixed(4)

    // Generate metadata JSON
    const metadata = {
      name: `Omamori #${tokenId}`,
      description: "Ancient talismans for modern traders. High-quality off-chain generative art powered by Supabase Edge Functions.",
      image: `${baseUrl}/functions/v1/render/${tokenId}`,
      attributes: [
        { trait_type: "Material", value: materialName },
        { trait_type: "Rarity Tier", value: materialTier },
        { trait_type: "Major", value: majorName },
        { trait_type: "Minor", value: minorName },
        { trait_type: "Major ID", value: mockTokenData.majorId },
        { trait_type: "Minor ID", value: mockTokenData.minorId },
        { trait_type: "Punch Count", value: mockTokenData.punchCount },
        { trait_type: "Seed", value: mockTokenData.seed },
        { trait_type: "HYPE Burned", value: hypeBurnedFormatted },
      ],
    }

    return new Response(JSON.stringify(metadata), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    })

  } catch (error) {
    console.error('Error generating metadata:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate metadata',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
