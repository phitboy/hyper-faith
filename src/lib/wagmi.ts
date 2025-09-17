import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { hyperEVM } from './chains'

/**
 * Wagmi configuration for HyperEVM with multi-wallet support
 */
export const config = getDefaultConfig({
  appName: 'Hyper Faith Omamori',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id', // Get from WalletConnect Cloud
  chains: [hyperEVM],
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        rabbyWallet,
        rainbowWallet,
      ],
    },
    {
      groupName: 'Mobile',
      wallets: [
        walletConnectWallet,
      ],
    },
  ],
  ssr: false, // We're using Vite, not Next.js
})

/**
 * Contract addresses for HyperEVM
 */
export const contractAddresses = {
  // NEW: Single contract with everything embedded (BEAUTIFUL SVG ART VERSION)
  OmamoriNFTSingle: '0xb4427574AC7941528b413AEDDC435B774040F518' as const,
  
  // Legacy multi-contract system (for reference)
  OmamoriNFTSecure: '0xef680bE6F1586d746562F4f5CB95b1e7829b9099' as const,
  OmamoriNFTWithRoyalties: '0x95d7a58c9efC295362deF554761909Ebc42181b1' as const,
  SVGAssembler: '0xB42ac8659c9F661EB548C68e67F432cF5D2aa52c' as const,
  GlyphRenderer: '0x11Bb63863024444A5E4BB4d157aaDDc8441C8618' as const,
  PunchRenderer: '0x72cFcB2e443b4D6AA341871C85Cbd390aE0Ab2Af' as const,
  MaterialRegistry: '0xA5D308DE0Be64df79C6715418070a090195A5657' as const,
} as const

/**
 * Get contract address by name
 */
export const getContractAddress = (contractName: keyof typeof contractAddresses) => {
  return contractAddresses[contractName]
}
