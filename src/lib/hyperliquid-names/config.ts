/**
 * Hyperliquid Names Configuration
 * 
 * This file contains the configuration for Hyperliquid Names integration.
 * Contract addresses will need to be updated once Hyperliquid Names is deployed on HyperEVM.
 */

// Environment-based configuration
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

/**
 * Contract addresses for different environments
 * 
 * NOTE: These are placeholder addresses and need to be updated with actual
 * Hyperliquid Names contract addresses once they are deployed on HyperEVM.
 */
export const CONTRACT_ADDRESSES = {
  development: {
    registry: '0x0000000000000000000000000000000000000000' as const,
    resolver: '0x0000000000000000000000000000000000000000' as const,
    reverseResolver: '0x0000000000000000000000000000000000000000' as const,
    registrator: '0x0000000000000000000000000000000000000000' as const,
    router: '0x0000000000000000000000000000000000000000' as const,
  },
  production: {
    // TODO: Update these with actual deployed contract addresses
    registry: '0x0000000000000000000000000000000000000000' as const,
    resolver: '0x0000000000000000000000000000000000000000' as const,
    reverseResolver: '0x0000000000000000000000000000000000000000' as const,
    registrator: '0x0000000000000000000000000000000000000000' as const,
    router: '0x0000000000000000000000000000000000000000' as const,
  },
} as const

/**
 * Get the current contract addresses based on environment
 */
export function getContractAddresses() {
  if (isProduction) {
    return CONTRACT_ADDRESSES.production
  }
  return CONTRACT_ADDRESSES.development
}

/**
 * Feature flags for Hyperliquid Names integration
 */
export const FEATURE_FLAGS = {
  // Enable/disable name resolution (useful for gradual rollout)
  ENABLE_NAME_RESOLUTION: true,
  
  // Enable/disable reverse resolution (more expensive, might want to disable initially)
  ENABLE_REVERSE_RESOLUTION: true,
  
  // Enable/disable text records (additional metadata)
  ENABLE_TEXT_RECORDS: false,
  
  // Enable/disable community notifications with names
  ENABLE_COMMUNITY_NAME_NOTIFICATIONS: false,
  
  // Enable/disable caching (should be true in production)
  ENABLE_CACHING: true,
  
  // Enable/disable fallback to mock data when contracts aren't available
  ENABLE_MOCK_FALLBACK: isDevelopment,
} as const

/**
 * Performance and caching configuration
 */
export const PERFORMANCE_CONFIG = {
  // Debounce delay for name resolution (milliseconds)
  RESOLUTION_DEBOUNCE_DELAY: 300,
  
  // Cache TTL for different types of data
  CACHE_TTL: {
    NAME_RESOLUTION: 5 * 60 * 1000, // 5 minutes
    REVERSE_RESOLUTION: 10 * 60 * 1000, // 10 minutes
    TEXT_RECORDS: 15 * 60 * 1000, // 15 minutes
  },
  
  // Maximum number of concurrent resolution requests
  MAX_CONCURRENT_REQUESTS: 5,
  
  // Retry configuration for failed requests
  RETRY_CONFIG: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    backoffMultiplier: 2,
  },
} as const

/**
 * UI configuration for name display
 */
export const UI_CONFIG = {
  // Show .hl names in notifications
  SHOW_NAMES_IN_NOTIFICATIONS: true,
  
  // Show loading indicators during resolution
  SHOW_RESOLUTION_LOADING: true,
  
  // Show resolved address preview for .hl names
  SHOW_ADDRESS_PREVIEW: true,
  
  // Show reverse resolution badges for addresses
  SHOW_REVERSE_RESOLUTION_BADGES: true,
  
  // Animation duration for UI transitions (milliseconds)
  ANIMATION_DURATION: 200,
} as const

/**
 * Validation configuration
 */
export const VALIDATION_CONFIG = {
  // Minimum length for .hl names (excluding .hl suffix)
  MIN_NAME_LENGTH: 1,
  
  // Maximum length for .hl names (excluding .hl suffix)
  MAX_NAME_LENGTH: 63,
  
  // Allowed characters in names (regex pattern)
  ALLOWED_CHARACTERS: /^[a-zA-Z0-9-]+$/,
  
  // Names cannot start or end with hyphen
  NO_LEADING_TRAILING_HYPHEN: true,
} as const

/**
 * Error messages for different scenarios
 */
export const ERROR_MESSAGES = {
  INVALID_NAME_FORMAT: 'Invalid .hl name format. Names must end with .hl and contain only letters, numbers, and hyphens.',
  NAME_TOO_SHORT: `Name must be at least ${VALIDATION_CONFIG.MIN_NAME_LENGTH} character(s) long.`,
  NAME_TOO_LONG: `Name must be no more than ${VALIDATION_CONFIG.MAX_NAME_LENGTH} characters long.`,
  INVALID_CHARACTERS: 'Names can only contain letters, numbers, and hyphens.',
  LEADING_TRAILING_HYPHEN: 'Names cannot start or end with a hyphen.',
  RESOLUTION_FAILED: 'Failed to resolve name. Please check the name and try again.',
  NETWORK_ERROR: 'Network error occurred. Please check your connection and try again.',
  CONTRACT_NOT_DEPLOYED: 'Hyperliquid Names contracts are not yet deployed. This feature will be available soon.',
} as const

/**
 * Check if Hyperliquid Names integration is available
 */
export function isHyperliquidNamesAvailable(): boolean {
  const addresses = getContractAddresses()
  
  // Check if any contract address is set (not zero address)
  return Object.values(addresses).some(addr => 
    addr !== '0x0000000000000000000000000000000000000000'
  )
}

/**
 * Get feature-specific configuration
 */
export function getFeatureConfig() {
  return {
    addresses: getContractAddresses(),
    features: FEATURE_FLAGS,
    performance: PERFORMANCE_CONFIG,
    ui: UI_CONFIG,
    validation: VALIDATION_CONFIG,
    errors: ERROR_MESSAGES,
    isAvailable: isHyperliquidNamesAvailable(),
  }
}
