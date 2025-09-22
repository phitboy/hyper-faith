/**
 * Hyperliquid Names Integration
 * 
 * This module provides complete integration with Hyperliquid Names protocol
 * for resolving .hl domains to Ethereum addresses and vice versa.
 */

// Export all hooks
export {
  useHyperliquidNames,
  useReverseResolution,
  useNameValidation,
  useSmartAddressResolution,
  useDebouncedAddressResolution,
  useTextRecords,
} from './hooks'

// Export utilities
export {
  namehash,
  isValidHLName,
  validateAndNormalizeName,
  detectInputType,
  looksLikeAddress,
  normalize,
  getBaseName,
  ensureHLSuffix,
  formatNameForDisplay,
  createCacheKey,
} from './utils'

// Export contract configuration
export {
  HYPERLIQUID_NAMES_ADDRESSES,
  HyperliquidNamesABI,
  HyperliquidResolverABI,
  HyperliquidReverseResolverABI,
  COIN_TYPES,
  TEXT_RECORD_KEYS,
  CACHE_CONFIG,
  getHyperliquidNamesConfig,
} from './contracts'

// Export types
export type HLNameValidation = {
  isValid: boolean
  normalizedName?: string
  error?: string
}

export type InputType = 'address' | 'hl-name' | 'invalid' | 'empty'

export type SmartResolutionResult = {
  resolvedAddress?: `0x${string}`
  displayName?: string
  inputType: InputType
  isLoading: boolean
  isValid: boolean
  error?: Error | null
}
