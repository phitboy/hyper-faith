import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { contractAddresses } from '@/lib/wagmi'
import { OmamoriNFTABI } from '@/lib/contracts/abis'

/**
 * Hook for reading from the Omamori NFT contract
 */
export function useOmamoriContract() {
  return {
    address: contractAddresses.OmamoriNFT,
    abi: OmamoriNFTABI,
  }
}

/**
 * Hook for minting Omamori NFTs with user-selected arcanum
 */
export function useMintOmamori() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const mint = async (hypeAmount: string, majorId: number, minorId: number) => {
    const value = parseEther(hypeAmount)
    
    return writeContract({
      address: contractAddresses.OmamoriNFT,
      abi: OmamoriNFTABI,
      functionName: 'mint',
      args: [majorId, minorId],
      value,
    } as any)
  }

  return {
    mint,
    hash,
    error,
    isPending,
  }
}

/**
 * Hook for waiting for mint transaction confirmation
 */
export function useWaitForMint(hash?: `0x${string}`) {
  return useWaitForTransactionReceipt({
    hash,
  })
}

/**
 * Hook for reading token metadata
 */
export function useTokenURI(tokenId?: number) {
  return useReadContract({
    address: contractAddresses.OmamoriNFT,
    abi: OmamoriNFTABI,
    functionName: 'tokenURI',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
    },
  })
}

/**
 * Hook for reading token data (unpacked)
 */
export function useTokenData(tokenId?: number) {
  return useReadContract({
    address: contractAddresses.OmamoriNFT,
    abi: OmamoriNFTABI,
    functionName: 'getTokenData',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
    },
  })
}

/**
 * Hook for reading user's token balance
 */
export function useTokenBalance(address?: `0x${string}`) {
  return useReadContract({
    address: contractAddresses.OmamoriNFT,
    abi: OmamoriNFTABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })
}

// Note: Material data is handled off-chain via metadata service
