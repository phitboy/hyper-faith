# 🎯 **FRONTEND INTEGRATION MASTER PLAN**

## 📋 **PLANNER: Complete On-Chain Integration Strategy**

### **🔍 Current State Analysis**

#### **✅ Deployed Smart Contract System**
```
🏆 OmamoriNFTWithRoyalties: 0x95d7a58c9efC295362deF554761909Ebc42181b1
    ↓ delegates tokenURI to
🎨 SVGAssembler: 0xB42ac8659c9F661EB548C68e67F432cF5D2aa52c
    ↓ uses
🖼️ GlyphRenderer: 0x11Bb63863024444A5E4BB4d157aaDDc8441C8618
🥊 PunchRenderer: 0x72cFcB2e443b4D6AA341871C85Cbd390aE0Ab2Af
📦 MaterialRegistry: 0xA5D308DE0Be64df79C6715418070a090195A5657
```

#### **✅ Frontend Architecture**
- **Framework**: React + TypeScript + Vite
- **State**: Zustand store (`omamoriStore.ts`)
- **UI**: shadcn/ui components
- **Routing**: React Router (/, /my, /explore, /token/:id)
- **Mock System**: Complete mock implementation ready for replacement

---

## 🚀 **INTEGRATION ROADMAP**

### **Phase 1: Wallet Integration (Foundation)**

#### **🔗 Replace Mock Wallet with Real Web3**
**Current**: Mock connection in `WalletStatus.tsx`
```typescript
// Mock implementation
const mockAddress = '0x742d35Cc6bF4532C6D99f24F5e5b9eE5e9fB0A6D';
setWalletState(true, mockAddress, 1);
```

**Target**: Real HyperEVM connection
```typescript
// Real implementation with wagmi/viem
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { hyperEVM } from '@/lib/chains'

const { address, isConnected } = useAccount()
const { connect } = useConnect()
const { disconnect } = useDisconnect()
```

#### **📋 Required Changes**
1. **Install Dependencies**:
   ```bash
   npm install wagmi viem @tanstack/react-query
   ```

2. **Configure HyperEVM Chain**:
   ```typescript
   // src/lib/chains.ts
   export const hyperEVM = {
     id: 999,
     name: 'HyperEVM',
     network: 'hyperevm',
     nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
     rpcUrls: { default: { http: ['https://rpc.hyperliquid.xyz/evm'] } },
     blockExplorers: { default: { name: 'Hypurrscan', url: 'https://hypurrscan.io' } }
   }
   ```

3. **Update Store Integration**:
   ```typescript
   // Sync wagmi state with zustand store
   const { address, isConnected, chainId } = useAccount()
   useEffect(() => {
     setWalletState(isConnected, address, chainId)
   }, [isConnected, address, chainId])
   ```

---

### **Phase 2: Contract Integration (Core)**

#### **🔄 Replace Mock Contracts with Real ABIs**

**Current**: Mock functions in `src/lib/contracts/omamori.ts`
```typescript
export async function mintOmamoriMock(args: MintArgs): Promise<OmamoriToken>
export async function getMyOmamoriMock(address?: `0x${string}`): Promise<OmamoriToken[]>
```

**Target**: Real contract calls
```typescript
export async function mintOmamori(args: MintArgs): Promise<`0x${string}`>
export async function getMyOmamori(address: `0x${string}`): Promise<OmamoriToken[]>
export async function getTokenMetadata(tokenId: number): Promise<OmamoriToken>
```

#### **📋 Contract Integration Steps**

1. **Update addresses.json**:
   ```json
   {
     "999": {
       "OmamoriNFTWithRoyalties": "0x95d7a58c9efC295362deF554761909Ebc42181b1",
       "SVGAssembler": "0xB42ac8659c9F661EB548C68e67F432cF5D2aa52c",
       "GlyphRenderer": "0x11Bb63863024444A5E4BB4d157aaDDc8441C8618",
       "PunchRenderer": "0x72cFcB2e443b4D6AA341871C85Cbd390aE0Ab2Af",
       "MaterialRegistry": "0xA5D308DE0Be64df79C6715418070a090195A5657"
     }
   }
   ```

