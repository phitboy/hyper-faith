import { useEffect, useState } from 'react'
import { useReadContract } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { isAddress } from 'viem'
import { 
  namehash, 
  isValidHLName, 
  validateAndNormalizeName, 
  createCacheKey,
  detectInputType 
} from './utils'
import { 
  HYPERLIQUID_NAMES_ADDRESSES, 
  HyperliquidNamesABI, 
  HyperliquidResolverABI,
  HyperliquidReverseResolverABI,
  CACHE_CONFIG,
  COIN_TYPES 
} from './contracts'

/**
 * Hook for resolving .hl names to Ethereum addresses (forward resolution)
 */
export function useHyperliquidNames(name?: string) {
  const validation = name ? validateAndNormalizeName(name) : { isValid: false }
  
  // Get resolver address for the name
  const { data: resolverAddress } = useReadContract({
    address: HYPERLIQUID_NAMES_ADDRESSES.registry,
    abi: HyperliquidNamesABI,
    functionName: 'resolver',
    args: validation.normalizedName ? [namehash(validation.normalizedName)] : undefined,
    query: {
      enabled: validation.isValid && !!validation.normalizedName,
      staleTime: CACHE_CONFIG.RESOLUTION_TTL,
    },
  })
  
  // Resolve name to address using the resolver
  const { data: resolvedAddress, isLoading, error } = useReadContract({
    address: resolverAddress || HYPERLIQUID_NAMES_ADDRESSES.resolver,
    abi: HyperliquidResolverABI,
    functionName: 'addr',
    args: validation.normalizedName ? [namehash(validation.normalizedName)] : undefined,
    query: {
      enabled: validation.isValid && !!validation.normalizedName && !!resolverAddress,
      staleTime: CACHE_CONFIG.RESOLUTION_TTL,
    },
  })
  
  return {
    address: resolvedAddress as `0x${string}` | undefined,
    isLoading,
    error: error || (!validation.isValid ? new Error(validation.error) : null),
    isValid: validation.isValid,
    normalizedName: validation.normalizedName,
  }
}

/**
 * Hook for reverse resolution - converting addresses to .hl names
 */
export function useReverseResolution(address?: `0x${string}`) {
  const isValidAddress = address && isAddress(address)
  
  // Create reverse node (address.addr.reverse)
  const reverseNode = isValidAddress 
    ? namehash(`${address.slice(2).toLowerCase()}.addr.reverse`)
    : undefined
  
  const { data: reverseName, isLoading, error } = useReadContract({
    address: HYPERLIQUID_NAMES_ADDRESSES.reverseResolver,
    abi: HyperliquidReverseResolverABI,
    functionName: 'name',
    args: reverseNode ? [reverseNode] : undefined,
    query: {
      enabled: !!isValidAddress && !!reverseNode,
      staleTime: CACHE_CONFIG.REVERSE_RESOLUTION_TTL,
    },
  })
  
  return {
    name: reverseName as string | undefined,
    isLoading,
    error,
    isValid: !!isValidAddress,
  }
}

/**
 * Hook for validating .hl name format
 */
