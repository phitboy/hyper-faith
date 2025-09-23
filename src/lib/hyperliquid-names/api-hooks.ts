import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { isAddress } from 'viem'
import { hlNamesAPI, type HLNameResolution, type ReverseResolution } from './api-client'

/**
 * API-based hooks for Hyperliquid Names resolution
 * These replace the contract-based hooks with working API calls
 */

/**
 * Hook for resolving .hl names to Ethereum addresses (forward resolution)
 * Uses API with contract fallback
 */
export function useHLNameResolution(name?: string) {
  return useQuery({
    queryKey: ['hl-name-resolution', name],
    queryFn: () => hlNamesAPI.resolveNameWithFallback(name!),
    enabled: !!name && hlNamesAPI.isValidHLName(name),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Reduced retry since we have fallback
  })
}

/**
 * Hook for reverse resolution - converting addresses to .hl names
 */
export function useHLReverseResolution(address?: `0x${string}`) {
  return useQuery({
    queryKey: ['hl-reverse-resolution', address],
    queryFn: () => hlNamesAPI.reverseResolve(address!),
    enabled: !!address && isAddress(address),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

/**
 * Hook for validating input format (address vs .hl name)
 */
export function useInputValidation(input?: string) {
  return useQuery({
    queryKey: ['input-validation', input],
    queryFn: () => {
      if (!input || !input.trim()) {
        return { isValid: false, type: 'empty' as const }
      }

      const trimmed = input.trim()

      // Check if it's an Ethereum address
      if (isAddress(trimmed)) {
        return {
          isValid: true,
          type: 'address' as const,
          value: trimmed as `0x${string}`
        }
      }

      // Check if it's a valid .hl name
      if (hlNamesAPI.isValidHLName(trimmed)) {
        return {
          isValid: true,
          type: 'hl-name' as const,
          value: trimmed
        }
      }

      return {
        isValid: false,
        type: 'invalid' as const,
        error: 'Invalid format. Enter an Ethereum address (0x...) or .hl name (name.hl)'
      }
    },
    enabled: !!input,
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Smart address resolution hook - handles both addresses and .hl names
 */
export function useSmartAddressResolution(input?: string) {
  const validation = useInputValidation(input)
  
  // Only resolve if input is a valid .hl name
  const nameResolution = useHLNameResolution(
    validation.data?.type === 'hl-name' ? input : undefined
  )
  
  // Only do reverse resolution if input is a valid address
  const reverseResolution = useHLReverseResolution(
    validation.data?.type === 'address' ? input as `0x${string}` : undefined
  )
  
  const isLoading = validation.isLoading || nameResolution.isLoading || reverseResolution.isLoading
  
  // Determine the final resolved address and display name
  let resolvedAddress: `0x${string}` | undefined
  let displayName: string | undefined
  let inputType: 'address' | 'hl-name' | 'invalid' | 'empty' = 'empty'
  
  if (validation.data) {
    inputType = validation.data.type
    
    if (validation.data.type === 'address') {
      resolvedAddress = validation.data.value
      displayName = reverseResolution.data?.name
    } else if (validation.data.type === 'hl-name') {
      resolvedAddress = nameResolution.data?.address as `0x${string}` | undefined
      displayName = validation.data.value
    }
  }
  
  // Determine if the resolution is valid
  const isResolutionValid = validation.data?.isValid && (
    (inputType === 'address' && !!resolvedAddress) ||
    (inputType === 'hl-name' && nameResolution.data?.isValid && !!nameResolution.data.address)
  )
  
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
    isValid: isResolutionValid,
    
    // Errors
    error,
    
    // Raw data from individual hooks
    validation: validation.data,
    nameResolution: nameResolution.data,
    reverseResolution: reverseResolution.data,
  }
}

/**
 * Hook for debounced address resolution to prevent excessive API calls
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

/**
 * Hook for testing API connectivity
 */
export function useHLNamesAPITest() {
  return useQuery({
    queryKey: ['hl-names-api-test'],
    queryFn: () => hlNamesAPI.testConnection(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

/**
 * Utility hook for getting display-friendly address/name
 */
export function useAddressDisplay(address: `0x${string}`) {
  const reverseResolution = useHLReverseResolution(address)
  
  return {
    address,
    displayName: reverseResolution.data?.name,
    isLoading: reverseResolution.isLoading,
    // Format address for display (shortened)
    shortAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
    // Prefer name over address for display
    preferredDisplay: reverseResolution.data?.name || `${address.slice(0, 6)}...${address.slice(-4)}`,
  }
}