2. **Create Contract Hooks**:
   ```typescript
   // src/hooks/useOmamoriContract.ts
   export function useOmamoriContract() {
     return useContract({
       address: addresses[999].OmamoriNFTWithRoyalties,
       abi: OmamoriNFTWithRoyaltiesABI,
     })
   }
   
   export function useMintOmamori() {
     return useContractWrite({
       address: addresses[999].OmamoriNFTWithRoyalties,
       abi: OmamoriNFTWithRoyaltiesABI,
       functionName: 'mint',
     })
   }
   ```

3. **Real Minting Function**:
   ```typescript
   export async function mintOmamori(args: MintArgs): Promise<`0x${string}`> {
     const { write } = useMintOmamori()
     
     return write({
       value: BigInt(args.offeringHype), // HYPE amount in wei
     })
   }
   ```

---

### **Phase 3: Token Data Integration (Metadata)**

#### **🎨 Real TokenURI Fetching**

**Current**: Mock SVG generation in frontend
```typescript
token.imageSvg = renderOmamoriSVG(token);
```

**Target**: Fetch real tokenURI from contract
```typescript
// Get tokenURI from contract (returns base64 JSON)
const tokenURI = await contract.read.tokenURI([tokenId])
const metadata = JSON.parse(atob(tokenURI.split(',')[1]))
const token: OmamoriToken = {
  tokenId,
  imageSvg: atob(metadata.image.split(',')[1]), // Decode base64 SVG
  // ... other attributes from metadata.attributes
}
```

#### **📋 Token Data Flow**

1. **Mint Transaction**:
   ```typescript
   const tx = await mintOmamori({ offeringHype: weiAmount })
   const receipt = await waitForTransaction({ hash: tx })
   
   // Extract tokenId from mint event
   const mintEvent = receipt.logs.find(log => 
     log.topics[0] === keccak256('Transfer(address,address,uint256)')
   )
   const tokenId = parseInt(mintEvent.topics[3], 16)
   ```

2. **Fetch Metadata**:
   ```typescript
   const tokenURI = await contract.read.tokenURI([tokenId])
   const metadata = parseTokenURI(tokenURI)
   const token = createTokenFromMetadata(tokenId, metadata)
   ```

3. **Real-time Updates**:
   ```typescript
   // Listen for mint events
   useContractEvent({
     address: addresses[999].OmamoriNFTWithRoyalties,
     abi: OmamoriNFTWithRoyaltiesABI,
     eventName: 'Transfer',
     listener: (logs) => {
       // Update store with new tokens
       refreshTokens()
     }
   })
   ```

---

### **Phase 4: User Token Management (My Omamori)**

#### **🔍 Real Token Ownership**

**Current**: Mock token storage in zustand
```typescript
const mockTokens: OmamoriToken[] = [];
```

**Target**: Query blockchain for user tokens
```typescript
export async function getMyOmamori(address: `0x${string}`): Promise<OmamoriToken[]> {
  // Get user's token count
  const balance = await contract.read.balanceOf([address])
  
  // Get each token ID owned by user
  const tokenIds: number[] = []
  for (let i = 0; i < balance; i++) {
    const tokenId = await contract.read.tokenOfOwnerByIndex([address, i])
    tokenIds.push(Number(tokenId))
  }
  
  // Fetch metadata for each token
  const tokens = await Promise.all(
    tokenIds.map(async (tokenId) => {
      const tokenURI = await contract.read.tokenURI([tokenId])
      return parseTokenFromURI(tokenId, tokenURI)
    })
  )
  
  return tokens
}
```

#### **📋 Token Management Features**

