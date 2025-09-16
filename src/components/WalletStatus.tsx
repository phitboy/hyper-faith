import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId } from 'wagmi'
import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useOmamoriStore } from "@/store/omamoriStore"
import { hyperEVM } from '@/lib/chains'

export function WalletStatus() {
  const { address, isConnected, chainId } = useAccount()
  const currentChainId = useChainId()
  const { setWalletState } = useOmamoriStore()

  // Sync wagmi state with zustand store
  useEffect(() => {
    setWalletState(isConnected, address, currentChainId)
  }, [isConnected, address, currentChainId, setWalletState])

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain

        if (!ready) {
          return (
            <Button variant="outline" className="font-mono" disabled>
              Loading...
            </Button>
          )
        }

        if (!connected) {
          return (
            <Button onClick={openConnectModal} className="font-mono">
              Connect Wallet
            </Button>
          )
        }

        if (chain.unsupported || chain.id !== hyperEVM.id) {
          return (
            <Button
              onClick={openChainModal}
              variant="destructive"
              className="font-mono"
            >
              Wrong Network
            </Button>
          )
        }

        return (
          <Button
            onClick={openAccountModal}
            variant="outline"
            className="font-mono gap-2"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {account.displayName}
          </Button>
        )
      }}
    </ConnectButton.Custom>
  )
}