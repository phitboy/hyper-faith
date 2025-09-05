# Frontend Integration Guide

This guide covers integrating the deployed Omamori contracts with the live frontend at https://hyper.faith.

## Overview

The frontend integration involves:
1. Replacing mock functions with real contract calls
2. Adding proper wallet connection for HyperEVM
3. Implementing HYPE token approval flow
4. Handling both ERC-20 and native burn modes
5. Displaying real NFT data and SVGs

## Quick Integration Steps

### 1. Install Dependencies

Add the contract integration package to your frontend:

```bash
npm install @hyper-faith/contracts wagmi viem
```

### 2. Update Wagmi Configuration

Replace your current wagmi config with HyperEVM support:

```typescript
// src/lib/wagmi.ts
import { createConfig, configureChains } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'
import { HYPERLIQUID_CHAIN } from '@hyper-faith/contracts'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [HYPERLIQUID_CHAIN],
  [publicProvider()]
)

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: 'your-walletconnect-project-id',
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

export { chains }
```

### 3. Replace Mock Functions

Update `src/lib/contracts/omamori.ts`:

```typescript
// Replace the entire file content with:
export {
  useMintOmamori,
  useTokenData,
  useTokenURI,
  useMaterial,
  useAllMaterials,
  useContractInfo,
  useApproveHype,
  useHypeAllowance,
  formatHype,
  parseHype,
  validateBurnAmount,
  decodeTokenURI,
  getMajorName,
  getMinorName,
  getTierColor,
  getRarityPercentage,
  CONTRACT_ADDRESSES,
  MIN_HYPE_BURN,
  BURN_ADDRESS,
  BurnMode,
  type TokenData,
  type MaterialView
} from '@hyper-faith/contracts'

// Legacy mock functions for backward compatibility
export const mintOmamoriMock = () => {
  throw new Error('Use useMintOmamori hook instead')
}

export const getMyOmamoriMock = () => {
  throw new Error('Use useMyOmamori hook instead')
}

export const getOmamoriByIdMock = () => {
  throw new Error('Use useTokenData and useTokenURI hooks instead')
}
```

### 4. Update Minting Component

Replace the minting logic in `src/pages/Mint.tsx`:

```typescript
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { 
  useMintOmamori, 
  useApproveHype, 
  useHypeAllowance,
  useContractInfo,
  parseHype,
  validateBurnAmount,
  formatHype
} from '@hyper-faith/contracts'

// Add to your existing Mint component:
function MintingLogic() {
  const { address } = useAccount()
  const [burnAmount, setBurnAmount] = useState('0.01')
  const [isApproving, setIsApproving] = useState(false)
  
  const { isERC20Mode, minBurn } = useContractInfo()
  const { mint, isLoading: isMinting, isSuccess } = useMintOmamori()
  const { approve } = useApproveHype(HYPE_TOKEN_ADDRESS) // Set this constant
  const { allowance } = useHypeAllowance(HYPE_TOKEN_ADDRESS, address)
  
  const burnAmountWei = parseHype(burnAmount)
  const { isValid, error } = validateBurnAmount(burnAmountWei)
  const needsApproval = isERC20Mode && BigInt(allowance || '0') < BigInt(burnAmountWei)
  
  const handleMint = async () => {
    if (!address) return
    
    try {
      if (needsApproval) {
        setIsApproving(true)
        await approve(burnAmountWei)
        setIsApproving(false)
      } else {
        mint(majorId, minorId, burnAmountWei, isERC20Mode ? undefined : burnAmount)
      }
    } catch (error) {
      console.error('Minting failed:', error)
      setIsApproving(false)
    }
  }
  
  return (
    <div>
      <input 
        type="number"
        value={burnAmount}
        onChange={(e) => setBurnAmount(e.target.value)}
        placeholder="HYPE to burn"
        min="0.01"
        step="0.01"
      />
      {error && <p className="error">{error}</p>}
      
      <button 
        onClick={handleMint}
        disabled={!isValid || isMinting || isApproving || !address}
      >
        {!address ? 'Connect Wallet' :
         isApproving ? 'Approving HYPE...' :
         isMinting ? 'Minting...' :
         needsApproval ? `Approve ${formatHype(burnAmountWei)}` :
         'Mint Omamori'}
      </button>
      
      {isSuccess && (
        <div className="success">
          ✅ Omamori minted successfully!
        </div>
      )}
    </div>
  )
}
```

