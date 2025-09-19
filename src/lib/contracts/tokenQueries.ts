import { readContract } from 'wagmi/actions'
import { createPublicClient, http } from 'viem'
import { config } from '@/lib/wagmi'
import { contractAddresses } from '@/lib/wagmi'
import { OmamoriNFTABI } from './abis'
import { parseTokenURI } from './realOmamori'
import type { OmamoriToken } from './omamori'
import { hyperEVM } from '@/lib/chains'

/**
 * Fetch token metadata from URL (for new contract with off-chain metadata)
 */
async function fetchTokenMetadata(tokenId: number, tokenURI: string): Promise<OmamoriToken> {
  try {
    // If tokenURI is a URL, fetch the metadata
    if (tokenURI.startsWith('http')) {
      const response = await fetch(tokenURI)
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.status}`)
      }
      const metadata = await response.json()
      
      // Parse metadata into OmamoriToken format
      const attributes = metadata.attributes || []
      const getAttributeValue = (traitType: string) => {
        const attr = attributes.find((a: any) => a.trait_type === traitType)
        return attr ? attr.value : undefined
      }
      
      // Handle different image formats
      let imageSvg = metadata.image || ''
      
      // If it's a base64 data URI, decode it to get the actual SVG content
      if (imageSvg.startsWith('data:image/svg+xml;base64,')) {
        try {
          const base64Data = imageSvg.split(',')[1]
          imageSvg = atob(base64Data)
        } catch (error) {
          console.warn(`Failed to decode base64 SVG for token ${tokenId}:`, error)
          // Keep the data URI as fallback
        }
      }
      
      return {
        tokenId,
        majorId: parseInt(getAttributeValue('Major ID')) || 0,
        minorId: parseInt(getAttributeValue('Minor ID')) || 0,
        materialId: 0, // Will be filled from getTokenData
        materialName: getAttributeValue('Material') || 'Unknown',
        materialTier: getAttributeValue('Rarity Tier') || 'Common',
        punchCount: parseInt(getAttributeValue('Punch Count')) || 0,
        hypeBurned: getAttributeValue('HYPE Burned') || '0.0000',
        seed: getAttributeValue('Seed') || '0x0',
        imageSvg,
        mintedAt: Date.now(),
      } as OmamoriToken
    } else {
      // Fallback to old parsing method for embedded JSON
      return parseTokenURI(tokenId, tokenURI)
    }
  } catch (error) {
    console.error(`Failed to fetch metadata for token ${tokenId}:`, error)
    throw error
  }
}

/**
 * Fetch all tokens owned by a user (Off-Chain Rendering - simplified approach)
 * Note: Since off-chain contract doesn't have enumerable functions, we'll check known token IDs
 */
export async function fetchUserTokens(userAddress: `0x${string}`): Promise<OmamoriToken[]> {
  try {
    const tokens: OmamoriToken[] = []
    
    // OPTIMIZED: Use Transfer events to find user's tokens instead of brute force
    // This reduces from 400+ RPC calls to just a few calls
    
    // Get Transfer events where 'to' is the user address
    const client = createPublicClient({
      chain: hyperEVM,
      transport: http()
    })
    
    // Get Transfer events from contract deployment to now
    const logs = await client.getLogs({
      address: contractAddresses.OmamoriNFT,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { name: 'from', type: 'address', indexed: true },
          { name: 'to', type: 'address', indexed: true },
          { name: 'tokenId', type: 'uint256', indexed: true }
        ]
      },
      args: {
        to: userAddress
      },
      fromBlock: 'earliest'
    })
    
    // Extract token IDs from Transfer events
    const tokenIds = logs.map(log => Number(log.args.tokenId)).filter(id => id > 0)
    
    // Remove duplicates and sort
    const uniqueTokenIds = [...new Set(tokenIds)].sort((a, b) => b - a)
    
    // Now fetch metadata for each token the user owns
    for (const tokenId of uniqueTokenIds) {
      try {
        // Verify user still owns the token (in case of transfers)
        const owner = await readContract(config, {
          address: contractAddresses.OmamoriNFT,
          abi: OmamoriNFTABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        } as any)
        
        if ((owner as string).toLowerCase() !== userAddress.toLowerCase()) {
          continue // User no longer owns this token
        }
        
        const tokenURI = await readContract(config, {
          address: contractAddresses.OmamoriNFT,
          abi: OmamoriNFTABI,
          functionName: 'tokenURI',
          args: [BigInt(tokenId)],
        } as any)
      
        if (tokenURI) {
          const token = await fetchTokenMetadata(tokenId, tokenURI as string)
          
          // Get additional token data from getTokenData()
          try {
            const tokenData = await readContract(config, {
              address: contractAddresses.OmamoriNFT,
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
              // Convert hypeBurned from wei to HYPE (divide by 1e18)
              const hypeBurnedWei = BigInt(tokenData[5])
              const hypeBurnedHype = Number(hypeBurnedWei) / 1e18
              token.hypeBurned = hypeBurnedHype.toFixed(4) // hypeBurned (uint120)
            }
          } catch (error) {
            console.warn(`Failed to get token data for token ${tokenId}:`, error)
          }
          
          tokens.push(token)
        }
      } catch (error) {
        console.warn(`Failed to fetch token ${tokenId}:`, error)
        continue
      }
    }
    
    return tokens // Already sorted by tokenId (most recent first)
    
  } catch (error) {
    console.error('Failed to fetch user tokens:', error)
    // Fallback to old method if events fail
    return fetchUserTokensFallback(userAddress)
  }
}

// Fallback method (original brute force approach, but limited to 20 tokens)
async function fetchUserTokensFallback(userAddress: `0x${string}`): Promise<OmamoriToken[]> {
  try {
    const tokens: OmamoriToken[] = []
    const maxTokenId = 20 // Reduced from 100 for faster fallback
    
    for (let tokenId = 1; tokenId <= maxTokenId; tokenId++) {
      try {
        const owner = await readContract(config, {
          address: contractAddresses.OmamoriNFT,
          abi: OmamoriNFTABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        } as any)
        
        if ((owner as string).toLowerCase() === userAddress.toLowerCase()) {
          const tokenURI = await readContract(config, {
            address: contractAddresses.OmamoriNFT,
            abi: OmamoriNFTABI,
            functionName: 'tokenURI',
            args: [BigInt(tokenId)],
          } as any)
        
          if (tokenURI) {
            const token = await fetchTokenMetadata(tokenId, tokenURI as string)
            
            try {
              const tokenData = await readContract(config, {
                address: contractAddresses.OmamoriNFT,
                abi: OmamoriNFTABI,
                functionName: 'getTokenData',
                args: [BigInt(tokenId)],
              } as any)
              
              if (tokenData && Array.isArray(tokenData) && tokenData.length >= 6) {
                token.majorId = Number(tokenData[0])
                token.minorId = Number(tokenData[1])
                token.materialId = Number(tokenData[2])
                token.punchCount = Number(tokenData[3])
                token.seed = `0x${tokenData[4].toString(16)}`
                const hypeBurnedWei = BigInt(tokenData[5])
                const hypeBurnedHype = Number(hypeBurnedWei) / 1e18
                token.hypeBurned = hypeBurnedHype.toFixed(4)
              }
            } catch (error) {
              console.warn(`Failed to get token data for token ${tokenId}:`, error)
            }
            
            tokens.push(token)
          }
        }
      } catch (error) {
        continue
      }
    }
    
    return tokens.sort((a, b) => b.tokenId - a.tokenId)
  } catch (error) {
    console.error('Failed to fetch user tokens (fallback):', error)
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
          address: contractAddresses.OmamoriNFT,
          abi: OmamoriNFTABI,
          functionName: 'tokenURI',
          args: [BigInt(tokenId)],
        } as any) // Cast to any to avoid strict typing issues
        
               if (tokenURI) {
                 const token = await fetchTokenMetadata(tokenId, tokenURI as string)
                 
                 // Get additional token data from getTokenData() for OmamoriNFTOffChain
                 try {
                   const tokenData = await readContract(config, {
                     address: contractAddresses.OmamoriNFT,
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
                     // Convert hypeBurned from wei to HYPE (divide by 1e18)
                const hypeBurnedWei = BigInt(tokenData[5])
                const hypeBurnedHype = Number(hypeBurnedWei) / 1e18
                token.hypeBurned = hypeBurnedHype.toFixed(4) // hypeBurned (uint120)
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
    
    const token = await fetchTokenMetadata(tokenId, tokenURI as string)
    
    // Get additional token data from getTokenData() for OmamoriNFTOffChain
    try {
      const tokenData = await readContract(config, {
        address: contractAddresses.OmamoriNFT,
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
