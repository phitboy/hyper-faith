/**
 * Hyperliquid Names Integration
 * 
 * This module provides complete integration with Hyperliquid Names protocol
 * for resolving .hl domains to Ethereum addresses and vice versa.
 * 
 * Now uses API-based resolution for reliable, fast name resolution.
 */

// Export API-based hooks (NEW - WORKING)
export {
  useHLNameResolution,
  useHLReverseResolution,
  useInputValidation,
  useSmartAddressResolution,
  useDebouncedAddressResolution,
  useHLNamesAPITest,
  useAddressDisplay,
} from './api-hooks'

// Export API client
export {
  hlNamesAPI,
  resolveHLName,
  reverseResolveAddress,
  isValidHLName,
  testHLNamesAPI,
  testHLNamesConnectivity,
  HyperliquidNamesAPI,
} from './api-client'

// Export legacy contract-based hooks (DEPRECATED - for future use)
export {
  useHyperliquidNames,
  useReverseResolution,
  useNameValidation,
  useTextRecords,
} from './hooks'

// Export utilities (still useful)
export {
  namehash,
  validateAndNormalizeName,
  detectInputType,
  looksLikeAddress,
  normalize,
  getBaseName,
  ensureHLSuffix,
  formatNameForDisplay,
  createCacheKey,
} from './utils'

// Export contract configuration (for future contract integration)
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
export type { HLNameResolution, ReverseResolution, APIError } from './api-client'

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
