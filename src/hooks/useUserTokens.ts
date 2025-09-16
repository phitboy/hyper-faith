import { useAccount } from 'wagmi'
import { useTokenBalance, useTokenOfOwnerByIndex, useTokenURI } from './useOmamoriContract'
import { parseTokenURI } from '@/lib/contracts/realOmamori'
import type { OmamoriToken } from '@/lib/contracts/omamori'
import { useQuery } from '@tanstack/react-query'

/**
 * Hook to fetch all tokens owned by the connected user
 */
export function useUserTokens() {
  const { address } = useAccount()
  
  // Get user's token balance
  const { data: balance, isLoading: isLoadingBalance } = useTokenBalance(address)
  
  // Query to fetch all user tokens
  const {
    data: tokens,
    isLoading: isLoadingTokens,
    error,
    refetch
  } = useQuery({
    queryKey: ['userTokens', address, balance],
    queryFn: async (): Promise<OmamoriToken[]> => {
      if (!address || !balance || balance === 0n) {
        return []
      }
      
      const tokenPromises: Promise<OmamoriToken | null>[] = []
      
      // Fetch each token owned by the user
      for (let i = 0; i < Number(balance); i++) {
        tokenPromises.push(fetchUserTokenByIndex(address, i))
      }
      
      const results = await Promise.all(tokenPromises)
      return results.filter((token): token is OmamoriToken => token !== null)
    },
    enabled: !!address && !!balance && balance > 0n,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  })
  
  return {
    tokens: tokens || [],
    isLoading: isLoadingBalance || isLoadingTokens,
    error,
    refetch,
    tokenCount: balance ? Number(balance) : 0,
  }
}

/**
 * Helper function to fetch a single token by owner index
 */
async function fetchUserTokenByIndex(address: `0x${string}`, index: number): Promise<OmamoriToken | null> {
  try {
    // This would need to be implemented with individual contract calls
    // For now, we'll use a simplified approach
    // In a real implementation, you'd use the wagmi hooks here
    
    // Note: This is a placeholder - the actual implementation would need
    // to use the contract hooks within the component that calls this
    return null
  } catch (error) {
    console.error(`Failed to fetch token at index ${index}:`, error)
    return null
  }
}

/**
 * Hook to fetch a specific token by ID
 */
export function useTokenById(tokenId?: number) {
  const { data: tokenURI, isLoading, error } = useTokenURI(tokenId)
  
  const { data: token } = useQuery({
    queryKey: ['token', tokenId, tokenURI],
    queryFn: async (): Promise<OmamoriToken | null> => {
      if (!tokenId || !tokenURI) return null
      
      try {
        return parseTokenURI(tokenId, tokenURI)
      } catch (error) {
        console.error(`Failed to parse token ${tokenId}:`, error)
        return null
      }
    },
    enabled: !!tokenId && !!tokenURI,
    staleTime: 60000, // 1 minute
  })
  
  return {
    token,
    isLoading,
    error,
  }
}

/**
 * Simplified hook for user tokens using a different approach
 * This fetches tokens by querying recent mints and filtering by owner
 */
export function useUserTokensSimplified() {
  const { address } = useAccount()
  
  return useQuery({
    queryKey: ['userTokensSimplified', address],
    queryFn: async (): Promise<OmamoriToken[]> => {
      if (!address) return []
      
      // For now, return empty array - this would be implemented
      // with proper contract calls or event filtering
      return []
    },
    enabled: !!address,
    staleTime: 30000,
  })
}
