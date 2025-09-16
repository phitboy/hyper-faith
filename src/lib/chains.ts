import { defineChain } from 'viem'

/**
 * HyperEVM Chain Configuration
 * Chain ID: 999
 * Native Currency: HYPE
 */
export const hyperEVM = defineChain({
  id: 999,
  name: 'HyperEVM',
  nativeCurrency: {
    name: 'HYPE',
    symbol: 'HYPE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid.xyz/evm'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HyperEVM Explorer',
      url: 'https://hyperliquid.cloud.blockscout.com',
    },
  },
  testnet: false,
})

/**
 * Chain configuration for wagmi
 */
export const supportedChains = [hyperEVM] as const

/**
 * Check if current chain is HyperEVM
 */
export const isHyperEVM = (chainId?: number): boolean => {
  return chainId === hyperEVM.id
}

/**
 * Get chain by ID
 */
export const getChainById = (chainId: number) => {
  return supportedChains.find(chain => chain.id === chainId)
}
