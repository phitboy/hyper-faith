# Hyper Faith Omamori - Integration Architecture

## Overview

This document maps the complete integration between smart contracts and frontend components in the Hyper Faith Omamori monorepo.

## Repository Structure

```
hyper-faith-mint/
├── 🎨 Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/          # UI Components
│   │   ├── pages/              # Page Components  
│   │   ├── lib/                # Contract Integration
│   │   ├── data/               # Static Data (mirrors contract data)
│   │   └── store/              # State Management
│   └── package.json
│
├── 🔗 Smart Contracts (Solidity)
│   ├── contracts/              # Core Contracts
│   ├── libraries/              # Utility Libraries
│   ├── interfaces/             # Contract Interfaces
│   ├── test/                   # Contract Tests
│   └── scripts/                # Deployment Scripts
│
├── 🛠️ Integration Layer
│   ├── frontend-integration/   # TypeScript Package
│   ├── abis/                   # Generated ABIs
│   └── wagmi.config.ts         # Type Generation
│
└── 📚 Documentation
    ├── AUDIT_PREPARATION.md
    ├── DEPLOYMENT.md
    └── PRODUCTION_DEPLOYMENT.md
```

## Smart Contract → Frontend Integration Map

### 1. MaterialRegistryPalette.sol ↔ Frontend Components

**Smart Contract Functions:**
- `viewMaterial(uint16 id)` → Material data (name, tier, colors)
- `weight(uint16 id)` → Material rarity weight
- `totalWeight()` → Total weight for distribution
- `getAllWeights()` → All material weights array

**Frontend Integration:**
```typescript
// src/data/materials.json (Static Mirror)
// src/data/materialsPalette.json (UI Colors)
// src/lib/utils/materialPicker.ts (Selection Logic)
```

**Connected Components:**
- `src/components/TraitTable.tsx` - Displays material rarities
- `src/components/OmamoriPreview.tsx` - Shows material colors
- `src/pages/Explore.tsx` - Material filtering and display
- `src/pages/TokenDetail.tsx` - Individual token material info

**Integration Points:**
```typescript
// Real contract call (post-deployment)
const material = await materialContract.viewMaterial(materialId)

// Current mock (pre-deployment)  
const material = materialsData[materialId]
```

### 2. OmamoriGlyphs.sol ↔ Frontend Components

**Smart Contract Functions:**
- `renderMajor(uint8 majorId)` → SVG string for major glyph
- `renderMinor(uint8 majorId, uint8 minorId)` → SVG string for minor glyph

**Frontend Integration:**
```typescript
// src/data/majors.json (Static Mirror)
// src/lib/renderer/omamoriSvg.ts (TypeScript Mirror)
```

**Connected Components:**
- `src/components/MajorMinorPicker.tsx` - Glyph selection UI
- `src/components/OmamoriPreview.tsx` - Live glyph rendering
- `src/pages/Mint.tsx` - Glyph selection for minting
- `src/pages/TokenDetail.tsx` - Display minted glyph combinations

**Integration Points:**
```typescript
// Real contract call (post-deployment)
const majorSvg = await glyphsLibrary.renderMajor(majorId)
const minorSvg = await glyphsLibrary.renderMinor(majorId, minorId)

// Current TypeScript mirror (pre-deployment)
const majorSvg = renderMajorGlyph(majorId)
const minorSvg = renderMinorGlyph(majorId, minorId)
```

### 3. PunchLayout.sol ↔ Frontend Components

**Smart Contract Functions:**
- `transformSlots(uint64 seed, uint8 punchCount)` → Transformed punch coordinates
- `getBaseSlots()` → Base diamond punch pattern
- `checkOverlap()` → Collision detection logic

**Frontend Integration:**
```typescript
// src/lib/renderer/omamoriSvg.ts (TypeScript Mirror)
// transformSlots() function mirrors contract logic
```

**Connected Components:**
- `src/components/OmamoriPreview.tsx` - Punch visualization
- `src/pages/TokenDetail.tsx` - Display actual punch patterns
- `src/pages/Debug.tsx` - Punch pattern testing and visualization

**Integration Points:**
```typescript
// Real contract call (post-deployment)
const [transformedX, transformedY] = await punchLayout.transformSlots(seed, punchCount)

// Current TypeScript mirror (pre-deployment)
const [transformedX, transformedY] = transformSlots(seed, punchCount)
```

