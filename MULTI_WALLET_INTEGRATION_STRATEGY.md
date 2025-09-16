# 🔗 **MULTI-WALLET HYPEREVM INTEGRATION STRATEGY**

## 🎯 **PLANNER: Comprehensive Wallet Support Plan**

### **🔍 HyperEVM Wallet Ecosystem Analysis**

Based on research, here are the confirmed wallet integrations for HyperEVM:

#### **✅ Confirmed HyperEVM Support**
1. **MetaMask** - Manual network addition required
2. **Rabby Wallet** - Native HyperEVM support 
3. **Rainbow Wallet** - EVM compatible (needs custom chain config)
4. **Leap Wallet** - Multi-chain with HyperEVM support
5. **Gem Wallet** - Mobile wallet with native HyperEVM

#### **📋 HyperEVM Network Details**
```json
{
  "chainId": 999,
  "name": "HyperEVM",
  "rpcUrls": ["https://rpc.hyperliquid.xyz/evm"],
  "nativeCurrency": {
    "name": "HYPE",
    "symbol": "HYPE", 
    "decimals": 18
  },
  "blockExplorers": ["https://hyperliquid.cloud.blockscout.com/"]
}
```

---

## 🛠️ **TECHNICAL IMPLEMENTATION STRATEGY**

### **Option A: RainbowKit + Wagmi (RECOMMENDED)**

#### **🌈 Why RainbowKit is Perfect**
- **Multi-wallet support** out of the box
- **Beautiful UI** with wallet selection modal
- **Custom chain support** for HyperEVM
- **Automatic network switching**
- **Mobile wallet support** via WalletConnect

#### **📦 Installation**
```bash
npm install @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```

#### **⚙️ Configuration**
```typescript
// src/lib/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { metaMask, rabby, rainbow, walletConnect } from '@rainbow-me/rainbowkit/wallets'

// Define HyperEVM chain
export const hyperEVM = {
  id: 999,
  name: 'HyperEVM',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.hyperliquid.xyz/evm'] },
    public: { http: ['https://rpc.hyperliquid.xyz/evm'] }
  },
  blockExplorers: {
    default: { 
      name: 'HyperEVM Explorer', 
      url: 'https://hyperliquid.cloud.blockscout.com' 
    }
  },
  testnet: false
}

// Configure supported wallets
const config = getDefaultConfig({
  appName: 'Hyper Faith Omamori',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [hyperEVM],
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [
        metaMask,
        rabby,
        rainbow,
      ]
    },
    {
      groupName: 'Mobile',
      wallets: [
        walletConnect,
      ]
    }
  ]
})

export { config }
```

#### **🎨 App Setup**
```typescript
// src/main.tsx
import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './lib/wagmi'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {/* Your app */}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

#### **🔗 Wallet Connection Component**
```typescript
// src/components/WalletConnector.tsx
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId } from 'wagmi'
import { hyperEVM } from '@/lib/wagmi'

export function WalletConnector() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  
  return (
    <div className="flex flex-col items-center gap-4">
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
                    <button
                      onClick={openConnectModal}
                      className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-mono hover:bg-primary/90"
                    >
                      Connect Wallet
                    </button>
                  )
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      className="bg-destructive text-destructive-foreground px-6 py-3 rounded-lg font-mono"
                    >
                      Wrong Network
                    </button>
                  )
                }

                return (
                  <div className="flex gap-2">
                    <button
                      onClick={openChainModal}
                      className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-mono text-sm"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 12,
                            height: 12,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: 12, height: 12 }}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </button>

                    <button
                      onClick={openAccountModal}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-mono text-sm"
                    >
                      {account.displayName}
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ''}
                    </button>
                  </div>
                )
              })()}
            </div>
          )
        }}
      </ConnectButton.Custom>
      
      {/* Network Status */}
      {isConnected && chainId !== hyperEVM.id && (
        <div className="text-sm text-destructive text-center">
          ⚠️ Please switch to HyperEVM network to mint Omamori
        </div>
      )}
    </div>
  )
}
```

---

### **Option B: Custom Multi-Wallet Implementation**

#### **🔧 Manual Wallet Detection**
```typescript
// src/lib/wallets.ts
export interface WalletInfo {
  name: string
  icon: string
  installed: boolean
  connector: () => Promise<any>
}

export function detectWallets(): WalletInfo[] {
  const wallets: WalletInfo[] = []
  
  // MetaMask
  if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
    wallets.push({
      name: 'MetaMask',
      icon: '/icons/metamask.svg',
      installed: true,
      connector: () => connectMetaMask()
    })
  }
  
  // Rabby
  if (typeof window !== 'undefined' && window.ethereum?.isRabby) {
    wallets.push({
      name: 'Rabby',
      icon: '/icons/rabby.svg', 
      installed: true,
      connector: () => connectRabby()
    })
  }
  
  // Rainbow (via WalletConnect)
  wallets.push({
    name: 'Rainbow',
    icon: '/icons/rainbow.svg',
    installed: true, // Always available via WalletConnect
    connector: () => connectWalletConnect()
  })
  
  return wallets
}

