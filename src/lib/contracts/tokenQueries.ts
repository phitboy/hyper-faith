import { readContract } from 'wagmi/actions'
import { config } from '@/lib/wagmi'
import { contractAddresses } from '@/lib/wagmi'
import { OmamoriNFTSingleABI } from './abis'
import { parseTokenURI } from './realOmamori'
import type { OmamoriToken } from './omamori'

/**
 * Fetch all tokens owned by a user (Single Contract - simplified approach)
 * Note: Since single contract doesn't have enumerable functions, we'll check known token IDs
 */
export async function fetchUserTokens(userAddress: `0x${string}`): Promise<OmamoriToken[]> {
  try {
    // Get user's token balance
    const balance = await readContract(config, {
      address: contractAddresses.OmamoriNFTSingle,
      abi: OmamoriNFTSingleABI,
      functionName: 'balanceOf',
      args: [userAddress],
    })
    
    if (!balance || balance === 0n) {
      return []
    }
    
    // Since we don't have enumerable functions, we'll check token IDs 1-100 for now
    // In a production app, you'd want to track this via events or a subgraph
    const tokens: OmamoriToken[] = []
    const maxTokenId = 100 // Check first 100 tokens
    
    for (let tokenId = 1; tokenId <= maxTokenId; tokenId++) {
      try {
        const owner = await readContract(config, {
          address: contractAddresses.OmamoriNFTSingle,
          abi: OmamoriNFTSingleABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        })
        
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          const tokenURI = await readContract(config, {
            address: contractAddresses.OmamoriNFTSingle,
            abi: OmamoriNFTSingleABI,
            functionName: 'tokenURI',
            args: [BigInt(tokenId)],
          })
        
          if (tokenURI) {
            const token = parseTokenURI(Number(tokenId), tokenURI)
            tokens.push(token)
          }
        }
      } catch (error) {
        // Token doesn't exist or not owned by user, continue
        continue
      }
    }
    
    // Sort by token ID (most recent first)
    return tokens.sort((a, b) => b.tokenId - a.tokenId)
    
  } catch (error) {
    console.error('Failed to fetch user tokens:', error)
    return []
  }
}

/**
 * Fetch recent tokens for exploration (Single Contract - simplified approach)
 */
export async function fetchRecentTokens(limit: number = 50): Promise<OmamoriToken[]> {
  try {
    // Since we don't have totalSupply, we'll check the most recent token IDs
    // In production, you'd track this via events or maintain a counter
    const tokens: OmamoriToken[] = []
    const maxTokenId = 100 // Check up to token 100
    
    // Check tokens in reverse order to get most recent first
    for (let tokenId = maxTokenId; tokenId >= 1 && tokens.length < limit; tokenId--) {
      try {
        const tokenURI = await readContract(config, {
          address: contractAddresses.OmamoriNFTSingle,
          abi: OmamoriNFTSingleABI,
          functionName: 'tokenURI',
          args: [BigInt(tokenId)],
        })
        
        if (tokenURI) {
          const token = parseTokenURI(tokenId, tokenURI)
          tokens.push(token)
        }
      } catch (error) {
        // Token doesn't exist, continue
        continue
      }
    }
    
    // Return tokens (already in reverse order)
    return tokens
    
  } catch (error) {
    console.error('Failed to fetch recent tokens:', error)
    return []
  }
}

/**
 * Fetch a specific token by ID (Single Contract)
 */
export async function fetchTokenById(tokenId: number): Promise<OmamoriToken | null> {
  try {
    const tokenURI = await readContract(config, {
      address: contractAddresses.OmamoriNFTSingle,
      abi: OmamoriNFTSingleABI,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
    })
    
    if (!tokenURI) {
      return null
    }
    
    return parseTokenURI(tokenId, tokenURI)
    
  } catch (error) {
    console.error(`Failed to fetch token ${tokenId}:`, error)
    return null
  }
}
