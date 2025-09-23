/**
 * Hyperliquid Names API Client
 * 
 * This module provides API-based resolution for .hl names using the official
 * Hyperliquid Names API with contract-based fallback when API fails.
 */

import { hlNamesContract } from './contract-fallback'

// API Configuration
const API_BASE_URL = 'https://api.hlnames.xyz'
// Note: API key might not be needed or might be incorrect - testing without auth first

// Types for API responses
export interface HLNameResolution {
  name: string
  address: string
  isValid: boolean
}

export interface ReverseResolution {
  address: string
  name?: string
  isPrimary: boolean
}

export interface APIError {
  error: string
  message: string
  statusCode: number
}

/**
 * API Client for Hyperliquid Names
 */
export class HyperliquidNamesAPI {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  /**
   * Make API request (trying without authentication first)
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    console.log(`[HLNames API] Trying: ${url}`)
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    console.log(`[HLNames API] Response: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = `API Error: ${response.status} - ${errorData.message || response.statusText}`
      console.error(`[HLNames API] ${error}`)
      throw new Error(error)
    }

    const data = await response.json()
    console.log(`[HLNames API] Success:`, data)
    return data
  }

  /**
   * Resolve .hl name to Ethereum address (forward resolution)
   */
  async resolveName(name: string): Promise<HLNameResolution> {
    try {
      // Normalize name (ensure .hl suffix)
      const normalizedName = name.endsWith('.hl') ? name : `${name}.hl`
      
      // Try different possible API endpoints based on common patterns
      const endpoints = [
        `/resolve/${normalizedName}`,
        `/api/resolve/${normalizedName}`,
        `/name/${normalizedName}`,
        `/api/name/${normalizedName}`,
        `/v1/resolve/${normalizedName}`,
        `/v1/name/${normalizedName}`
      ]

      for (const endpoint of endpoints) {
        try {
          const result = await this.makeRequest<any>(endpoint)
          
          // Handle different response formats
          if (result.address) {
            return {
              name: normalizedName,
              address: result.address,
              isValid: true
            }
          }
          
          if (result.resolved_address) {
            return {
              name: normalizedName,
              address: result.resolved_address,
              isValid: true
            }
          }
        } catch (error) {
          // Try next endpoint
          continue
        }
      }

      // If all endpoints fail, return invalid
      return {
        name: normalizedName,
        address: '',
        isValid: false
      }
    } catch (error) {
      console.error('Name resolution error:', error)
      return {
        name: name,
        address: '',
        isValid: false
      }
    }
  }

  /**
   * Reverse resolve Ethereum address to .hl name
   */
  async reverseResolve(address: string): Promise<ReverseResolution> {
    try {
      const endpoints = [
        `/reverse/${address}`,
        `/api/reverse/${address}`,
        `/address/${address}`,
        `/api/address/${address}`,
        `/v1/reverse/${address}`,
        `/v1/address/${address}`
      ]

      for (const endpoint of endpoints) {
        try {
          const result = await this.makeRequest<any>(endpoint)
          
          if (result.name) {
            return {
              address,
              name: result.name,
              isPrimary: result.isPrimary || result.is_primary || true
            }
          }
          
          if (result.primary_name) {
            return {
              address,
              name: result.primary_name,
              isPrimary: true
            }
          }
        } catch (error) {
          continue
        }
      }

      return {
        address,
        name: undefined,
        isPrimary: false
      }
    } catch (error) {
      console.error('Reverse resolution error:', error)
      return {
        address,
        name: undefined,
        isPrimary: false
      }
    }
  }

  /**
   * Test API connectivity with known example
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test with the documented example: testooor.hl -> 0xF26F5551E96aE5162509B25925fFfa7F07B2D652
      const result = await this.resolveName('testooor.hl')
      return result.isValid && result.address.toLowerCase() === '0xF26F5551E96aE5162509B25925fFfa7F07B2D652'.toLowerCase()
    } catch (error) {
      console.error('API connection test failed:', error)
      return false
    }
  }

  /**
   * Try alternative resolution methods when API fails
   */
  async resolveNameWithFallback(name: string): Promise<HLNameResolution> {
    try {
      // First try the API
      return await this.resolveName(name)
    } catch (apiError) {
      console.warn('[HLNames] API failed, trying contract fallback:', apiError)
      
      // Fallback to contract-based resolution
      try {
        const contractResult = await hlNamesContract.resolveName(name)
        console.log('[HLNames] Contract fallback result:', contractResult)
        return contractResult
      } catch (contractError) {
        console.error('[HLNames] Contract fallback also failed:', contractError)
        return {
          name: name.endsWith('.hl') ? name : `${name}.hl`,
          address: '',
          isValid: false
        }
      }
    }
  }

  /**
   * Check if a name is valid .hl format
   */
  isValidHLName(name: string): boolean {
    if (!name || typeof name !== 'string') return false
    
    // Must end with .hl
    if (!name.endsWith('.hl')) return false
    
    // Remove .hl suffix for validation
    const baseName = name.slice(0, -3)
    
    // Must have at least 1 character before .hl
    if (baseName.length === 0) return false
    
    // Basic validation - alphanumeric and hyphens only
    // Can't start or end with hyphen
    const nameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/
    
    return nameRegex.test(baseName)
  }
}

// Create singleton instance
export const hlNamesAPI = new HyperliquidNamesAPI()

// Utility functions for direct use
export const resolveHLName = (name: string) => hlNamesAPI.resolveNameWithFallback(name)
export const resolveHLNameAPIOnly = (name: string) => hlNamesAPI.resolveName(name)
export const reverseResolveAddress = (address: string) => hlNamesAPI.reverseResolve(address)
export const isValidHLName = (name: string) => hlNamesAPI.isValidHLName(name)
export const testHLNamesAPI = () => hlNamesAPI.testConnection()