export function useNameValidation(input?: string) {
  return useQuery({
    queryKey: ['hl-name-validation', input],
    queryFn: () => {
      if (!input) return { isValid: false, type: 'empty' as const }
      
      const inputType = detectInputType(input)
      
      if (inputType === 'address') {
        return { 
          isValid: true, 
          type: 'address' as const,
          value: input as `0x${string}`
        }
      }
      
      if (inputType === 'hl-name') {
        const validation = validateAndNormalizeName(input)
        return {
          isValid: validation.isValid,
          type: 'hl-name' as const,
          value: validation.normalizedName,
          error: validation.error
        }
      }
      
      return { 
        isValid: false, 
        type: 'invalid' as const,
        error: 'Invalid input format'
      }
    },
    enabled: !!input,
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook for smart input resolution - handles both addresses and .hl names
 */
export function useSmartAddressResolution(input?: string) {
  const validation = useNameValidation(input)
  
  // Only resolve if input is a valid .hl name
  const nameResolution = useHyperliquidNames(
    validation.data?.type === 'hl-name' ? input : undefined
  )
  
  // Only do reverse resolution if input is a valid address
  const reverseResolution = useReverseResolution(
    validation.data?.type === 'address' ? input as `0x${string}` : undefined
  )
  
  const isLoading = validation.isLoading || nameResolution.isLoading || reverseResolution.isLoading
  
  // Determine the final resolved address
  let resolvedAddress: `0x${string}` | undefined
  let displayName: string | undefined
  let inputType: 'address' | 'hl-name' | 'invalid' | 'empty' = 'empty'
  
  if (validation.data) {
    inputType = validation.data.type
    
    if (validation.data.type === 'address') {
      resolvedAddress = validation.data.value
      displayName = reverseResolution.name || undefined
    } else if (validation.data.type === 'hl-name') {
      resolvedAddress = nameResolution.address
      displayName = validation.data.value
    }
  }
  
  const error = validation.error || nameResolution.error || reverseResolution.error
  
  return {
    // Final resolved address (regardless of input type)
    resolvedAddress,
    
    // Display name (.hl name if available)
    displayName,
    
    // Input type detection
    inputType,
    
    // Loading states
    isLoading,
    isValidating: validation.isLoading,
    isResolving: nameResolution.isLoading,
    isReverseResolving: reverseResolution.isLoading,
    
    // Validation results
    isValid: validation.data?.isValid || false,
    
    // Errors
    error,
    
    // Raw data from individual hooks
    validation: validation.data,
    nameResolution: {
      address: nameResolution.address,
      error: nameResolution.error,
    },
    reverseResolution: {
      name: reverseResolution.name,
      error: reverseResolution.error,
    },
  }
}

/**
 * Hook for getting text records for a .hl name
 */
export function useTextRecords(name?: string, keys: string[] = []) {
  const validation = name ? validateAndNormalizeName(name) : { isValid: false }
  const node = validation.normalizedName ? namehash(validation.normalizedName) : undefined
  
  // Get resolver address first
  const { data: resolverAddress } = useReadContract({
    address: HYPERLIQUID_NAMES_ADDRESSES.registry,
    abi: HyperliquidNamesABI,
    functionName: 'resolver',
    args: node ? [node] : undefined,
    query: {
      enabled: validation.isValid && !!node,
      staleTime: CACHE_CONFIG.RESOLUTION_TTL,
    },
  })
  
  // Fetch text records
  const textRecordQueries = keys.map(key => 
    useReadContract({
      address: resolverAddress || HYPERLIQUID_NAMES_ADDRESSES.resolver,
      abi: HyperliquidResolverABI,
      functionName: 'text',
      args: node ? [node, key] : undefined,
      query: {
        enabled: validation.isValid && !!node && !!resolverAddress,
        staleTime: CACHE_CONFIG.TEXT_RECORDS_TTL,
      },
    })
  )
  
  const isLoading = textRecordQueries.some(query => query.isLoading)
  const errors = textRecordQueries.map(query => query.error).filter(Boolean)
  
  const records = keys.reduce((acc, key, index) => {
    const data = textRecordQueries[index]?.data
    if (data) {
      acc[key] = data as string
    }
    return acc
  }, {} as Record<string, string>)
  
  return {
    records,
    isLoading,
    errors,
    isValid: validation.isValid,
  }
}

/**
 * Hook for debounced name resolution to prevent excessive API calls
 */
export function useDebouncedAddressResolution(input?: string, delay: number = 300) {
  const [debouncedInput, setDebouncedInput] = useState(input)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(input)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [input, delay])
  
  return useSmartAddressResolution(debouncedInput)
}

// Re-export utilities for convenience
export { 
  isValidHLName, 
  namehash, 
  detectInputType, 
  validateAndNormalizeName 
} from './utils'
