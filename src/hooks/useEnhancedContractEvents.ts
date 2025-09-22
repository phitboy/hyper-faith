import { useWatchContractEvent, useAccount } from 'wagmi'
import { useToast } from '@/hooks/use-toast'
import { useOmamoriStore } from '@/store/omamoriStore'
import { contractAddresses } from '@/lib/wagmi'
import { OmamoriNFTABI } from '@/lib/contracts/abis'
import { fetchTokenById } from '@/lib/contracts/tokenQueries'
import { useCallback } from 'react'

// Helper function to resolve address to name for notifications
async function getDisplayName(address: string): Promise<string> {
  // In a real implementation, this would call the Hyperliquid Names contract
  // For now, we'll return the shortened address as fallback
  // This would be replaced with actual name resolution once contracts are deployed
  
  // Placeholder for name resolution
  // const name = await resolveAddressToName(address);
  // if (name) return name;
  
  // Return shortened address as fallback
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Enhanced hook to listen for Transfer events with name resolution
 */
export function useEnhancedTransferEvents() {
  const { address } = useAccount()
  const { toast } = useToast()
  const { addToken, removeToken, setAllTokens, allTokens } = useOmamoriStore()

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
                // Show community mint notification with name if available
                const displayName = await getDisplayName(to)
                toast({
                  title: "✨ New Community Mint",
                  description: `Token #${tokenId} minted by ${displayName}!`,
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
          
          // If transferred FROM current user (outgoing transfer)
          if (from.toLowerCase() === address?.toLowerCase()) {
            removeToken(Number(tokenId))
            
            // Get recipient display name for notification
            const recipientName = await getDisplayName(to)
            toast({
              title: "📤 NFT Sent",
              description: `Token #${tokenId} transferred to ${recipientName}`,
            })
          }
          
          // If transferred TO current user (incoming transfer)
          else if (to.toLowerCase() === address?.toLowerCase()) {
            const token = await fetchTokenById(Number(tokenId))
            if (token) {
              addToken(token)
              
              // Get sender display name for notification
              const senderName = await getDisplayName(from)
              toast({
                title: "📥 NFT Received",
                description: `Token #${tokenId} received from ${senderName}`,
              })
            }
          }
          
          // If neither sender nor recipient is current user, but we want to show community activity
          else {
            const senderName = await getDisplayName(from)
            const recipientName = await getDisplayName(to)
            
            // Only show if we want community notifications (could be a setting)
            // toast({
            //   title: "🔄 Community Transfer",
            //   description: `Token #${tokenId}: ${senderName} → ${recipientName}`,
            // })
          }
        }
      } catch (error) {
        console.error('Error processing transfer event:', error)
      }
    }
  }, [address, toast, addToken, removeToken, setAllTokens, allTokens])

  useWatchContractEvent({
    address: contractAddresses.OmamoriNFT,
    abi: OmamoriNFTABI,
    eventName: 'Transfer' as any,
    onLogs: handleTransfer,
  })
}

/**
 * Enhanced hook for HypeBurned events with name resolution
 */
export function useEnhancedHypeBurnedEvents() {
  const { address } = useAccount()
  const { toast } = useToast()

  const handleHypeBurned = useCallback(async (logs: any[]) => {
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
        } else {
          // Show community burn notification with name if available
          const burnerName = await getDisplayName(burner)
          const hypeAmount = (Number(amount) / 1e18).toFixed(4)
          
          // Only show if we want community notifications
          // toast({
          //   title: "🔥 Community Burn",
          //   description: `${burnerName} burned ${hypeAmount} HYPE for token #${tokenId}`,
          // })
        }
      } catch (error) {
        console.error('Error processing HypeBurned event:', error)
      }
    }
  }, [address, toast])

  useWatchContractEvent({
    address: contractAddresses.OmamoriNFT,
    abi: OmamoriNFTABI,
    eventName: 'HypeBurned' as any,
    onLogs: handleHypeBurned,
  })
}

/**
 * Combined hook for all enhanced contract events
 */
export function useEnhancedOmamoriEvents() {
  useEnhancedTransferEvents()
  useEnhancedHypeBurnedEvents()
}

/**
 * Hook for real-time statistics with name resolution
 */
export function useEnhancedRealTimeStats() {
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
