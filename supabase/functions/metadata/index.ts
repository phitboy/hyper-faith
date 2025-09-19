import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getMaterial, getMajor, getMinorName } from "../_shared/renderer.ts"

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

    // Get configuration from environment
    const contractAddress = Deno.env.get('CONTRACT_ADDRESS')
    const rpcUrl = Deno.env.get('RPC_URL') || 'https://rpc.hyperliquid.xyz/evm'
    const baseUrl = Deno.env.get('BASE_URL') || 'https://impoplixuoggwnzgvqvx.supabase.co'

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

    // Generate human-readable names
    const material = getMaterial(materialId)
    const major = getMajor(majorId)
    const minorName = getMinorName(majorId, minorId)

    // Format HYPE burned amount
    const hypeBurnedFormatted = (Number(hypeBurned) / 1e18).toFixed(4)

    // Generate metadata JSON
    const metadata = {
      name: `Omamori #${tokenId}`,
      description: "Ancient talismans for modern traders. High-quality off-chain generative art powered by Supabase Edge Functions.",
      image: `${baseUrl}/functions/v1/render/${tokenId}`,
      attributes: [
        { trait_type: "Material", value: material.name },
        { trait_type: "Rarity Tier", value: material.tier },
        { trait_type: "Major Arcanum", value: major.name },
        { trait_type: "Minor Arcanum", value: minorName },
        { trait_type: "Major ID", value: majorId },
        { trait_type: "Minor ID", value: minorId },
        { trait_type: "Punch Count", value: punchCount },
        { trait_type: "Seed", value: `0x${seed.toString(16)}` },
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
