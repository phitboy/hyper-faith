import { useWatchContractEvent, useAccount } from 'wagmi'
import { useToast } from '@/hooks/use-toast'
import { useOmamoriStore } from '@/store/omamoriStore'
import { contractAddresses } from '@/lib/wagmi'
import { OmamoriNFTOffChainABI } from '@/lib/contracts/abis'
import { parseTokenURI } from '@/lib/contracts/realOmamori'
import { fetchTokenById } from '@/lib/contracts/tokenQueries'
import { useCallback } from 'react'

/**
 * Hook to listen for Transfer events (mints and transfers)
 */
export function useTransferEvents() {
  const { address } = useAccount()
  const { toast } = useToast()
  const { addToken, setAllTokens, allTokens } = useOmamoriStore()

  const handleTransfer = useCallback(async (logs: any[]) => {
    for (const log of logs) {
      try {
        const { args } = log
        const { from, to, tokenId } = args
        
        // Handle mint (from address(0))
        if (from === '0x0000000000000000000000000000000000000000') {
          console.log(`New mint detected: Token #${tokenId} to ${to}`)
          
          // Fetch token metadata
          try {
            const token = await fetchTokenById(Number(tokenId))
            if (token) {
              // Add to all tokens for explore page
              setAllTokens([token, ...allTokens])
              
              // If minted by current user, add to their collection
              if (to.toLowerCase() === address?.toLowerCase()) {
                addToken(token)
                toast({
                  title: "🎉 Omamori Minted!",
                  description: `Token #${tokenId} successfully created`,
                })
              } else {
                // Show community mint notification
                toast({
                  title: "✨ New Community Mint",
                  description: `Token #${tokenId} minted! Pure luck determines the outcome.`,
                })
              }
            }
          } catch (error) {
            console.error(`Failed to fetch metadata for token ${tokenId}:`, error)
          }
        }
        
        // Handle transfer (between users)
        else if (from !== '0x0000000000000000000000000000000000000000') {
          console.log(`Transfer detected: Token #${tokenId} from ${from} to ${to}`)
          
          // If transferred to current user
          if (to.toLowerCase() === address?.toLowerCase()) {
            const token = await fetchTokenById(Number(tokenId))
            if (token) {
              addToken(token)
              toast({
                title: "📥 NFT Received",
                description: `Token #${tokenId} transferred to you`,
              })
            }
          }
        }
      } catch (error) {
        console.error('Error processing transfer event:', error)
      }
    }
  }, [address, toast, addToken, setAllTokens, allTokens])

  useWatchContractEvent({
    address: contractAddresses.OmamoriNFTOffChain,
    abi: OmamoriNFTOffChainABI,
    eventName: 'Transfer' as any, // Cast to any to avoid strict typing issues
    onLogs: handleTransfer,
  })
}

/**
 * Hook to listen for HypeBurned events
 */
export function useHypeBurnedEvents() {
  const { address } = useAccount()
  const { toast } = useToast()

  const handleHypeBurned = useCallback((logs: any[]) => {
    for (const log of logs) {
      try {
        const { args } = log
        const { burner, tokenId, amount } = args
        
        console.log(`HYPE burned: ${amount} by ${burner} for token #${tokenId}`)
        
        // Show notification for current user's burns
        if (burner.toLowerCase() === address?.toLowerCase()) {
          const hypeAmount = (Number(amount) / 1e18).toFixed(4)
          toast({
            title: "🔥 HYPE Burned",
            description: `${hypeAmount} HYPE burned for token #${tokenId}`,
          })
        }
      } catch (error) {
        console.error('Error processing HypeBurned event:', error)
      }
    }
  }, [address, toast])

  useWatchContractEvent({
    address: contractAddresses.OmamoriNFTOffChain,
    abi: OmamoriNFTOffChainABI,
    eventName: 'HypeBurned' as any, // Cast to any to avoid strict typing issues
    onLogs: handleHypeBurned,
  })
}

/**
 * Combined hook for all contract events
 */
export function useOmamoriEvents() {
  useTransferEvents()
  useHypeBurnedEvents()
}

/**
 * Hook for real-time statistics
 */
export function useRealTimeStats() {
  const { allTokens } = useOmamoriStore()
  
  // Calculate real-time stats from events
  const stats = {
    totalMinted: allTokens.length,
    totalHypeBurned: allTokens.reduce((sum, token) => {
      return sum + parseFloat(token.hypeBurned || '0')
    }, 0),
    uniqueHolders: new Set(allTokens.map(token => token.tokenId)).size, // Simplified
    recentMints: allTokens.slice(0, 5), // Last 5 mints
  }
  
  return stats
}
