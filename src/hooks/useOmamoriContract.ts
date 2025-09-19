import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { contractAddresses } from '@/lib/wagmi'
import { OmamoriNFTOffChainABI } from '@/lib/contracts/abis'

/**
 * Hook for reading from the Omamori NFT contract (Off-Chain Rendering)
 */
export function useOmamoriContract() {
  return {
    address: contractAddresses.OmamoriNFTOffChain,
    abi: OmamoriNFTOffChainABI,
  }
}

/**
 * Hook for minting Omamori NFTs (Off-Chain Rendering) with user-selected arcanum
 */
export function useMintOmamori() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const mint = async (hypeAmount: string, majorId: number, minorId: number) => {
    const value = parseEther(hypeAmount)
    
    return writeContract({
      address: contractAddresses.OmamoriNFTOffChain,
      abi: OmamoriNFTOffChainABI,
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
 * Hook for reading token metadata (Off-Chain Rendering)
 */
export function useTokenURI(tokenId?: number) {
  return useReadContract({
    address: contractAddresses.OmamoriNFTOffChain,
    abi: OmamoriNFTOffChainABI,
    functionName: 'tokenURI',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
    },
  })
}

/**
 * Hook for reading token data (unpacked) (Off-Chain Rendering)
 */
export function useTokenData(tokenId?: number) {
  return useReadContract({
    address: contractAddresses.OmamoriNFTOffChain,
    abi: OmamoriNFTOffChainABI,
    functionName: 'getTokenData',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
    },
  })
}

/**
 * Hook for reading user's token balance (Off-Chain Rendering)
 */
export function useTokenBalance(address?: `0x${string}`) {
  return useReadContract({
    address: contractAddresses.OmamoriNFTOffChain,
    abi: OmamoriNFTOffChainABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })
}

// Note: Off-chain contract includes all material data inline - no external calls needed!

/**
 * Hook for reading material name (Off-Chain Rendering)
 */
export function useMaterialName(materialId?: number) {
  return useReadContract({
    address: contractAddresses.OmamoriNFTOffChain,
    abi: OmamoriNFTOffChainABI,
    functionName: 'getMaterialName',
    args: materialId !== undefined ? [materialId] : undefined,
    query: {
      enabled: materialId !== undefined,
    },
  })
}

/**
 * Hook for reading material tier (Off-Chain Rendering)
 */
export function useMaterialTier(materialId?: number) {
  return useReadContract({
    address: contractAddresses.OmamoriNFTOffChain,
    abi: OmamoriNFTOffChainABI,
    functionName: 'getMaterialTier',
    args: materialId !== undefined ? [materialId] : undefined,
    query: {
      enabled: materialId !== undefined,
    },
  })
}