### 5. Update Token Display

Replace token display logic in `src/pages/MyOmamori.tsx`:

```typescript
import { useAccount } from 'wagmi'
import { 
  useTokenData, 
  useTokenURI, 
  decodeTokenURI,
  getMajorName,
  getMinorName,
  formatHype
} from '@hyper-faith/contracts'

function TokenCard({ tokenId }: { tokenId: number }) {
  const { data: tokenData, isLoading: dataLoading } = useTokenData(tokenId)
  const { uri, isLoading: uriLoading } = useTokenURI(tokenId)
  
  if (dataLoading || uriLoading) {
    return <div className="loading">Loading token #{tokenId}...</div>
  }
  
  if (!tokenData || !uri) {
    return <div className="error">Failed to load token #{tokenId}</div>
  }
  
  const decoded = decodeTokenURI(uri)
  const majorName = getMajorName(tokenData.majorId)
  const minorName = getMinorName(tokenData.majorId, tokenData.minorId)
  
  return (
    <div className="token-card">
      <h3>Omamori #{tokenId}</h3>
      
      {decoded && (
        <div className="token-image">
          <div dangerouslySetInnerHTML={{ __html: decoded.svg }} />
        </div>
      )}
      
      <div className="token-details">
        <p><strong>Major:</strong> {majorName}</p>
        <p><strong>Minor:</strong> {minorName}</p>
        <p><strong>Material:</strong> {decoded?.metadata.attributes.find(a => a.trait_type === 'Material')?.value}</p>
        <p><strong>Punches:</strong> {tokenData.punchCount}</p>
        <p><strong>HYPE Burned:</strong> {formatHype(tokenData.hypeBurned)}</p>
      </div>
    </div>
  )
}
```

### 6. Add Wallet Connection

Update your wallet connection component:

```typescript
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useEffect } from 'react'

function WalletConnection() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isLoading, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()
  
  // Check if connected to correct chain
  const isCorrectChain = chain?.id === 999
  
  if (isConnected && address) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <span className="address">{address.slice(0, 6)}...{address.slice(-4)}</span>
          {!isCorrectChain && (
            <span className="wrong-chain">⚠️ Switch to HyperEVM</span>
          )}
        </div>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    )
  }
  
  return (
    <div className="wallet-connection">
      <h3>Connect Wallet</h3>
      <p>Connect to HyperEVM to mint Omamori NFTs</p>
      
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          disabled={!connector.ready || isLoading}
        >
          {connector.name}
          {isLoading && connector.id === pendingConnector?.id && ' (connecting)'}
        </button>
      ))}
    </div>
  )
}
```

### 7. Environment Configuration

Add environment variables for contract addresses:

```bash
# .env.local
NEXT_PUBLIC_MATERIALS_ADDRESS=0x... # Update after deployment
NEXT_PUBLIC_RENDER_ADDRESS=0x...    # Update after deployment  
NEXT_PUBLIC_NFT_ADDRESS=0x...       # Update after deployment
NEXT_PUBLIC_HYPE_TOKEN_ADDRESS=0x... # HYPE token address (if ERC-20 mode)
```

Use in your app:

```typescript
// src/lib/constants.ts
export const CONTRACT_ADDRESSES = {
  materials: process.env.NEXT_PUBLIC_MATERIALS_ADDRESS as `0x${string}`,
  render: process.env.NEXT_PUBLIC_RENDER_ADDRESS as `0x${string}`,
  nft: process.env.NEXT_PUBLIC_NFT_ADDRESS as `0x${string}`,
}

export const HYPE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_HYPE_TOKEN_ADDRESS as `0x${string}`
```

## Advanced Integration

### Error Handling

```typescript
import { useContractWrite } from 'wagmi'

function MintWithErrorHandling() {
  const { mint, error } = useMintOmamori()
  
  const getErrorMessage = (error: any) => {
    if (error?.message?.includes('Insufficient HYPE burn')) {
      return 'Burn amount too low. Minimum is 0.01 HYPE.'
    }
    if (error?.message?.includes('Invalid major ID')) {
      return 'Invalid major glyph selection.'
    }
    if (error?.message?.includes('Insufficient allowance')) {
      return 'Please approve HYPE spending first.'
    }
    return 'Transaction failed. Please try again.'
  }
  
  return (
    <div>
      {error && (
        <div className="error">
          {getErrorMessage(error)}
        </div>
      )}
      {/* Mint UI */}
    </div>
  )
}
```

