/**
 * Hyperliquid Names Contract ABIs and Configuration
 * Based on ERC721 standard with additional name resolution functions
 */

import { getContractAddresses } from './config'

// Hyperliquid Names main contract ABI (ERC721 + name resolution)
export const HyperliquidNamesABI = [
  // ERC721 Standard Functions
  {
    "type": "function",
    "name": "ownerOf",
    "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  
  // Name Resolution Functions
  {
    "type": "function",
    "name": "resolver",
    "inputs": [{ "name": "node", "type": "bytes32", "internalType": "bytes32" }],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "addr",
    "inputs": [{ "name": "node", "type": "bytes32", "internalType": "bytes32" }],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [{ "name": "node", "type": "bytes32", "internalType": "bytes32" }],
    "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
    "stateMutability": "view"
  },
  
  // Reverse Resolution
  {
    "type": "function",
    "name": "defaultResolver",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  
  // Events
  {
    "type": "event",
    "name": "NewResolver",
    "inputs": [
      { "name": "node", "type": "bytes32", "indexed": true, "internalType": "bytes32" },
      { "name": "resolver", "type": "address", "indexed": false, "internalType": "address" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      { "name": "from", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "to", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }
    ],
    "anonymous": false
  }
] as const

// Resolver contract ABI for address resolution
export const HyperliquidResolverABI = [
  {
    "type": "function",
    "name": "addr",
    "inputs": [{ "name": "node", "type": "bytes32", "internalType": "bytes32" }],
    "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "addr",
    "inputs": [
      { "name": "node", "type": "bytes32", "internalType": "bytes32" },
      { "name": "coinType", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bytes", "internalType": "bytes" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [{ "name": "node", "type": "bytes32", "internalType": "bytes32" }],
    "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "text",
    "inputs": [
      { "name": "node", "type": "bytes32", "internalType": "bytes32" },
      { "name": "key", "type": "string", "internalType": "string" }
    ],
    "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
    "stateMutability": "view"
  }
] as const

// Reverse Resolver ABI for reverse lookups
export const HyperliquidReverseResolverABI = [
  {
    "type": "function",
    "name": "name",
    "inputs": [{ "name": "node", "type": "bytes32", "internalType": "bytes32" }],
    "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
    "stateMutability": "view"
  }
] as const

// Contract addresses on HyperEVM (dynamically loaded from config)
export const HYPERLIQUID_NAMES_ADDRESSES = getContractAddresses()

// Coin type constants for multi-coin support (SLIP-0044)
export const COIN_TYPES = {
  ETH: 60,
  BTC: 0,
  SOL: 501,
} as const

// Common text record keys
export const TEXT_RECORD_KEYS = {
  AVATAR: 'avatar',
  DESCRIPTION: 'description',
  DISPLAY: 'display',
  EMAIL: 'email',
  KEYWORDS: 'keywords',
  MAIL: 'mail',
  NOTICE: 'notice',
  LOCATION: 'location',
  PHONE: 'phone',
  URL: 'url',
  
  // Social media
  'com.github': 'com.github',
  'com.twitter': 'com.twitter',
  'com.discord': 'com.discord',
  'com.reddit': 'com.reddit',
  'com.telegram': 'com.telegram',
} as const

// Cache configuration
export const CACHE_CONFIG = {
  // Cache duration for resolved names (5 minutes)
  RESOLUTION_TTL: 5 * 60 * 1000,
  
  // Cache duration for reverse resolution (10 minutes)
  REVERSE_RESOLUTION_TTL: 10 * 60 * 1000,
  
  // Cache duration for text records (15 minutes)
  TEXT_RECORDS_TTL: 15 * 60 * 1000,
  
  // Maximum cache size
  MAX_CACHE_SIZE: 1000,
} as const

/**
 * Get contract configuration for Hyperliquid Names
 */
export function getHyperliquidNamesConfig() {
  return {
    addresses: HYPERLIQUID_NAMES_ADDRESSES,
    abis: {
      registry: HyperliquidNamesABI,
      resolver: HyperliquidResolverABI,
      reverseResolver: HyperliquidReverseResolverABI,
    },
    coinTypes: COIN_TYPES,
    textRecordKeys: TEXT_RECORD_KEYS,
    cache: CACHE_CONFIG,
  }
}