1. **Auto-refresh on wallet change**:
   ```typescript
   useEffect(() => {
     if (address) {
       refreshMyTokens(address)
     }
   }, [address])
   ```

2. **Real-time updates**:
   ```typescript
   // Listen for transfers to/from user
   useContractEvent({
     address: addresses[999].OmamoriNFTWithRoyalties,
     abi: OmamoriNFTWithRoyaltiesABI,
     eventName: 'Transfer',
     listener: (logs) => {
       const relevantLogs = logs.filter(log => 
         log.args.from === address || log.args.to === address
       )
       if (relevantLogs.length > 0) {
         refreshMyTokens(address)
       }
     }
   })
   ```

---

### **Phase 5: Explore Page Integration (Global State)**

#### **🌍 Real Token Discovery**

**Current**: Pre-seeded mock tokens
```typescript
function generateSeededTokens(): OmamoriToken[] {
  // Mock 60 example tokens
}
```

**Target**: Query all minted tokens
```typescript
export async function getAllOmamori(): Promise<OmamoriToken[]> {
  // Get total supply
  const totalSupply = await contract.read.totalSupply()
  
  // Get recent tokens (last 100 for performance)
  const startId = Math.max(1, Number(totalSupply) - 99)
  const tokenIds = Array.from(
    { length: Number(totalSupply) - startId + 1 }, 
    (_, i) => startId + i
  )
  
  // Fetch metadata for recent tokens
  const tokens = await Promise.all(
    tokenIds.map(async (tokenId) => {
      try {
        const tokenURI = await contract.read.tokenURI([tokenId])
        return parseTokenFromURI(tokenId, tokenURI)
      } catch (error) {
        console.warn(`Failed to fetch token ${tokenId}:`, error)
        return null
      }
    })
  )
  
  return tokens.filter(Boolean).reverse() // Most recent first
}
```

#### **📋 Performance Optimizations**

1. **Pagination**:
   ```typescript
   const TOKENS_PER_PAGE = 20
   const [currentPage, setCurrentPage] = useState(0)
   
   const paginatedTokens = allTokens.slice(
     currentPage * TOKENS_PER_PAGE,
     (currentPage + 1) * TOKENS_PER_PAGE
   )
   ```

2. **Caching**:
   ```typescript
   // Cache tokenURI results
   const tokenCache = new Map<number, OmamoriToken>()
   
   const getCachedToken = async (tokenId: number) => {
     if (tokenCache.has(tokenId)) {
       return tokenCache.get(tokenId)!
     }
     
     const token = await fetchTokenMetadata(tokenId)
     tokenCache.set(tokenId, token)
     return token
   }
   ```

---

### **Phase 6: Preview System Integration (Real-time)**

#### **🎯 Live Preview Generation**

**Current**: Mock preview in `OmamoriPreview.tsx`
```typescript
// Uses mock material picker and renderer
const previewToken = generateMockToken(selectedMajor, selectedMinor)
```

**Target**: Real material registry integration
```typescript
export async function generatePreview(majorId: number, minorId: number, hypeAmount: string): Promise<string> {
  // Use same logic as contract for material selection
  const seed = generatePreviewSeed(majorId, minorId, hypeAmount)
  
  // Call MaterialRegistry to get material data
  const materialId = await materialRegistry.read.selectMaterial([seed])
  const material = await materialRegistry.read.viewMaterial([materialId])
  
  // Call rendering contracts to generate SVG
  const majorGlyph = await glyphRenderer.read.renderMajorGlyph([majorId])
  const minorGlyph = await glyphRenderer.read.renderMinorGlyph([majorId, minorId])
  const punches = await punchRenderer.read.renderPunches([seed, punchCount])
  
  // Assemble final SVG
  const svg = assembleSVG(majorGlyph, minorGlyph, punches, material)
  return svg
}
```

#### **📋 Preview Features**

