import { readContract } from 'wagmi/actions'
import { config } from '@/lib/wagmi'
import { contractAddresses } from '@/lib/wagmi'
import { OmamoriNFTABI } from './abis'
import { parseTokenURI } from './realOmamori'
import type { OmamoriToken } from './omamori'

/**
 * Fetch all tokens owned by a user (Off-Chain Rendering - simplified approach)
 * Note: Since off-chain contract doesn't have enumerable functions, we'll check known token IDs
 */
export async function fetchUserTokens(userAddress: `0x${string}`): Promise<OmamoriToken[]> {
  try {
    // Get user's token balance
    const balance = await readContract(config, {
      address: contractAddresses.OmamoriNFT,
      abi: OmamoriNFTABI,
      functionName: 'balanceOf',
      args: [userAddress],
    } as any) // Cast to any to avoid strict typing issues
    
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
          address: contractAddresses.OmamoriNFTOffChain,
          abi: OmamoriNFTABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        } as any) // Cast to any to avoid strict typing issues
        
        if ((owner as string).toLowerCase() === userAddress.toLowerCase()) {
          const tokenURI = await readContract(config, {
            address: contractAddresses.OmamoriNFTOffChain,
            abi: OmamoriNFTABI,
            functionName: 'tokenURI',
            args: [BigInt(tokenId)],
          } as any) // Cast to any to avoid strict typing issues
        
          if (tokenURI) {
            const token = parseTokenURI(Number(tokenId), tokenURI as string)
            
            // Get additional token data from getTokenData() for OmamoriNFTOffChain
            try {
              const tokenData = await readContract(config, {
                address: contractAddresses.OmamoriNFTOffChain,
                abi: OmamoriNFTABI,
                functionName: 'getTokenData',
                args: [BigInt(tokenId)],
              } as any)
              
              if (tokenData && Array.isArray(tokenData) && tokenData.length >= 6) {
                // Update token with data from getTokenData (new contract structure)
                token.majorId = Number(tokenData[0]) // majorId (uint8)
                token.minorId = Number(tokenData[1]) // minorId (uint8)
                token.materialId = Number(tokenData[2]) // materialId (uint16)
                token.punchCount = Number(tokenData[3]) // punchCount (uint8)
                token.seed = `0x${tokenData[4].toString(16)}` // seed (uint64)
                token.hypeBurned = tokenData[5].toString() // hypeBurned (uint120)
              }
            } catch (error) {
              console.warn(`Failed to get token data for token ${tokenId}:`, error)
            }
            
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
 * Fetch recent tokens for exploration (Off-Chain Rendering - simplified approach)
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
          address: contractAddresses.OmamoriNFTOffChain,
          abi: OmamoriNFTABI,
          functionName: 'tokenURI',
          args: [BigInt(tokenId)],
        } as any) // Cast to any to avoid strict typing issues
        
               if (tokenURI) {
                 const token = parseTokenURI(tokenId, tokenURI as string)
                 
                 // Get additional token data from getTokenData() for OmamoriNFTOffChain
                 try {
                   const tokenData = await readContract(config, {
                     address: contractAddresses.OmamoriNFTOffChain,
                     abi: OmamoriNFTABI,
                     functionName: 'getTokenData',
                     args: [BigInt(tokenId)],
                   } as any)
                   
                   if (tokenData && Array.isArray(tokenData) && tokenData.length >= 6) {
                     // Update token with data from getTokenData (new contract structure)
                     token.majorId = Number(tokenData[0]) // majorId (uint8)
                     token.minorId = Number(tokenData[1]) // minorId (uint8)
                     token.materialId = Number(tokenData[2]) // materialId (uint16)
                     token.punchCount = Number(tokenData[3]) // punchCount (uint8)
                     token.seed = `0x${tokenData[4].toString(16)}` // seed (uint64)
                     token.hypeBurned = tokenData[5].toString() // hypeBurned (uint120)
                   }
                 } catch (error) {
                   console.warn(`Failed to get token data for token ${tokenId}:`, error)
                 }
                 
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
 * Fetch a specific token by ID (Off-Chain Rendering)
 */
export async function fetchTokenById(tokenId: number): Promise<OmamoriToken | null> {
  try {
    const tokenURI = await readContract(config, {
      address: contractAddresses.OmamoriNFT,
      abi: OmamoriNFTABI,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
    } as any) // Cast to any to avoid strict typing issues
    
    if (!tokenURI) {
      return null
    }
    
    const token = parseTokenURI(tokenId, tokenURI as string)
    
    // Get additional token data from getTokenData() for OmamoriNFTOffChain
    try {
      const tokenData = await readContract(config, {
        address: contractAddresses.OmamoriNFTOffChain,
            abi: OmamoriNFTABI,
        functionName: 'getTokenData',
        args: [BigInt(tokenId)],
      } as any)
      
      if (tokenData && Array.isArray(tokenData) && tokenData.length >= 6) {
        // Update token with data from getTokenData (new contract structure)
        token.majorId = Number(tokenData[0]) // majorId (uint8)
        token.minorId = Number(tokenData[1]) // minorId (uint8)
        token.materialId = Number(tokenData[2]) // materialId (uint16)
        token.punchCount = Number(tokenData[3]) // punchCount (uint8)
        token.seed = `0x${tokenData[4].toString(16)}` // seed (uint64)
        token.hypeBurned = tokenData[5].toString() // hypeBurned (uint120)
      }
    } catch (error) {
      console.warn(`Failed to get token data for token ${tokenId}:`, error)
    }
    
    return token
    
  } catch (error) {
    console.error(`Failed to fetch token ${tokenId}:`, error)
    return null
  }
}