### Loading States

```typescript
function MintingFlow() {
  const [step, setStep] = useState<'idle' | 'approving' | 'minting' | 'success'>('idle')
  
  const steps = {
    idle: 'Ready to mint',
    approving: 'Approving HYPE...',
    minting: 'Minting Omamori...',
    success: 'Minted successfully!'
  }
  
  return (
    <div className="minting-flow">
      <div className="progress">
        <span className={step === 'idle' ? 'active' : 'completed'}>1. Setup</span>
        <span className={step === 'approving' ? 'active' : step === 'minting' || step === 'success' ? 'completed' : ''}>2. Approve</span>
        <span className={step === 'minting' ? 'active' : step === 'success' ? 'completed' : ''}>3. Mint</span>
        <span className={step === 'success' ? 'active' : ''}>4. Complete</span>
      </div>
      
      <p>{steps[step]}</p>
      
      {/* Mint UI with step management */}
    </div>
  )
}
```

### Gas Estimation

```typescript
import { useEstimateGas } from 'wagmi'

function GasEstimation({ majorId, minorId, burnAmount }) {
  const { data: gasEstimate } = useEstimateGas({
    to: CONTRACT_ADDRESSES.nft,
    data: encodeFunctionData({
      abi: OmamoriNFTABI,
      functionName: 'mint',
      args: [majorId, minorId, burnAmount]
    })
  })
  
  return (
    <div className="gas-estimate">
      Estimated gas: {gasEstimate ? formatUnits(gasEstimate, 'gwei') : '~170k'} HYPE
    </div>
  )
}
```

## Testing Integration

### Local Testing

1. Deploy contracts to local Anvil:
```bash
anvil --chain-id 999
forge script scripts/Deploy.s.sol:Deploy --sig "deployLocal()" --rpc-url http://localhost:8545 --broadcast
```

2. Update contract addresses:
```bash
node scripts/update-addresses.js 0x... 0x... 0x...
```

3. Test frontend with local contracts

### Mainnet Integration

1. Deploy to HyperEVM mainnet
2. Update addresses in production environment
3. Test with small amounts first
4. Monitor for any issues

## Troubleshooting

### Common Issues

1. **"Chain not supported"**
   - Ensure HyperEVM is added to wagmi config
   - Check wallet has HyperEVM network added

2. **"Insufficient funds"**
   - User needs HYPE for gas + burn amount
   - Check both native HYPE and ERC-20 HYPE balances

3. **"Transaction reverted"**
   - Check burn amount meets minimum (0.01 HYPE)
   - Verify major/minor ID ranges (0-11, 0-3)
   - Ensure proper approvals for ERC-20 mode

4. **"Contract not found"**
   - Verify contract addresses are correct
   - Check deployment was successful

### Debug Tools

```typescript
// Add debug info to your components
function DebugInfo() {
  const { address, chain } = useAccount()
  const { totalSupply, burnMode } = useContractInfo()
  
  return (
    <details className="debug-info">
      <summary>Debug Info</summary>
      <pre>{JSON.stringify({
        address,
        chainId: chain?.id,
        totalSupply,
        burnMode,
        contractAddresses: CONTRACT_ADDRESSES
      }, null, 2)}</pre>
    </details>
  )
}
```

## Performance Optimization

### Caching

```typescript
// Use React Query for caching
import { useQuery } from '@tanstack/react-query'

function useTokenDataCached(tokenId: number) {
  return useQuery({
    queryKey: ['tokenData', tokenId],
    queryFn: () => useTokenData(tokenId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

### Batch Requests

```typescript
// Use multicall for batch requests
import { useContractReads } from 'wagmi'

function useBatchTokenData(tokenIds: number[]) {
  const contracts = tokenIds.map(id => ({
    address: CONTRACT_ADDRESSES.nft,
    abi: OmamoriNFTABI,
    functionName: 'getTokenData',
    args: [id]
  }))
  
  return useContractReads({ contracts })
}
```

This integration guide provides everything needed to connect the deployed contracts with the live frontend at https://hyper.faith. The modular approach allows for gradual migration from mock functions to real contract interactions.