### 4. OmamoriRender.sol ↔ Frontend Components

**Smart Contract Functions:**
- `tokenURIView(tokenId, majorId, minorId, materialId, punchCount, seed, hypeBurned)` → Complete token metadata + SVG

**Frontend Integration:**
```typescript
// src/lib/renderer/omamoriSvg.ts (Complete TypeScript Mirror)
// renderOmamoriSVG() function mirrors contract logic
```

**Connected Components:**
- `src/components/OmamoriPreview.tsx` - Live preview during minting
- `src/pages/TokenDetail.tsx` - Display minted NFT
- `src/pages/MyOmamori.tsx` - User's NFT collection
- `src/pages/Explore.tsx` - Browse all NFTs

**Integration Points:**
```typescript
// Real contract call (post-deployment)
const tokenURI = await renderContract.tokenURIView(tokenId, majorId, minorId, materialId, punchCount, seed, hypeBurned)
const metadata = JSON.parse(atob(tokenURI.split(',')[1]))

// Current TypeScript mirror (pre-deployment)
const svgString = renderOmamoriSVG(tokenData)
const metadata = generateMetadata(tokenData)
```

### 5. OmamoriNFT.sol ↔ Frontend Components

**Smart Contract Functions:**
- `mint(uint8 majorId, uint8 minorId, uint256 amountToBurn)` → Mint new NFT
- `tokenURI(uint256 tokenId)` → Get token metadata
- `getTokenData(uint256 tokenId)` → Get token traits
- `totalSupply()` → Total minted count
- `burnMode()` → Current burn mode (ERC-20 vs Native)
- `setBurnMode()` → Owner function to switch modes

**Frontend Integration:**
```typescript
// src/lib/contracts/omamori.ts (Contract Interface)
// src/store/omamoriStore.ts (State Management)
```

**Connected Components:**
- `src/pages/Mint.tsx` - **PRIMARY MINTING INTERFACE**
  - Glyph selection (majorId, minorId)
  - HYPE burn amount input
  - Mint transaction execution
  - Success/error handling
  
- `src/components/HypeInput.tsx` - HYPE burn amount input
- `src/components/WalletStatus.tsx` - Wallet connection and HYPE balance
- `src/pages/MyOmamori.tsx` - User's minted NFTs
- `src/pages/Explore.tsx` - All minted NFTs
- `src/pages/TokenDetail.tsx` - Individual NFT details

**Integration Points:**
```typescript
// Real contract calls (post-deployment)
const tx = await nftContract.mint(majorId, minorId, burnAmount, { value: nativeAmount })
const tokenData = await nftContract.getTokenData(tokenId)
const tokenURI = await nftContract.tokenURI(tokenId)
const totalSupply = await nftContract.totalSupply()

// Current mocks (pre-deployment)
const result = await mintOmamoriMock(majorId, minorId, burnAmount)
const tokens = await getMyOmamoriMock(address)
```

## Critical Integration Points

### 1. Minting Flow (src/pages/Mint.tsx)

**Complete Flow:**
```typescript
// 1. User selects glyphs
const [majorId, setMajorId] = useState(0)
const [minorId, setMinorId] = useState(0)

// 2. User inputs HYPE burn amount  
const [burnAmount, setBurnAmount] = useState('0.01')

// 3. Preview generation (TypeScript mirror)
const previewData = {
  majorId, minorId,
  materialId: 0, // Preview with common material
  punchCount: 5, // Preview punch count
  seed: '0x1234', // Preview seed
  hypeBurned: parseEther(burnAmount)
}
const previewSvg = renderOmamoriSVG(previewData)

// 4. Mint transaction (real contract)
const tx = await nftContract.mint(majorId, minorId, parseEther(burnAmount))

// 5. Get minted token data
const tokenId = await getTokenIdFromTx(tx)
const tokenData = await nftContract.getTokenData(tokenId)
const finalSvg = await nftContract.tokenURI(tokenId)
```

### 2. Token Display (src/pages/TokenDetail.tsx)

