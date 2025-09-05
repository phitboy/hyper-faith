// Contract ABIs and addresses for Hyper Faith Omamori NFT
export { default as MaterialRegistryPaletteABI } from '../../abis/MaterialRegistryPalette.json'
export { default as OmamoriRenderABI } from '../../abis/OmamoriRender.json'
export { default as OmamoriNFTABI } from '../../abis/OmamoriNFT.json'
export { default as IMaterialsABI } from '../../abis/IMaterials.json'

// Contract addresses by chain ID
export const CONTRACT_ADDRESSES = {
  999: { // HyperEVM
    MaterialRegistryPalette: '0x0000000000000000000000000000000000000000', // Update after deployment
    OmamoriRender: '0x0000000000000000000000000000000000000000', // Update after deployment
    OmamoriNFT: '0x0000000000000000000000000000000000000000', // Update after deployment
  }
} as const

// Chain configuration
export const HYPERLIQUID_CHAIN = {
  id: 999,
  name: 'HyperEVM',
  network: 'hyperliquid',
  nativeCurrency: {
    decimals: 18,
    name: 'HYPE',
    symbol: 'HYPE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid.xyz/evm'],
    },
    public: {
      http: ['https://rpc.hyperliquid.xyz/evm'],
    },
  },
  blockExplorers: {
    default: { name: 'HyperEVM Explorer', url: 'https://explorer.hyperliquid.xyz' },
  },
} as const

// Constants
export const MIN_HYPE_BURN = '10000000000000000' // 0.01 HYPE in wei
export const BURN_ADDRESS = '0xfefeFEFeFEFEFEFEFeFefefefefeFEfEfefefEfe'

// Types
export interface TokenData {
  majorId: number
  minorId: number
  materialId: number
  punchCount: number
  seed: string
  hypeBurned: string
}

export interface MaterialView {
  name: string
  tierName: string
  bg: string
  stroke: string
}

export enum BurnMode {
  ERC20 = 0,
  NATIVE = 1
}

// Re-export everything from generated types (will be created by wagmi generate)
export * from './generated'