1. **Real-time updates**:
   ```typescript
   useEffect(() => {
     const generateLivePreview = async () => {
       if (selectedMajor !== undefined && selectedMinor !== undefined) {
         const svg = await generatePreview(selectedMajor, selectedMinor, hypeAmount)
         setPreviewSvg(svg)
       }
     }
     
     generateLivePreview()
   }, [selectedMajor, selectedMinor, hypeAmount])
   ```

2. **Loading states**:
   ```typescript
   const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
   
   // Show skeleton while generating
   if (isGeneratingPreview) {
     return <PreviewSkeleton />
   }
   ```

---

## 🛠️ **IMPLEMENTATION PRIORITY**

### **🚀 Phase 1: Critical Path (Week 1)**
1. ✅ **Wallet Integration**: Real HyperEVM connection
2. ✅ **Contract Setup**: ABIs and addresses
3. ✅ **Basic Minting**: Real mint function

### **📈 Phase 2: Core Features (Week 2)**
4. ✅ **Token Metadata**: Real tokenURI parsing
5. ✅ **My Omamori**: User token fetching
6. ✅ **Event Listening**: Real-time updates

### **🎨 Phase 3: Enhanced UX (Week 3)**
7. ✅ **Live Preview**: Real material/rendering integration
8. ✅ **Explore Page**: Global token discovery
9. ✅ **Performance**: Caching and optimization

### **✨ Phase 4: Polish (Week 4)**
10. ✅ **Error Handling**: Comprehensive error states
11. ✅ **Loading States**: Smooth UX transitions
12. ✅ **Testing**: End-to-end functionality

---

## 📋 **TECHNICAL SPECIFICATIONS**

### **🔧 Required Dependencies**
```json
{
  "wagmi": "^2.0.0",
  "viem": "^2.0.0",
  "@tanstack/react-query": "^5.0.0",
  "@rainbow-me/rainbowkit": "^2.0.0" // Optional: Better wallet UX
}
```

### **🏗️ File Structure Changes**
```
src/
├── lib/
│   ├── contracts/
│   │   ├── omamori.ts          # Real contract functions
│   │   ├── addresses.ts        # Contract addresses
│   │   └── abis/              # Contract ABIs
│   ├── chains.ts              # HyperEVM chain config
│   └── wagmi.ts               # Wagmi configuration
├── hooks/
│   ├── useOmamoriContract.ts  # Contract hooks
│   ├── useTokenMetadata.ts    # Token data hooks
│   └── useRealTimeUpdates.ts  # Event listening
└── components/
    ├── WalletConnector.tsx    # Real wallet integration
    ├── LivePreview.tsx        # Real-time preview
    └── TokenGrid.tsx          # Optimized token display
```

### **🎯 Success Metrics**
- ✅ **Wallet Connection**: HyperEVM chain detection
- ✅ **Minting**: Real HYPE burning and NFT creation
- ✅ **Art Generation**: Live on-chain SVG rendering
- ✅ **Token Display**: Real metadata from tokenURI
- ✅ **User Experience**: Sub-3s load times
- ✅ **Real-time Updates**: Instant mint reflection

---

## 🏆 **FINAL VISION**

### **✨ Complete User Journey**
1. **Connect**: Real HyperEVM wallet connection
2. **Preview**: Live on-chain art generation
3. **Mint**: Real HYPE burning transaction
4. **Receive**: Instant NFT with full SVG art
5. **Explore**: Browse all community creations
6. **Share**: Beautiful on-chain art on social media

### **🎯 Technical Excellence**
- **100% On-chain**: All art and metadata from contracts
- **Real-time**: Instant updates via event listening
- **Performance**: Optimized for mobile and desktop
- **Reliability**: Comprehensive error handling
- **Future-proof**: Extensible architecture

**The frontend will be a perfect mirror of the on-chain system, showcasing the full power of decentralized NFT art generation!** 🎨✨💎

