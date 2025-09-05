import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { parseEther } from 'viem'
import { 
  CONTRACT_ADDRESSES, 
  OmamoriNFTABI, 
  MaterialRegistryPaletteABI, 
  OmamoriRenderABI,
  MIN_HYPE_BURN,
  type TokenData,
  type MaterialView,
  BurnMode
} from './index'

// Chain ID for HyperEVM
const CHAIN_ID = 999

/**
 * Hook to mint an Omamori NFT
 */
export function useMintOmamori() {
  const { config } = usePrepareContractWrite({
    address: CONTRACT_ADDRESSES[CHAIN_ID].OmamoriNFT as `0x${string}`,
    abi: OmamoriNFTABI,
    functionName: 'mint',
  })

  const { data, isLoading, isSuccess, write } = useContractWrite(config)

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransaction({
    hash: data?.hash,
  })

  const mint = (majorId: number, minorId: number, amountToBurn: string, value?: string) => {
    if (write) {
      write({
        args: [majorId, minorId, amountToBurn],
        value: value ? parseEther(value) : undefined,
      })
    }
  }

  return {
    mint,
    data,
    isLoading: isLoading || isConfirming,
    isSuccess: isConfirmed,
    error: null, // Add error handling as needed
  }
}

/**
 * Hook to get user's Omamori tokens
 */
export function useMyOmamori(address?: `0x${string}`) {
  const { data: balance } = useContractRead({
    address: CONTRACT_ADDRESSES[CHAIN_ID].OmamoriNFT as `0x${string}`,
    abi: OmamoriNFTABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address,
  })

  // Note: This is a simplified version. In practice, you'd need to:
  // 1. Get the balance
  // 2. For each token index, call tokenOfOwnerByIndex to get token IDs
  // 3. For each token ID, call getTokenData to get the token details
  // 4. Call tokenURI to get the metadata

  return {
    tokens: [], // Implement token enumeration
    isLoading: false,
    error: null,
  }
}

/**
 * Hook to get token data by ID
 */
export function useTokenData(tokenId?: number) {
  const { data, isLoading, error } = useContractRead({
    address: CONTRACT_ADDRESSES[CHAIN_ID].OmamoriNFT as `0x${string}`,
    abi: OmamoriNFTABI,
    functionName: 'getTokenData',
    args: tokenId !== undefined ? [tokenId] : undefined,
    enabled: tokenId !== undefined,
  })

  return {
    data: data as TokenData | undefined,
    isLoading,
    error,
  }
}

/**
 * Hook to get token URI (metadata + SVG)
 */
export function useTokenURI(tokenId?: number) {
  const { data, isLoading, error } = useContractRead({
    address: CONTRACT_ADDRESSES[CHAIN_ID].OmamoriNFT as `0x${string}`,
    abi: OmamoriNFTABI,
    functionName: 'tokenURI',
    args: tokenId !== undefined ? [tokenId] : undefined,
    enabled: tokenId !== undefined,
  })

  return {
    uri: data as string | undefined,
    isLoading,
    error,
  }
}

/**
 * Hook to get material data
 */
export function useMaterial(materialId?: number) {
  const { data, isLoading, error } = useContractRead({
    address: CONTRACT_ADDRESSES[CHAIN_ID].MaterialRegistryPalette as `0x${string}`,
    abi: MaterialRegistryPaletteABI,
    functionName: 'viewMaterial',
    args: materialId !== undefined ? [materialId] : undefined,
    enabled: materialId !== undefined,
  })

  return {
    material: data as MaterialView | undefined,
    isLoading,
    error,
  }
}

/**
 * Hook to get all materials (0-23)
 */
export function useAllMaterials() {
  const materialIds = Array.from({ length: 24 }, (_, i) => i)
  
  // This would typically use a multicall or batch read
  // For now, simplified to single calls
  const materials = materialIds.map(id => {
    const { data } = useContractRead({
      address: CONTRACT_ADDRESSES[CHAIN_ID].MaterialRegistryPalette as `0x${string}`,
      abi: MaterialRegistryPaletteABI,
      functionName: 'viewMaterial',
      args: [id],
    })
    return data as MaterialView | undefined
  })

  return {
    materials: materials.filter(Boolean) as MaterialView[],
    isLoading: materials.some(m => m === undefined),
    error: null,
  }
}

/**
 * Hook to get NFT contract info
 */
export function useContractInfo() {
  const { data: totalSupply } = useContractRead({
    address: CONTRACT_ADDRESSES[CHAIN_ID].OmamoriNFT as `0x${string}`,
    abi: OmamoriNFTABI,
    functionName: 'totalSupply',
  })

  const { data: burnMode } = useContractRead({
    address: CONTRACT_ADDRESSES[CHAIN_ID].OmamoriNFT as `0x${string}`,
    abi: OmamoriNFTABI,
    functionName: 'burnMode',
  })

  const { data: minBurn } = useContractRead({
    address: CONTRACT_ADDRESSES[CHAIN_ID].OmamoriNFT as `0x${string}`,
    abi: OmamoriNFTABI,
    functionName: 'MIN_BURN',
  })

  return {
    totalSupply: totalSupply as number | undefined,
    burnMode: burnMode as BurnMode | undefined,
    minBurn: minBurn as string | undefined,
    isERC20Mode: burnMode === BurnMode.ERC20,
    isNativeMode: burnMode === BurnMode.NATIVE,
  }
}

/**
 * Hook to approve HYPE token spending (for ERC-20 mode)
 */
export function useApproveHype(hypeTokenAddress?: `0x${string}`) {
  const { config } = usePrepareContractWrite({
    address: hypeTokenAddress,
    abi: [
      {
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
      },
    ],
    functionName: 'approve',
  })

  const { data, isLoading, isSuccess, write } = useContractWrite(config)

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransaction({
    hash: data?.hash,
  })

  const approve = (amount: string) => {
    if (write) {
      write({
        args: [CONTRACT_ADDRESSES[CHAIN_ID].OmamoriNFT, amount],
      })
    }
  }

  return {
    approve,
    data,
    isLoading: isLoading || isConfirming,
    isSuccess: isConfirmed,
    error: null,
  }
}

/**
 * Hook to check HYPE token allowance
 */
export function useHypeAllowance(hypeTokenAddress?: `0x${string}`, owner?: `0x${string}`) {
  const { data, isLoading, error } = useContractRead({
    address: hypeTokenAddress,
    abi: [
      {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
      },
    ],
    functionName: 'allowance',
    args: owner ? [owner, CONTRACT_ADDRESSES[CHAIN_ID].OmamoriNFT] : undefined,
    enabled: !!(hypeTokenAddress && owner),
  })

  return {
    allowance: data as string | undefined,
    isLoading,
    error,
  }
}