async function connectMetaMask() {
  if (!window.ethereum?.isMetaMask) {
    throw new Error('MetaMask not installed')
  }
  
  // Request account access
  await window.ethereum.request({ method: 'eth_requestAccounts' })
  
  // Add/switch to HyperEVM
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x3e7' }], // 999 in hex
    })
  } catch (switchError: any) {
    // Chain not added, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x3e7',
          chainName: 'HyperEVM',
          rpcUrls: ['https://rpc.hyperliquid.xyz/evm'],
          nativeCurrency: {
            name: 'HYPE',
            symbol: 'HYPE',
            decimals: 18
          },
          blockExplorerUrls: ['https://hyperliquid.cloud.blockscout.com/']
        }]
      })
    }
  }
}
```

---

## 🎨 **USER EXPERIENCE DESIGN**

### **🔗 Wallet Selection Modal**
```typescript
// src/components/WalletSelectionModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { detectWallets } from '@/lib/wallets'

interface WalletSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WalletSelectionModal({ open, onOpenChange }: WalletSelectionModalProps) {
  const wallets = detectWallets()
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl">Connect Wallet</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <Button
              key={wallet.name}
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => wallet.connector()}
            >
              <img src={wallet.icon} alt={wallet.name} className="w-6 h-6" />
              <span className="font-mono">{wallet.name}</span>
              {!wallet.installed && (
                <span className="ml-auto text-xs text-muted-foreground">
                  Not Installed
                </span>
              )}
            </Button>
          ))}
          
          {/* Installation Help */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Don't have a wallet?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" size="sm" asChild>
                <a href="https://metamask.io" target="_blank" className="font-mono">
                  Get MetaMask
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="https://rabby.io" target="_blank" className="font-mono">
                  Get Rabby
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### **🔄 Network Switching Helper**
```typescript
// src/components/NetworkSwitcher.tsx
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useChainId, useSwitchChain } from 'wagmi'
import { hyperEVM } from '@/lib/wagmi'

export function NetworkSwitcher() {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  
  if (chainId === hyperEVM.id) return null
  
  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertDescription className="flex items-center justify-between">
        <span className="font-mono text-sm">
          Please switch to HyperEVM network to continue
        </span>
        <Button 
          size="sm" 
          onClick={() => switchChain({ chainId: hyperEVM.id })}
          className="font-mono"
        >
          Switch Network
        </Button>
      </AlertDescription>
    </Alert>
  )
}
```

---

## 📱 **MOBILE WALLET SUPPORT**

### **📲 WalletConnect Integration**
```typescript
// src/lib/walletconnect.ts
import { createWalletClient, custom } from 'viem'
import { WalletConnectModal } from '@walletconnect/modal'

const modal = new WalletConnectModal({
  projectId: 'YOUR_PROJECT_ID',
  chains: [hyperEVM]
})

export async function connectWalletConnect() {
  const { uri } = await modal.openModal()
  
  // Mobile wallets that support HyperEVM:
  // - Gem Wallet
  // - Leap Wallet  
  // - MetaMask Mobile
  // - Rainbow Mobile
  
  return uri
}
```

---

## 🎯 **IMPLEMENTATION PRIORITY**

### **Phase 1: Core Wallets (Week 1)**
1. ✅ **MetaMask** - Most popular, requires network addition
2. ✅ **Rabby** - Native HyperEVM support, growing adoption
3. ✅ **RainbowKit Setup** - Beautiful UI framework

### **Phase 2: Enhanced Support (Week 2)**  
4. ✅ **Rainbow Wallet** - Popular among DeFi users
5. ✅ **WalletConnect** - Mobile wallet support
6. ✅ **Network Auto-switching** - Seamless UX

### **Phase 3: Advanced Features (Week 3)**
7. ✅ **Leap Wallet** - Multi-chain users
8. ✅ **Gem Wallet** - Mobile-first users
9. ✅ **Error Handling** - Comprehensive user guidance

---

## 🏆 **RECOMMENDED APPROACH**

### **🌈 Use RainbowKit + Wagmi**

**Why this is the best choice:**
1. **Battle-tested** - Used by top DeFi protocols
2. **Beautiful UI** - Professional wallet selection modal
3. **Multi-wallet support** - MetaMask, Rabby, Rainbow, WalletConnect
4. **Custom chains** - Perfect for HyperEVM integration
5. **Mobile support** - WalletConnect for mobile wallets
6. **Automatic network switching** - Seamless user experience
7. **TypeScript support** - Type-safe contract interactions

### **📋 Implementation Steps**
1. **Install RainbowKit + Wagmi**
2. **Configure HyperEVM chain**
3. **Set up wallet connectors** (MetaMask, Rabby, Rainbow)
4. **Replace mock WalletStatus component**
5. **Add network switching logic**
6. **Test with all supported wallets**

### **🎯 Expected Result**
- **One-click connection** for MetaMask, Rabby, Rainbow
- **Automatic network addition** for HyperEVM
- **Beautiful wallet selection UI**
- **Mobile wallet support** via WalletConnect
- **Seamless network switching**
- **Professional user experience**

**This approach will give hyper.faith the most comprehensive and user-friendly wallet integration for HyperEVM!** 🔗✨🎨
