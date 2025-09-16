# 🎯 **OMAMORI NFT ROYALTY IMPLEMENTATION PLAN**

## 📋 **Current Status**

### **✅ Deployed System**
- **OmamoriNFTCore**: `0x8339cC8dc7BD719D84c488d649923e9ed50f5128`
- **Owner**: `0x7FF97904C8bD597cC5f4fc1Bc0FdC403d7A1A779`
- **Royalty Support**: ❌ **NONE (0%)**
- **Rendering System**: ✅ **FULLY CONNECTED**

### **🎯 Requested Configuration**
- **Royalty Recipient**: `0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D`
- **Royalty Rate**: **5%** (500 basis points)
- **Standard**: **EIP-2981**

---

## 🛠️ **Implementation Options**

### **Option A: Deploy New Contract with Royalties (RECOMMENDED)**

#### **✅ Advantages**
- **Full EIP-2981 Support**: Native marketplace compatibility
- **On-Chain Enforcement**: Royalties enforced at contract level
- **Universal Support**: Works on all EIP-2981 compatible marketplaces
- **Gas Efficient**: 1.26M deployment gas (62% of HyperEVM limit)
- **Clean Implementation**: No technical debt or workarounds

#### **📊 Technical Details**
- **Contract**: `OmamoriNFTWithRoyalties.sol` ✅ **BUILT & TESTED**
- **Gas Cost**: 1,256,038 (fits in 2M limit)
- **Interface Support**: ERC721 + ERC2981 + ERC165
- **Royalty Function**: `royaltyInfo(tokenId, salePrice)` returns recipient & amount

#### **🔄 Migration Process**
1. Deploy new contract with royalties
2. Connect to existing rendering system (same addresses)
3. Announce new contract to community
4. Optional: Pause old contract minting

---

### **Option B: Marketplace-Level Configuration**

#### **⚠️ Platform-Specific Approach**
- **OpenSea**: Creator royalty settings in collection management
- **LooksRare**: Platform royalty configuration
- **X2Y2**: Creator earnings setup

#### **❌ Limitations**
- **Not Enforceable**: Marketplaces can ignore settings
- **Platform Dependent**: Different setup for each marketplace
- **No Standard**: Not EIP-2981 compliant
- **Future Risk**: Platforms may remove royalty support

---

### **Option C: Proxy Upgrade Pattern**

#### **❌ Not Feasible**
- **Current Contract**: Not designed for upgrades
- **High Complexity**: Requires complete redeployment
- **Gas Intensive**: Proxy + implementation contracts
- **Technical Risk**: More complex architecture

---

## 💰 **Royalty Calculations (5%)**

| Sale Price | Seller Receives | Royalty Amount | Royalty Recipient |
|------------|-----------------|----------------|-------------------|
| 0.1 ETH    | 0.095 ETH      | 0.005 ETH      | `0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D` |
| 1 ETH      | 0.95 ETH       | 0.05 ETH       | `0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D` |
| 5 ETH      | 4.75 ETH       | 0.25 ETH       | `0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D` |
| 10 ETH     | 9.5 ETH        | 0.5 ETH        | `0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D` |

---

## 🚀 **Recommended Implementation Plan**

### **Phase 1: Deploy New Contract**
```bash
# Deploy OmamoriNFTWithRoyalties
forge script scripts/DeployRoyaltyNFT.s.sol --rpc-url https://rpc.hyperliquid.xyz/evm --broadcast
```

### **Phase 2: Connect Rendering System**
```bash
# Connect to existing SVGAssembler
cast send [NEW_CONTRACT] "setSVGAssembler(address)" 0xB42ac8659c9F661EB548C68e67F432cF5D2aa52c --private-key $PRIVATE_KEY
```

### **Phase 3: Verify Royalty Support**
- Test `royaltyInfo()` function
- Verify EIP-2981 interface support
- Check marketplace detection

### **Phase 4: Community Communication**
- Announce new contract address
- Explain royalty benefits
- Provide migration guidance

---

## 🏪 **Marketplace Integration**

### **✅ Automatic Detection**
Once deployed, marketplaces will automatically detect:
- **EIP-2981 Support**: Via `supportsInterface()`
- **Royalty Rate**: Via `royaltyInfo()` function
- **Recipient Address**: `0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D`

### **📱 Platform Display**
- **OpenSea**: "Creator earnings: 5%"
- **LooksRare**: "Royalty: 5% to [address]"
- **X2Y2**: "Creator fee: 5%"

---

## 🎯 **Contract Comparison**

| Feature | Current (OmamoriNFTCore) | New (OmamoriNFTWithRoyalties) |
|---------|-------------------------|-------------------------------|
| **ERC-721** | ✅ Yes | ✅ Yes |
| **HYPE Burning** | ✅ Yes | ✅ Yes |
| **SVG Rendering** | ✅ Yes | ✅ Yes |
| **EIP-2981 Royalties** | ❌ No | ✅ Yes |
| **Marketplace Royalties** | ❌ 0% | ✅ 5% |
| **Gas Efficiency** | ✅ 1.25M | ✅ 1.26M |
| **Owner Controls** | ✅ Yes | ✅ Yes + Royalty Config |

---

## 🔧 **Technical Implementation**

### **✅ Built & Tested**
- **Contract**: `OmamoriNFTWithRoyalties.sol`
- **Tests**: All passing (gas, royalty calculations, interface support)
- **Gas Usage**: 1,256,038 (62% of HyperEVM limit)
- **Royalty Config**: 5% to `0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D`

### **🔗 System Integration**
- **Rendering System**: Compatible with existing contracts
- **Material Registry**: Uses same deployed registry
- **SVG Assembler**: Connects to existing assembler
- **Owner Controls**: Full administrative control

---

## 💡 **Next Steps**

### **Immediate Actions**
1. **Confirm Approach**: Approve new contract deployment
2. **Deploy Contract**: Execute deployment script
3. **Connect System**: Link to rendering contracts
4. **Test Functionality**: Verify minting and royalties

### **Future Considerations**
- **Community Announcement**: Communicate new contract benefits
- **Migration Strategy**: Plan for transitioning users
- **Marketplace Verification**: Ensure proper royalty display

---

## 🏆 **Expected Outcome**

**After implementation, every Omamori NFT sale on any EIP-2981 compatible marketplace will automatically send 5% of the sale price to `0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D`, providing ongoing revenue for the project while maintaining all existing functionality.**

**The new contract will be fully compatible with the existing rendering system, ensuring seamless user experience with added creator royalty benefits.** 💰✨
