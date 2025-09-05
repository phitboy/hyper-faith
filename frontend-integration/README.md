# Hyper Faith Omamori - Frontend Integration

This package provides TypeScript types, React hooks, and utilities for integrating with the Hyper Faith Omamori NFT contracts.

## Installation

```bash
npm install @hyper-faith/contracts
# or
yarn add @hyper-faith/contracts
```

## Quick Start

### 1. Setup Wagmi Client

```typescript
import { createConfig, configureChains } from 'wagmi'
import { HYPERLIQUID_CHAIN } from '@hyper-faith/contracts'

const { chains, publicClient } = configureChains(
  [HYPERLIQUID_CHAIN],
  [/* your providers */]
)

const config = createConfig({
  autoConnect: true,
  publicClient,
})
```

### 2. Mint an Omamori

```typescript
import { useMintOmamori, parseHype } from '@hyper-faith/contracts'

function MintButton() {
  const { mint, isLoading, isSuccess } = useMintOmamori()
  
  const handleMint = () => {
    // Mint Liquidity + Fills with 1 HYPE burn
    mint(0, 0, parseHype('1'))
  }
  
  return (
    <button onClick={handleMint} disabled={isLoading}>
      {isLoading ? 'Minting...' : 'Mint Omamori'}
    </button>
  )
}
```

### 3. Display Token Data

```typescript
import { useTokenData, useTokenURI, getMajorName, getMinorName } from '@hyper-faith/contracts'

function TokenDisplay({ tokenId }: { tokenId: number }) {
  const { data: tokenData } = useTokenData(tokenId)
  const { uri } = useTokenURI(tokenId)
  
  if (!tokenData) return <div>Loading...</div>
  
  return (
    <div>
      <h3>Omamori #{tokenId}</h3>
      <p>Major: {getMajorName(tokenData.majorId)}</p>
      <p>Minor: {getMinorName(tokenData.majorId, tokenData.minorId)}</p>
      <p>Punches: {tokenData.punchCount}</p>
      {uri && <img src={uri} alt={`Omamori #${tokenId}`} />}
    </div>
  )
}
```

## API Reference

### Hooks

#### `useMintOmamori()`
Hook for minting new Omamori NFTs.

```typescript
const { mint, isLoading, isSuccess, data } = useMintOmamori()

// For ERC-20 mode (requires prior approval)
mint(majorId, minorId, burnAmount)

// For native mode
mint(majorId, minorId, burnAmount, nativeValue)
```

#### `useTokenData(tokenId)`
Get token data for a specific NFT.

```typescript
const { data, isLoading, error } = useTokenData(tokenId)
// data: { majorId, minorId, materialId, punchCount, seed, hypeBurned }
```

#### `useTokenURI(tokenId)`
Get the complete token URI (base64 JSON with embedded SVG).

```typescript
const { uri, isLoading, error } = useTokenURI(tokenId)
```

#### `useMaterial(materialId)`
Get material data by ID.

```typescript
const { material, isLoading, error } = useMaterial(materialId)
// material: { name, tierName, bg, stroke }
```

#### `useContractInfo()`
Get general contract information.

```typescript
const { totalSupply, burnMode, minBurn, isERC20Mode, isNativeMode } = useContractInfo()
```

#### `useApproveHype(hypeTokenAddress)`
Approve HYPE token spending (for ERC-20 burn mode).

```typescript
const { approve, isLoading, isSuccess } = useApproveHype(hypeTokenAddress)
approve(amount) // amount in wei
```

### Utilities

#### `formatHype(amount: string | bigint): string`
Format wei amount to human-readable HYPE.

```typescript
formatHype('1000000000000000000') // "1 HYPE"
formatHype('10000000000000000') // "0.01 HYPE"
```

#### `parseHype(amount: string): string`
Parse human-readable HYPE to wei.

```typescript
parseHype('1') // "1000000000000000000"
parseHype('0.01') // "10000000000000000"
```

#### `validateBurnAmount(amount: string)`
Validate burn amount meets minimum requirements.

```typescript
const { isValid, error } = validateBurnAmount(amount)
```

#### `decodeTokenURI(uri: string)`
Decode base64 token URI to get metadata and SVG.

```typescript
const result = decodeTokenURI(tokenUri)
if (result) {
  const { metadata, svg } = result
  // Use metadata.attributes, svg content, etc.
}
```

#### `getMajorName(majorId: number): string`
Get major glyph name by ID.

#### `getMinorName(majorId: number, minorId: number): string`
Get minor glyph name by IDs.

#### `getTierColor(tierName: string): string`
Get UI color for material tier.

#### `getRarityPercentage(tierName: string): string`
Get rarity percentage for display.

### Constants

```typescript
import { 
  CONTRACT_ADDRESSES,
  HYPERLIQUID_CHAIN,
  MIN_HYPE_BURN,
  BURN_ADDRESS,
  BurnMode
} from '@hyper-faith/contracts'
```

### Types

```typescript
interface TokenData {
  majorId: number
  minorId: number
  materialId: number
  punchCount: number
  seed: string
  hypeBurned: string
}

interface MaterialView {
  name: string
  tierName: string
  bg: string
  stroke: string
}

enum BurnMode {
  ERC20 = 0,
  NATIVE = 1
}
```

## Contract Addresses

Update these addresses after deployment:

```typescript
export const CONTRACT_ADDRESSES = {
  999: { // HyperEVM
    MaterialRegistryPalette: '0x...', // Update after deployment
    OmamoriRender: '0x...', // Update after deployment
    OmamoriNFT: '0x...', // Update after deployment
  }
}
```

## Development

### Generate Types

After updating contract addresses:

```bash
npm run generate
```

This runs `wagmi generate` to create TypeScript types from the contract ABIs.

### Build Package

```bash
npm run build
```

## Examples

### Complete Minting Flow

```typescript
import { 
  useMintOmamori, 
  useApproveHype, 
  useHypeAllowance,
  useContractInfo,
  parseHype,
  validateBurnAmount,
  MIN_HYPE_BURN
} from '@hyper-faith/contracts'

function MintingFlow() {
  const [burnAmount, setBurnAmount] = useState('0.01')
  const [majorId, setMajorId] = useState(0)
  const [minorId, setMinorId] = useState(0)
  
  const { isERC20Mode } = useContractInfo()
  const { mint, isLoading: isMinting } = useMintOmamori()
  const { approve, isLoading: isApproving } = useApproveHype(HYPE_TOKEN_ADDRESS)
  const { allowance } = useHypeAllowance(HYPE_TOKEN_ADDRESS, userAddress)
  
  const burnAmountWei = parseHype(burnAmount)
  const { isValid, error } = validateBurnAmount(burnAmountWei)
  const needsApproval = isERC20Mode && BigInt(allowance || '0') < BigInt(burnAmountWei)
  
  const handleMint = async () => {
    if (needsApproval) {
      await approve(burnAmountWei)
    } else {
      mint(majorId, minorId, burnAmountWei, isERC20Mode ? undefined : burnAmount)
    }
  }
  
  return (
    <div>
      <input 
        value={burnAmount} 
        onChange={(e) => setBurnAmount(e.target.value)}
        placeholder="HYPE to burn"
      />
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      <button 
        onClick={handleMint} 
        disabled={!isValid || isMinting || isApproving}
      >
        {isApproving ? 'Approving...' : 
         isMinting ? 'Minting...' : 
         needsApproval ? 'Approve HYPE' : 
         'Mint Omamori'}
      </button>
    </div>
  )
}
```

## Support

For issues and questions, please refer to the main repository documentation or create an issue.
