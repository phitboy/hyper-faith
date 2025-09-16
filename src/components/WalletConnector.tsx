import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId } from 'wagmi'
import { hyperEVM } from '@/lib/chains'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

/**
 * Enhanced wallet connector with HyperEVM network support
 * Replaces the mock WalletStatus component with real multi-wallet integration
 */
export function WalletConnector() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const isCorrectNetwork = chainId === hyperEVM.id

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main Connect Button */}
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

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <Button
                      onClick={openConnectModal}
                      className="font-mono hover-lift focus-ring"
                      size="lg"
                    >
                      Connect Wallet
                    </Button>
                  )
                }

                if (chain.unsupported) {
                  return (
                    <Button
                      onClick={openChainModal}
                      variant="destructive"
                      className="font-mono"
                      size="lg"
                    >
                      Wrong Network
                    </Button>
                  )
                }

                return (
                  <div className="flex gap-2">
                    <Button
                      onClick={openChainModal}
                      variant="outline"
                      className="font-mono text-sm"
                    >
                      {chain.hasIcon && (
                        <div
                          className="w-3 h-3 rounded-full overflow-hidden mr-2"
                          style={{
                            background: chain.iconBackground,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              className="w-3 h-3"
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </Button>

                    <Button
                      onClick={openAccountModal}
                      className="font-mono"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                      {account.displayName}
                      {account.displayBalance && (
                        <span className="ml-2 text-xs opacity-75">
                          ({account.displayBalance})
                        </span>
                      )}
                    </Button>
                  </div>
                )
              })()}
            </div>
          )
        }}
      </ConnectButton.Custom>

      {/* Network Warning */}
      {isConnected && !isCorrectNetwork && (
        <Alert className="border-orange-200 bg-orange-50 max-w-md">
          <AlertDescription className="text-center font-mono text-sm">
            ⚠️ Please switch to HyperEVM network to mint Omamori
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Help */}
      {!isConnected && (
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground font-mono">
            Supported wallets: MetaMask, Rabby, Rainbow
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <a 
              href="https://metamask.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Get MetaMask
            </a>
            <a 
              href="https://rabby.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Get Rabby
            </a>
            <a 
              href="https://rainbow.me" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Get Rainbow
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Simplified wallet status for header/navigation
 * Maintains the same API as the original WalletStatus component
 */
export function WalletStatus() {
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

        if (chain.unsupported) {
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
