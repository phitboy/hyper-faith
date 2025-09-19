import { parseEther, formatEther } from 'viem'
import type { OmamoriToken } from './omamori'

/**
 * Parse tokenURI response from contract into OmamoriToken
 * Updated to handle OmamoriNFTOffChain contract format with Supabase Edge Functions
 */
export function parseTokenURI(tokenId: number, tokenURI: string): OmamoriToken {
  try {
    // TokenURI format: "data:application/json,{json}" or "data:application/json;base64,{base64_encoded_json}"
    if (!tokenURI || !tokenURI.includes(',')) {
      throw new Error('Invalid tokenURI format')
    }
    
    const [prefix, data] = tokenURI.split(',', 2)
    if (!data) {
      throw new Error('No data found in tokenURI')
    }
    
    let jsonString: string
    if (prefix.includes('base64')) {
      // Base64 encoded JSON
      jsonString = atob(data)
    } else {
      // Plain JSON
      jsonString = decodeURIComponent(data)
    }
    
    const metadata = JSON.parse(jsonString)
    
    // Extract attributes from metadata
    const attributes = metadata.attributes || []
    const getAttributeValue = (traitType: string) => {
      const attr = attributes.find((a: any) => a.trait_type === traitType)
      return attr ? attr.value : undefined
    }
    
    // Parse image (URL to Supabase Edge Function for off-chain rendering)
    let imageSvg = ''
    if (metadata.image?.startsWith('data:image/svg+xml;base64,')) {
      // Legacy: base64-encoded SVG (for backward compatibility)
      try {
        imageSvg = atob(metadata.image.split(',')[1])
      } catch (error) {
        console.warn('Failed to decode SVG image:', error)
        imageSvg = metadata.image || ''
      }
    } else {
      // New: URL to Supabase Edge Function
      imageSvg = metadata.image || ''
    }
    
    // Handle OmamoriNFTOffChain format (missing Major ID, Minor ID, Punches, Seed)
    // These will be filled by getTokenData() in tokenQueries.ts
    const hypeBurnedValue = getAttributeValue('HYPE Burned')
    const hypeBurnedFormatted = hypeBurnedValue ? 
      (typeof hypeBurnedValue === 'number' ? 
        formatEther(BigInt(hypeBurnedValue)) : 
        hypeBurnedValue.toString()) : '0'
    
    return {
      tokenId,
      majorId: parseInt(getAttributeValue('Major ID')) || 0,
      minorId: parseInt(getAttributeValue('Minor ID')) || 0,
      materialId: 0, // Will be filled from getTokenData if needed
      materialName: getAttributeValue('Material') || 'Unknown',
      materialTier: getAttributeValue('Rarity') || 'Common',
      punchCount: parseInt(getAttributeValue('Punches')) || 0,
      hypeBurned: hypeBurnedFormatted,
      seed: getAttributeValue('Seed') || '0x0',
      imageSvg,
      mintedAt: Date.now(), // Approximate, could be improved with block timestamp
    } as OmamoriToken
  } catch (error) {
    console.error('Failed to parse tokenURI:', error, {
      tokenId,
      tokenURI: tokenURI?.substring(0, 100) + '...' // Log first 100 chars for debugging
    })
    throw new Error(`Failed to parse token ${tokenId} metadata: ${error.message}`)
  }
}

/**
 * Extract token ID from mint transaction receipt
 */
export function extractTokenIdFromLogs(logs: any[]): number | null {
  try {
    // Look for Transfer event from address(0) (mint)
    const transferLog = logs.find(log => 
      log.topics?.[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' && // Transfer event signature
      log.topics?.[1] === '0x0000000000000000000000000000000000000000000000000000000000000000' // from address(0)
    )
    
    if (transferLog && transferLog.topics?.[3]) {
      // Token ID is in the third topic (indexed parameter)
      return parseInt(transferLog.topics[3], 16)
    }
    
    return null
  } catch (error) {
    console.error('Failed to extract token ID from logs:', error)
    return null
  }
}

/**
 * Format HYPE amount for display
 */
export function formatHypeAmount(weiAmount: string | bigint): string {
  try {
    const formatted = formatEther(BigInt(weiAmount))
    return parseFloat(formatted).toFixed(4)
  } catch (error) {
    return '0.0000'
  }
}

/**
 * Parse HYPE amount from string to wei
 */
export function parseHypeAmount(hypeAmount: string): bigint {
  try {
    return parseEther(hypeAmount)
  } catch (error) {
    throw new Error(`Invalid HYPE amount: ${hypeAmount}`)
  }
}

/**
 * Validate minimum HYPE amount (0.01 HYPE)
 */
export function validateHypeAmount(hypeAmount: string): boolean {
  try {
    const wei = parseHypeAmount(hypeAmount)
    const minWei = parseEther('0.01')
    return wei >= minWei
  } catch (error) {
    return false
  }
}

/**
 * Get error message from contract error
 */
export function getContractErrorMessage(error: any): string {
  if (error?.cause?.reason) {
    return error.cause.reason
  }
  
  if (error?.message) {
    // Common error patterns
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient HYPE balance'
    }
    if (error.message.includes('user rejected')) {
      return 'Transaction rejected by user'
    }
    if (error.message.includes('Insufficient burn amount')) {
      return 'Minimum 0.01 HYPE required'
    }
  }
  
  return 'Transaction failed. Please try again.'
}
