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
  // CURRENT: New clean contract with off-chain rendering
  OmamoriNFT: '0x2D15f5B36e6a034f89B9591fbfcC98fC71A039B2' as const,
  
  // Previous versions (deprecated)
  OmamoriNFTOffChain: '0x6B01f27dacE8237eA48590BADc37577A2f96A110' as const,
  OmamoriNFTSingle: '0xb4427574AC7941528b413AEDDC435B774040F518' as const,
  OmamoriNFTSecure: '0xef680bE6F1586d746562F4f5CB95b1e7829b9099' as const,
  OmamoriNFTWithRoyalties: '0x95d7a58c9efC295362deF554761909Ebc42181b1' as const,
} as const

/**
 * Get contract address by name
 */
export const getContractAddress = (contractName: keyof typeof contractAddresses) => {
  return contractAddresses[contractName]
}
