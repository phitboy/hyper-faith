import { parseEther, formatEther } from 'viem'
import { MIN_HYPE_BURN } from './index'

/**
 * Format HYPE amount for display
 */
export function formatHype(amount: string | bigint): string {
  const formatted = formatEther(BigInt(amount))
  const num = parseFloat(formatted)
  
  if (num === 0) return '0 HYPE'
  if (num < 0.001) return '<0.001 HYPE'
  if (num >= 1000) return `${Math.floor(num).toLocaleString()} HYPE`
  
  return `${num.toFixed(3).replace(/\.?0+$/, '')} HYPE`
}

/**
 * Parse HYPE amount from user input
 */
export function parseHype(amount: string): string {
  try {
    const parsed = parseEther(amount)
    return parsed.toString()
  } catch {
    return '0'
  }
}

/**
 * Validate HYPE burn amount
 */
export function validateBurnAmount(amount: string): { isValid: boolean; error?: string } {
  try {
    const parsed = BigInt(amount)
    const minBurn = BigInt(MIN_HYPE_BURN)
    
    if (parsed < minBurn) {
      return {
        isValid: false,
        error: `Minimum burn amount is ${formatHype(MIN_HYPE_BURN)}`
      }
    }
    
    return { isValid: true }
  } catch {
    return {
      isValid: false,
      error: 'Invalid amount'
    }
  }
}

/**
 * Decode base64 token URI to get metadata
 */
export function decodeTokenURI(uri: string): { metadata: any; svg: string } | null {
  try {
    // Remove data:application/json;base64, prefix
    const base64Data = uri.replace('data:application/json;base64,', '')
    const jsonString = atob(base64Data)
    const metadata = JSON.parse(jsonString)
    
    // Extract SVG from image data URI
    let svg = ''
    if (metadata.image && metadata.image.startsWith('data:image/svg+xml;base64,')) {
      const svgBase64 = metadata.image.replace('data:image/svg+xml;base64,', '')
      svg = atob(svgBase64)
    }
    
    return { metadata, svg }
  } catch (error) {
    console.error('Failed to decode token URI:', error)
    return null
  }
}

/**
 * Get major glyph name by ID
 */
export function getMajorName(majorId: number): string {
  const names = [
    'Liquidity', 'Leverage', 'Volatility', 'Narrative', 'The Macro', 'Discipline',
    'FOMO', 'FUD', 'RNG', 'Max Pain', 'The Chat', 'Ego'
  ]
  return names[majorId] || 'Unknown'
}

/**
 * Get minor glyph name by major and minor ID
 */
export function getMinorName(majorId: number, minorId: number): string {
  const minorNames = [
    ['Fills', 'Market-Maker', 'Spread', 'Volume'],                    // Liquidity
    ['Margin', 'Liqd', 'Max Long', 'Max Short'],                     // Leverage  
    ['Pump', 'Dump', 'Chop', 'Pattern'],                             // Volatility
    ['Insider', 'Hype', 'News', 'Cope'],                             // Narrative
    ['Regulator', 'Bear', 'Bull', 'Black Swan'],                     // The Macro
    ['Take Profit', 'Size', 'Strategy', 'Sideline'],                 // Discipline
    ['BTFD', 'Top Signal', 'Market Price', 'Conviction'],            // FOMO
    ['Shills', 'PsyOps', 'Rugs', 'Scam'],                          // FUD
    ['Mints', 'Order Routing', 'Uptime', 'Prediction'],             // RNG
    ['Too Early', 'Too Late', 'Too Little', 'Too Much'],            // Max Pain
    ['Alpha', 'Slop', 'In', 'Out'],                                 // The Chat
    ['Touch Grass', 'Hyperliquid', 'Family', 'Needs']               // Ego
  ]
  
  return minorNames[majorId]?.[minorId] || 'Unknown'
}

/**
 * Get material tier color for UI
 */
export function getTierColor(tierName: string): string {
  switch (tierName.toLowerCase()) {
    case 'common': return '#8B7355'
    case 'uncommon': return '#4B9B47'
    case 'rare': return '#4A90E2'
    case 'ultra rare': return '#9B59B6'
    case 'mythic': return '#F39C12'
    default: return '#666666'
  }
}

/**
 * Get rarity percentage for display
 */
export function getRarityPercentage(tierName: string): string {
  switch (tierName.toLowerCase()) {
    case 'common': return '60%'
    case 'uncommon': return '35%'
    case 'rare': return '4.9%'
    case 'ultra rare': return '0.0999%'
    case 'mythic': return '0.00001%'
    default: return '0%'
  }
}

/**
 * Generate a deterministic color from a seed (for punch visualization)
 */
export function seedToColor(seed: string): string {
  const hash = seed.slice(2) // Remove 0x prefix
  const r = parseInt(hash.slice(0, 2), 16)
  const g = parseInt(hash.slice(2, 4), 16)
  const b = parseInt(hash.slice(4, 6), 16)
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Check if an address is valid
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!isValidAddress(address)) return address
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`
}

/**
 * Get explorer URL for transaction or address
 */
export function getExplorerUrl(hashOrAddress: string): string {
  const baseUrl = 'https://explorer.hyperliquid.xyz'
  
  if (hashOrAddress.length === 42) {
    // Address
    return `${baseUrl}/address/${hashOrAddress}`
  } else {
    // Transaction hash
    return `${baseUrl}/tx/${hashOrAddress}`
  }
}

/**
 * Calculate gas cost in HYPE
 */
export function calculateGasCost(gasUsed: bigint, gasPrice: bigint): string {
  const cost = gasUsed * gasPrice
  return formatEther(cost)
}

/**
 * Estimate minting cost (gas + burn amount)
 */
export function estimateMintingCost(burnAmount: string, gasPrice?: bigint): {
  burnCost: string
  gasCost: string
  totalCost: string
} {
  const burnCost = formatHype(burnAmount)
  
  // Estimate gas cost (170k gas for minting)
  const estimatedGas = 170000n
  const gasCost = gasPrice ? formatHype((estimatedGas * gasPrice).toString()) : '~0.00017 HYPE'
  
  // Total cost calculation would need actual gas price
  const totalCost = gasPrice 
    ? formatHype((BigInt(burnAmount) + (estimatedGas * gasPrice)).toString())
    : `${burnCost} + gas`
  
  return {
    burnCost,
    gasCost,
    totalCost
  }
}
