import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { contractAddresses } from '@/lib/wagmi'
import { OmamoriNFTSingleABI } from '@/lib/contracts/abis'

/**
 * Hook for reading from the Omamori NFT contract (Single Contract)
 */
export function useOmamoriContract() {
  return {
    address: contractAddresses.OmamoriNFTSingle,
    abi: OmamoriNFTSingleABI,
  }
}

/**
 * Hook for minting Omamori NFTs (Single Contract) with user-selected arcanum
 */
export function useMintOmamori() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const mint = async (hypeAmount: string, majorId: number, minorId: number) => {
    const value = parseEther(hypeAmount)
    
    return writeContract({
      address: contractAddresses.OmamoriNFTSingle,
      abi: OmamoriNFTSingleABI,
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
 * Hook for reading token metadata (Single Contract)
 */
export function useTokenURI(tokenId?: number) {
  return useReadContract({
    address: contractAddresses.OmamoriNFTSingle,
    abi: OmamoriNFTSingleABI,
    functionName: 'tokenURI',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
    },
  })
}

/**
 * Hook for reading token data (unpacked) (Single Contract)
 */
export function useTokenData(tokenId?: number) {
  return useReadContract({
    address: contractAddresses.OmamoriNFTSingle,
    abi: OmamoriNFTSingleABI,
    functionName: 'getTokenData',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
    },
  })
}

/**
 * Hook for reading user's token balance (Single Contract)
 */
export function useTokenBalance(address?: `0x${string}`) {
  return useReadContract({
    address: contractAddresses.OmamoriNFTSingle,
    abi: OmamoriNFTSingleABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })
}

// Note: Single contract includes all material data inline - no external calls needed!

/**
 * Hook for reading material name (Single Contract)
 */
export function useMaterialName(materialId?: number) {
  return useReadContract({
    address: contractAddresses.OmamoriNFTSingle,
    abi: OmamoriNFTSingleABI,
    functionName: 'getMaterialName',
    args: materialId !== undefined ? [materialId] : undefined,
    query: {
      enabled: materialId !== undefined,
    },
  })
}

/**
 * Hook for reading material tier (Single Contract)
 */
export function useMaterialTier(materialId?: number) {
  return useReadContract({
    address: contractAddresses.OmamoriNFTSingle,
    abi: OmamoriNFTSingleABI,
    functionName: 'getMaterialTier',
    args: materialId !== undefined ? [materialId] : undefined,
    query: {
      enabled: materialId !== undefined,
    },
  })
}
