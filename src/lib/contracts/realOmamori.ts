import { parseEther, formatEther } from 'viem'
import type { OmamoriToken } from './omamori'

/**
 * Parse tokenURI response from contract into OmamoriToken
 */
export function parseTokenURI(tokenId: number, tokenURI: string): OmamoriToken {
  try {
    // TokenURI format: "data:application/json;base64,{base64_encoded_json}"
    const base64Json = tokenURI.split(',')[1]
    const jsonString = atob(base64Json)
    const metadata = JSON.parse(jsonString)
    
    // Extract attributes from metadata
    const attributes = metadata.attributes || []
    const getAttributeValue = (traitType: string) => {
      const attr = attributes.find((a: any) => a.trait_type === traitType)
      return attr ? attr.value : undefined
    }
    
    // Parse image (SVG is base64 encoded)
    const imageSvg = metadata.image?.startsWith('data:image/svg+xml;base64,') 
      ? atob(metadata.image.split(',')[1])
      : metadata.image || ''
    
    return {
      tokenId,
      majorId: parseInt(getAttributeValue('Major ID')) || 0,
      minorId: parseInt(getAttributeValue('Minor ID')) || 0,
      materialId: 0, // Will be filled from getTokenData
      materialName: getAttributeValue('Material') || 'Unknown',
      materialTier: getAttributeValue('Rarity') || 'Common',
      punchCount: parseInt(getAttributeValue('Punches')) || 0,
      hypeBurned: getAttributeValue('HYPE Burned') || '0',
      seed: getAttributeValue('Seed') || '0x0',
      imageSvg,
      mintedAt: Date.now(), // Approximate, could be improved with block timestamp
    } as OmamoriToken
  } catch (error) {
    console.error('Failed to parse tokenURI:', error)
    throw new Error(`Failed to parse token ${tokenId} metadata`)
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
