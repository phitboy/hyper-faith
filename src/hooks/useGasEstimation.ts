import { useEstimateGas, useGasPrice, useAccount } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { contractAddresses } from '@/lib/wagmi'
import { OmamoriNFTWithRoyaltiesABI, OmamoriNFTABI } from '@/lib/contracts/abis'
import { useQuery } from '@tanstack/react-query'

/**
 * Hook to estimate gas for minting transaction
 */
export function useMintGasEstimation(hypeAmount: string) {
  const { address } = useAccount()
  
  // Estimate gas for mint function
  const { data: gasEstimate, isLoading: isEstimatingGas } = useEstimateGas({
    address: contractAddresses.OmamoriNFTWithRoyalties,
    abi: OmamoriNFTWithRoyaltiesABI,
    functionName: 'mint',
    args: [],
    value: hypeAmount ? parseEther(hypeAmount) : undefined,
    account: address,
    query: {
      enabled: !!address && !!hypeAmount && parseFloat(hypeAmount) >= 0.01,
      staleTime: 10000, // 10 seconds
    },
  })
  
  // Get current gas price
  const { data: gasPrice, isLoading: isLoadingGasPrice } = useGasPrice({
    query: {
      staleTime: 5000, // 5 seconds
    },
  })
  
  // Calculate total cost
  const totalCost = useQuery({
    queryKey: ['totalMintCost', gasEstimate?.toString(), gasPrice?.toString(), hypeAmount],
    queryFn: () => {
      if (!gasEstimate || !gasPrice || !hypeAmount) return null
      
      const gasCost = gasEstimate * gasPrice
      const hypeCost = parseEther(hypeAmount)
      const totalWei = gasCost + hypeCost
      
      return {
        gasEstimate: Number(gasEstimate),
        gasPrice: Number(gasPrice),
        gasCostWei: gasCost,
        gasCostHype: formatEther(gasCost),
        hypeCostWei: hypeCost,
        hypeCostHype: hypeAmount,
        totalWei,
        totalHype: formatEther(totalWei),
        breakdown: {
          gas: formatEther(gasCost),
          hype: hypeAmount,
          total: formatEther(totalWei),
        }
      }
    },
    enabled: !!gasEstimate && !!gasPrice && !!hypeAmount,
    staleTime: 5000,
  })
  
  return {
    gasEstimate,
    gasPrice,
    totalCost: totalCost.data,
    isLoading: isEstimatingGas || isLoadingGasPrice || totalCost.isLoading,
    error: totalCost.error,
  }
}

/**
 * Hook for real-time gas price monitoring
 */
export function useGasPriceMonitor() {
  const { data: gasPrice, isLoading } = useGasPrice({
    query: {
      refetchInterval: 10000, // Update every 10 seconds
      staleTime: 5000,
    },
  })
  
  const gasPriceGwei = gasPrice ? Number(gasPrice) / 1e9 : 0
  
  // Categorize gas price
  const category = gasPriceGwei < 1 ? 'low' : 
                  gasPriceGwei < 2 ? 'medium' : 'high'
  
  return {
    gasPrice,
    gasPriceGwei: gasPriceGwei.toFixed(2),
    category,
    isLoading,
    recommendation: getGasRecommendation(category),
  }
}

/**
 * Get gas price recommendation
 */
function getGasRecommendation(category: string): string {
  switch (category) {
    case 'low':
      return 'Great time to mint! Low gas fees.'
    case 'medium':
      return 'Normal gas fees. Good time to mint.'
    case 'high':
      return 'High gas fees. Consider waiting.'
    default:
      return 'Checking gas prices...'
  }
}

/**
 * Hook for transaction cost breakdown
 */
export function useTransactionCostBreakdown(hypeAmount: string) {
  const { totalCost, isLoading } = useMintGasEstimation(hypeAmount)
  
  return useQuery({
    queryKey: ['costBreakdown', totalCost?.totalHype],
    queryFn: () => {
      if (!totalCost) return null
      
      const gasPercentage = (parseFloat(totalCost.breakdown.gas) / parseFloat(totalCost.breakdown.total)) * 100
      const hybePercentage = (parseFloat(totalCost.breakdown.hype) / parseFloat(totalCost.breakdown.total)) * 100
      
      return {
        items: [
          {
            label: 'HYPE to Burn',
            amount: totalCost.breakdown.hype,
            percentage: hybePercentage.toFixed(1),
            description: 'Amount burned to mint NFT',
          },
          {
            label: 'Gas Fee',
            amount: totalCost.breakdown.gas,
            percentage: gasPercentage.toFixed(1),
            description: 'Transaction execution cost',
          },
        ],
        total: {
          amount: totalCost.breakdown.total,
          label: 'Total Cost',
        },
        summary: `${totalCost.breakdown.total} HYPE (${totalCost.breakdown.hype} burned + ${totalCost.breakdown.gas} gas)`
      }
    },
    enabled: !!totalCost && !isLoading,
    staleTime: 5000,
  })
}

/**
 * Hook to estimate gas for transfer transaction
 */
export function useTransferGasEstimation(tokenId?: number, toAddress?: `0x${string}`) {
  const { address } = useAccount()
  
  // Estimate gas for transfer function
  const { data: gasEstimate, isLoading: isEstimatingGas } = useEstimateGas({
    address: contractAddresses.OmamoriNFT,
    abi: OmamoriNFTABI,
    functionName: 'safeTransferFrom',
    args: address && toAddress && tokenId ? [address, toAddress, BigInt(tokenId)] : undefined,
    account: address,
    query: {
      enabled: !!address && !!toAddress && !!tokenId && tokenId > 0,
      staleTime: 10000, // 10 seconds
    },
  })
  
  // Get current gas price
  const { data: gasPrice, isLoading: isLoadingGasPrice } = useGasPrice({
    query: {
      staleTime: 5000, // 5 seconds
    },
  })
  
  // Calculate total cost (transfers only need gas, no HYPE burn)
  const totalCost = useQuery({
    queryKey: ['totalTransferCost', gasEstimate?.toString(), gasPrice?.toString(), tokenId, toAddress],
    queryFn: () => {
      if (!gasEstimate || !gasPrice) return null
      
      const gasCost = gasEstimate * gasPrice
      
      return {
        gasEstimate: Number(gasEstimate),
        gasPrice: Number(gasPrice),
        gasCostWei: gasCost,
        gasCostHype: formatEther(gasCost),
        totalWei: gasCost,
        totalHype: formatEther(gasCost),
        breakdown: {
          gas: formatEther(gasCost),
          total: formatEther(gasCost),
        }
      }
    },
    enabled: !!gasEstimate && !!gasPrice,
    staleTime: 5000,
  })
  
  return {
    gasEstimate,
    gasPrice,
    totalCost: totalCost.data,
    isLoading: isEstimatingGas || isLoadingGasPrice || totalCost.isLoading,
    error: totalCost.error,
  }
}

/**
 * Hook to check if user has sufficient balance
 */
export function useBalanceCheck(requiredAmount?: string) {
  const { address } = useAccount()
  
  return useQuery({
    queryKey: ['balanceCheck', address, requiredAmount],
    queryFn: async () => {
      if (!address || !requiredAmount) return null
      
      // This would need to be implemented with a balance check
      // For now, we'll return a placeholder
      return {
        hasEnough: true, // Placeholder
        balance: '1.0000', // Placeholder
        required: requiredAmount,
        shortfall: '0.0000',
      }
    },
    enabled: !!address && !!requiredAmount,
    staleTime: 10000,
  })
}
