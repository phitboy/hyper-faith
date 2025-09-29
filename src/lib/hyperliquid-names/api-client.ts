/**
 * Hyperliquid Names API Client
 * 
 * This module provides API-based resolution for .hl names using the official
 * Hyperliquid Names API with contract-based fallback when API fails.
 */

import { hlNamesContract } from './contract-fallback'

// API Configuration
const API_BASE_URL = 'https://api.hlnames.xyz'
const API_KEY = 'CPEPKMI-HUSUX6I-SE2DHEA-YYWFG5Y' // From Swagger docs

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
  private apiKey: string

  constructor(baseURL: string = API_BASE_URL, apiKey: string = API_KEY) {
    this.baseURL = baseURL
    this.apiKey = apiKey
  }

  /**
   * Make authenticated API request using only X-API-Key header as per Swagger docs
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    console.log(`[HLNames API] Trying: ${url}`)
    console.log(`[HLNames API] Using X-API-Key: ${this.apiKey.substring(0, 8)}...`)
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers,
      },
    })

    console.log(`[HLNames API] Response: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = `API Error: ${response.status} - ${errorData.message || response.statusText}`
      console.error(`[HLNames API] ${error}`)
      console.error(`[HLNames API] Error details:`, errorData)
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
      
      // Use correct endpoint pattern from HL Names devs: /resolve/address/{domain}
      const endpoint = `/resolve/address/${normalizedName}`

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
        
        // If we get a response but no address field, it might be a different format
        console.log(`[HLNames API] Unexpected response format:`, result)
        return {
          name: normalizedName,
          address: '',
          isValid: false
        }
      } catch (error) {
        console.error(`[HLNames API] Resolution failed for ${normalizedName}:`, error)
        return {
          name: normalizedName,
          address: '',
          isValid: false
        }
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
   * Note: Using best guess endpoint pattern - may need adjustment based on API docs
   */
  async reverseResolve(address: string): Promise<ReverseResolution> {
    try {
      // Try the most likely endpoint pattern for reverse resolution
      const endpoint = `/resolve/name/${address}`
      
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
        
        console.log(`[HLNames API] Unexpected reverse resolution response:`, result)
      } catch (error) {
        console.error(`[HLNames API] Reverse resolution failed for ${address}:`, error)
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
   * Test API connectivity with basic endpoint
   */
  async testAPIConnectivity(): Promise<boolean> {
    try {
      // Try basic endpoints to test connectivity
      const testEndpoints = [
        '/api/health',
        '/health',
        '/api/status',
        '/status',
        '/api/info',
        '/info'
      ]

      for (const endpoint of testEndpoints) {
        try {
          console.log(`[HLNames API] Testing connectivity with: ${endpoint}`)
          await this.makeRequest(endpoint)
          console.log(`[HLNames API] Connectivity test passed with: ${endpoint}`)
          return true
        } catch (error) {
          console.log(`[HLNames API] ${endpoint} failed:`, error)
          continue
        }
      }

      console.log(`[HLNames API] All connectivity tests failed`)
      return false
    } catch (error) {
      console.error('API connectivity test failed:', error)
      return false
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
export const testHLNamesConnectivity = () => hlNamesAPI.testAPIConnectivity()
