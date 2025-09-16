/**
 * Caching utilities for performance optimization
 */

// Token metadata cache
const tokenCache = new Map<number, any>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Cache token metadata with expiration
 */
export function cacheToken(tokenId: number, data: any) {
  tokenCache.set(tokenId, {
    data,
    timestamp: Date.now(),
  })
}

/**
 * Get cached token metadata
 */
export function getCachedToken(tokenId: number) {
  const cached = tokenCache.get(tokenId)
  
  if (!cached) return null
  
  // Check if cache is expired
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    tokenCache.delete(tokenId)
    return null
  }
  
  return cached.data
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache() {
  const now = Date.now()
  
  for (const [tokenId, cached] of tokenCache.entries()) {
    if (now - cached.timestamp > CACHE_DURATION) {
      tokenCache.delete(tokenId)
    }
  }
}

/**
 * Debounce utility for reducing API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Throttle utility for rate limiting
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Batch contract calls to reduce RPC requests
 */
export class BatchProcessor<T> {
  private batch: T[] = []
  private timeout: NodeJS.Timeout | null = null
  private readonly batchSize: number
  private readonly delay: number
  private readonly processor: (batch: T[]) => Promise<void>
  
  constructor(
    processor: (batch: T[]) => Promise<void>,
    batchSize = 10,
    delay = 100
  ) {
    this.processor = processor
    this.batchSize = batchSize
    this.delay = delay
  }
  
  add(item: T) {
    this.batch.push(item)
    
    // Process immediately if batch is full
    if (this.batch.length >= this.batchSize) {
      this.processBatch()
      return
    }
    
    // Schedule processing if not already scheduled
    if (!this.timeout) {
      this.timeout = setTimeout(() => {
        this.processBatch()
      }, this.delay)
    }
  }
  
  private async processBatch() {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
    
    if (this.batch.length === 0) return
    
    const currentBatch = [...this.batch]
    this.batch = []
    
    try {
      await this.processor(currentBatch)
    } catch (error) {
      console.error('Batch processing error:', error)
    }
  }
  
  flush() {
    this.processBatch()
  }
}

/**
 * Initialize cache cleanup interval
 */
export function initializeCache() {
  // Clean up expired cache entries every 5 minutes
  setInterval(clearExpiredCache, 5 * 60 * 1000)
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage() {
  return {
    tokenCacheSize: tokenCache.size,
    // Add other cache sizes as needed
  }
}
