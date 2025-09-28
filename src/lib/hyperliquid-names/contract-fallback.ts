/**
 * Contract-based fallback for Hyperliquid Names when API fails
 * Uses the actual deployed contracts on HyperEVM
 */

import { createPublicClient, http, namehash } from 'viem'
import { type HLNameResolution, type ReverseResolution } from './api-client'

// HyperEVM configuration
const hyperEVM = {
  id: 999,
  name: 'HyperEVM',
  network: 'hyperevm',
  nativeCurrency: {
    decimals: 18,
    name: 'HYPE',
    symbol: 'HYPE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid.xyz/evm'],
    },
    public: {
      http: ['https://rpc.hyperliquid.xyz/evm'],
    },
  },
  blockExplorers: {
    default: { name: 'HyperEVM Explorer', url: 'https://explorer.hyperliquid.xyz' },
  },
}

// Contract addresses from documentation
const HYPERLIQUID_NAMES_CONTRACT = '0x1d9d87eBc14e71490bB87f1C39F65BDB979f3cb7'

// Minimal ABI for name resolution
const HYPERLIQUID_NAMES_ABI = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getAddress',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Create public client for HyperEVM
const publicClient = createPublicClient({
  chain: hyperEVM,
  transport: http(),
})

/**
 * Contract-based Hyperliquid Names resolver
 */
export class HLNamesContractResolver {
  /**
   * Convert .hl name to tokenId using namehash
   */
  private nameToTokenId(name: string): bigint {
    // Remove .hl suffix for namehash calculation
    const baseName = name.endsWith('.hl') ? name.slice(0, -3) : name
    // Create the full name with .hl TLD
    const fullName = `${baseName}.hl`
    // Calculate namehash
    const hash = namehash(fullName)
    return BigInt(hash)
  }

  /**
   * Resolve .hl name to address using contract
   */
  async resolveName(name: string): Promise<HLNameResolution> {
    try {
      console.log(`[HLNames Contract] Resolving: ${name}`)
      
      const normalizedName = name.endsWith('.hl') ? name : `${name}.hl`
      const tokenId = this.nameToTokenId(normalizedName)
      
      console.log(`[HLNames Contract] TokenId: ${tokenId.toString()}`)
      
      // Try to get the address for this name
      const address = await publicClient.readContract({
        address: HYPERLIQUID_NAMES_CONTRACT,
        abi: HYPERLIQUID_NAMES_ABI,
        functionName: 'getAddress',
        args: [tokenId],
        authorizationList: undefined, // Add required property
      } as any)

      console.log(`[HLNames Contract] Resolved address: ${address}`)

      if (address && address !== '0x0000000000000000000000000000000000000000') {
        return {
          name: normalizedName,
          address: address as string,
          isValid: true,
        }
      } else {
        return {
          name: normalizedName,
          address: '',
          isValid: false,
        }
      }
    } catch (error) {
      console.error(`[HLNames Contract] Resolution failed:`, error)
      return {
        name: name.endsWith('.hl') ? name : `${name}.hl`,
        address: '',
        isValid: false,
      }
    }
  }

  /**
   * Test contract connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to resolve the known example
      const result = await this.resolveName('testooor.hl')
      return result.isValid && result.address.toLowerCase() === '0xF26F5551E96aE5162509B25925fFfa7F07B2D652'.toLowerCase()
    } catch (error) {
      console.error('[HLNames Contract] Test failed:', error)
      return false
    }
  }
}

// Create singleton instance
export const hlNamesContract = new HLNamesContractResolver()
