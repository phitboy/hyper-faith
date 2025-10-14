import { keccak256, toBytes, concat, toHex } from 'viem'

/**
 * Hyperliquid Names utility functions
 * Implements ERC137 namehash algorithm and name validation
 */

/**
 * Normalize a name according to UTS-46 normalization
 * For now, we'll use a simplified version that handles basic cases
 */
export function normalize(name: string): string {
  // Basic normalization - convert to lowercase and trim
  // In a full implementation, this would use UTS-46 normalization
  return name.toLowerCase().trim()
}

/**
 * Check if a string is a valid .hl name format
 */
export function isValidHLName(name: string): boolean {
  if (!name || typeof name !== 'string') return false
  
  // Must end with .hl
  if (!name.endsWith('.hl')) return false
  
  // Remove .hl suffix for validation
  const baseName = name.slice(0, -3)
  
  // Must have at least 1 character before .hl
  if (baseName.length === 0) return false
  
  // Basic validation - alphanumeric and hyphens only
  // Can't start or end with hyphen
  const nameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/
  
  return nameRegex.test(baseName)
}

/**
 * Compute the namehash of a name according to ERC137
 * This is used as the tokenId in the ERC721 contract
 */
export function namehash(name: string): `0x${string}` {
  // Normalize the name first
  const normalizedName = normalize(name)
  
  // Split into labels (e.g., "alice.hl" -> ["alice", "hl"])
  const labels = normalizedName.split('.')
  
  // Start with the hash of the empty string (32 zero bytes)
  let hash: Uint8Array = new Uint8Array(32)
  
  // Process labels from right to left (TLD first)
  for (let i = labels.length - 1; i >= 0; i--) {
    const label = labels[i]
    const labelHash = keccak256(toBytes(label))
    
    // Concatenate current hash with label hash and hash the result
    const combined = concat([hash, labelHash])
    hash = new Uint8Array(toBytes(keccak256(combined)))
  }
  
  return toHex(hash)
}

/**
 * Extract the base name from a .hl domain (removes .hl suffix)
 */
export function getBaseName(name: string): string {
  if (!name.endsWith('.hl')) return name
  return name.slice(0, -3)
}

/**
 * Add .hl suffix if not present
 */
export function ensureHLSuffix(name: string): string {
  if (name.endsWith('.hl')) return name
  return `${name}.hl`
}

/**
 * Check if input looks like an Ethereum address
 */
export function looksLikeAddress(input: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(input)
}

/**
 * Detect input type - address or .hl name
 */
export function detectInputType(input: string): 'address' | 'hl-name' | 'invalid' {
  if (!input || typeof input !== 'string') return 'invalid'
  
  const trimmed = input.trim()
  
  if (looksLikeAddress(trimmed)) return 'address'
  if (isValidHLName(trimmed)) return 'hl-name'
  
  return 'invalid'
}

/**
 * Format a name for display (ensure proper casing)
 */
export function formatNameForDisplay(name: string): string {
  return normalize(name)
}

/**
 * Validate and normalize input for name resolution
 */
export function validateAndNormalizeName(input: string): {
  isValid: boolean
  normalizedName?: string
  error?: string
} {
  if (!input || typeof input !== 'string') {
    return { isValid: false, error: 'Name is required' }
  }
  
  const trimmed = input.trim()
  
  if (!isValidHLName(trimmed)) {
    return { 
      isValid: false, 
      error: 'Invalid .hl name format. Names must end with .hl and contain only letters, numbers, and hyphens.' 
    }
  }
  
  const normalizedName = normalize(trimmed)
  
  return {
    isValid: true,
    normalizedName
  }
}

/**
 * Create a cache key for name resolution
 */
export function createCacheKey(name: string, type: 'forward' | 'reverse' = 'forward'): string {
  return `hl-names:${type}:${normalize(name)}`
}