**Complete Flow:**
```typescript
// 1. Get token data from contract
const tokenData = await nftContract.getTokenData(tokenId)
const tokenURI = await nftContract.tokenURI(tokenId)

// 2. Parse metadata
const metadata = JSON.parse(atob(tokenURI.split(',')[1]))
const svgData = atob(metadata.image.split(',')[1])

// 3. Display components
<TokenTraits data={tokenData} />
<TokenSVG svg={svgData} />
<TokenMetadata metadata={metadata} />
```

### 3. Collection View (src/pages/MyOmamori.tsx)

**Complete Flow:**
```typescript
// 1. Get user's token count
const balance = await nftContract.balanceOf(userAddress)

// 2. Get all token IDs (requires enumeration)
const tokenIds = []
for (let i = 0; i < balance; i++) {
  const tokenId = await nftContract.tokenOfOwnerByIndex(userAddress, i)
  tokenIds.push(tokenId)
}

// 3. Get token data for each
const tokens = await Promise.all(
  tokenIds.map(async (tokenId) => {
    const data = await nftContract.getTokenData(tokenId)
    const uri = await nftContract.tokenURI(tokenId)
    return { tokenId, data, uri }
  })
)
```

## State Management Integration

### Zustand Store (src/store/omamoriStore.ts)

**Contract State:**
```typescript
interface OmamoriStore {
  // Contract instances
  nftContract: Contract | null
  materialContract: Contract | null
  renderContract: Contract | null
  
  // User state
  userAddress: string | null
  userBalance: string
  userTokens: TokenData[]
  
  // Contract state
  totalSupply: number
  burnMode: BurnMode
  minBurnAmount: string
  
  // Actions
  connectWallet: () => Promise<void>
  mint: (majorId: number, minorId: number, burnAmount: string) => Promise<string>
  refreshUserTokens: () => Promise<void>
  refreshContractState: () => Promise<void>
}
```

## Deployment Integration Strategy

### Phase 1: Pre-Deployment (Current)
- Frontend uses TypeScript mirrors and mock data
- All UI components functional with preview data
- State management ready for contract integration

### Phase 2: Contract Deployment
- Deploy contracts to HyperEVM mainnet
- Update contract addresses in frontend
- Replace mocks with real contract calls

### Phase 3: Integration Testing
- Test all contract interactions
- Verify SVG generation matches between contract and TypeScript
- Validate state management with real data

### Phase 4: Production Launch
- Frontend fully integrated with deployed contracts
- Real minting, token display, and collection management
- Monitoring and error handling

## Environment Configuration

### Development (.env.local)
```bash
NEXT_PUBLIC_CHAIN_ID=999
NEXT_PUBLIC_RPC_URL=https://rpc.hyperliquid.xyz/evm
NEXT_PUBLIC_NFT_CONTRACT=0x... # After deployment
NEXT_PUBLIC_MATERIALS_CONTRACT=0x... # After deployment  
NEXT_PUBLIC_RENDER_CONTRACT=0x... # After deployment
```

### Contract Integration (src/lib/contracts/config.ts)
```typescript
export const CONTRACTS = {
  999: { // HyperEVM
    NFT: process.env.NEXT_PUBLIC_NFT_CONTRACT,
    MATERIALS: process.env.NEXT_PUBLIC_MATERIALS_CONTRACT,
    RENDER: process.env.NEXT_PUBLIC_RENDER_CONTRACT,
  }
}
```

## Testing Strategy

### Contract Tests (Foundry)
- 56 comprehensive tests covering all contract functionality
- Gas optimization and security validation
- Statistical distribution testing

### Frontend Tests (Jest/Vitest)
- Component rendering with mock data
- State management logic
- Contract integration mocks
- SVG generation accuracy

### Integration Tests (E2E)
- Full minting flow with real contracts
- Token display and metadata parsing
- Wallet connection and transaction handling
- Error scenarios and edge cases

## Monitoring & Analytics

### Contract Events
```typescript
// Listen for minting events
nftContract.on('OmamoriMinted', (tokenId, owner, majorId, minorId, materialId, punchCount, seed, hypeBurned) => {
  // Update UI state
  // Track analytics
  // Refresh user tokens
})
```

### Frontend Analytics
- Minting success/failure rates
- Popular glyph combinations
- Material distribution accuracy
- User engagement metrics

This architecture ensures seamless integration between the smart contracts and frontend, with clear separation of concerns and robust error handling throughout the system.
