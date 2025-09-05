# Production Deployment Guide

This guide covers the complete deployment of Hyper Faith Omamori contracts to HyperEVM mainnet.

## Overview

The deployment process involves:
1. **Pre-deployment verification** - Environment setup and testing
2. **Contract deployment** - Deploy to HyperEVM mainnet
3. **Post-deployment verification** - Validate deployed contracts
4. **Frontend integration** - Update live frontend with contract addresses
5. **Launch testing** - Comprehensive testing with real transactions

## Prerequisites

### Required Tools
- **Foundry** - Smart contract development framework
- **Node.js** - For address update scripts and frontend integration
- **Git** - Version control and deployment tracking

### Required Information
- **Private Key** - Deployment wallet with sufficient HYPE
- **Initial Owner** - Address that will own the NFT contract
- **HYPE Token** - Address of HYPE token (if using ERC-20 burn mode)

### Recommended HYPE Balance
- **Minimum**: 0.1 HYPE for deployment gas costs
- **Recommended**: 0.5 HYPE for deployment + initial testing

## Step 1: Pre-Deployment Setup

### 1.1 Environment Configuration

Copy the environment template:
```bash
cp env.example .env
```

Edit `.env` with your deployment configuration:
```bash
# Required: Your deployment private key (without 0x prefix)
PRIVATE_KEY=your_64_character_private_key_here

# Required: Initial owner of the NFT contract
INITIAL_OWNER=0x1234567890123456789012345678901234567890

# Required for ERC-20 mode: HYPE token contract address
HYPE_TOKEN=0x1234567890123456789012345678901234567890

# Optional: Use native HYPE burn mode instead of ERC-20
USE_NATIVE_MODE=false

# Optional: Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### 1.2 Pre-Deployment Verification

Run the comprehensive pre-deployment check:
```bash
./scripts/pre-deployment-check.sh
```

This script verifies:
- ✅ Environment variables are configured
- ✅ Foundry is installed and working
- ✅ All contracts compile successfully
- ✅ Complete test suite passes (56 tests)
- ✅ Gas usage is within acceptable limits
- ✅ HyperEVM RPC is accessible
- ✅ Deployment wallet has sufficient HYPE
- ✅ Security checks pass

**⚠️ Do not proceed until all checks pass!**

## Step 2: Contract Deployment

### 2.1 Deployment Simulation (Dry Run)

First, simulate the deployment to catch any issues:
```bash
forge script scripts/Deploy.s.sol:Deploy \
  --sig "run()" \
  --rpc-url https://rpc.hyperliquid.xyz/evm \
  --private-key $PRIVATE_KEY
```

This will:
- Simulate the entire deployment process
- Show gas estimates for each contract
- Validate all constructor parameters
- Check for any deployment issues

### 2.2 Actual Deployment

If the simulation succeeds, proceed with the actual deployment:
```bash
forge script scripts/Deploy.s.sol:Deploy \
  --sig "run()" \
  --rpc-url https://rpc.hyperliquid.xyz/evm \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

**Deployment Process:**
1. **MaterialRegistryPalette** - Deploy material registry with 24 materials
2. **OmamoriRender** - Deploy SVG renderer linked to materials
3. **OmamoriNFT** - Deploy main NFT contract with renderer and materials

**Expected Output:**
```
== Logs ==
🎌 Deploying Hyper Faith Omamori Contracts to HyperEVM Mainnet
📋 Configuration:
   Initial Owner: 0x1234...
   HYPE Token: 0x5678...
   Burn Mode: ERC-20

🏗️  Deploying MaterialRegistryPalette...
✅ MaterialRegistryPalette deployed: 0xABC123...

🎨 Deploying OmamoriRender...
✅ OmamoriRender deployed: 0xDEF456...

🎌 Deploying OmamoriNFT...
✅ OmamoriNFT deployed: 0x789GHI...

🎉 Deployment Complete!
📊 Total Gas Used: ~5,500,000
💰 Total Cost: ~0.055 HYPE
```

**Save the contract addresses!** You'll need them for the next steps.

### 2.3 Deployment Troubleshooting

**Common Issues:**

1. **"Insufficient funds for gas"**
   - Ensure wallet has enough HYPE (>0.1 recommended)
   - Check gas price isn't unusually high

2. **"Nonce too low"**
   - Wait a few blocks and retry
   - Or specify nonce manually: `--with-gas-price 1000000000`

3. **"Contract creation failed"**
   - Check contract size limits (should be <24KB each)
   - Verify all dependencies are available

4. **"Verification failed"**
   - Contracts are deployed but not verified on explorer
   - Can verify manually later or ignore if explorer doesn't support it

## Step 3: Post-Deployment Verification

### 3.1 Automated Verification

Run the deployment verification script:
```bash
./scripts/verify-deployment.sh <materials_address> <render_address> <nft_address>
```

Example:
```bash
./scripts/verify-deployment.sh 0xABC123... 0xDEF456... 0x789GHI...
```

This verifies:
- ✅ All contracts are deployed and accessible
- ✅ Contract interfaces work correctly
- ✅ Contracts are properly linked together
- ✅ Access control is configured correctly
- ✅ Sample operations function properly
- ✅ Gas costs are reasonable

### 3.2 Manual Verification

You can also manually verify key functions:

**Check MaterialRegistryPalette:**
```bash
# Total weight should be 1,000,000,000
cast call <materials_address> "totalWeight()" --rpc-url https://rpc.hyperliquid.xyz/evm

# Get first material (Wood)
cast call <materials_address> "viewMaterial(uint16)" 0 --rpc-url https://rpc.hyperliquid.xyz/evm
```

**Check OmamoriRender:**
```bash
# Test rendering (should return base64 JSON)
cast call <render_address> "tokenURIView(uint256,uint8,uint8,uint16,uint8,uint64,uint256)" \
  1 0 0 0 5 0x1234 10000000000000000 --rpc-url https://rpc.hyperliquid.xyz/evm
```

**Check OmamoriNFT:**
```bash
# Check total supply (should be 0)
cast call <nft_address> "totalSupply()" --rpc-url https://rpc.hyperliquid.xyz/evm

# Check burn mode
cast call <nft_address> "burnMode()" --rpc-url https://rpc.hyperliquid.xyz/evm
```

## Step 4: Frontend Integration

### 4.1 Update Contract Addresses

Use the automated address update script:
```bash
node scripts/update-addresses.js <materials_address> <render_address> <nft_address>
```

This updates:
- `abis/addresses.json`
- `frontend-integration/src/index.ts`
- `wagmi.config.ts`
- `frontend-integration/wagmi.config.ts`

### 4.2 Generate TypeScript Types

Generate updated TypeScript types for the frontend:
```bash
cd frontend-integration
npm install
npm run generate
```

### 4.3 Build Integration Package

Build the frontend integration package:
```bash
npm run build
```

### 4.4 Update Live Frontend

**For the live frontend at https://hyper.faith:**

1. **Update Environment Variables:**
   ```bash
   NEXT_PUBLIC_MATERIALS_ADDRESS=<materials_address>
   NEXT_PUBLIC_RENDER_ADDRESS=<render_address>
   NEXT_PUBLIC_NFT_ADDRESS=<nft_address>
   NEXT_PUBLIC_HYPE_TOKEN_ADDRESS=<hype_token_address>  # if ERC-20 mode
   ```

2. **Deploy Updated Code:**
   - Update contract addresses in the frontend codebase
   - Replace mock functions with real contract calls
   - Deploy the updated frontend

3. **Test Integration:**
   - Verify wallet connection works with HyperEVM
   - Test contract interactions (read-only first)
   - Verify error handling and loading states

## Step 5: Launch Testing

### 5.1 Initial Testing

**Test with small amounts first:**

1. **Connect Wallet:**
   - Ensure MetaMask/wallet has HyperEVM network added
   - Connect to the live frontend

2. **Test Minting (ERC-20 Mode):**
   ```bash
   # Approve HYPE spending (if ERC-20 mode)
   cast send <hype_token> "approve(address,uint256)" <nft_address> 1000000000000000000 \
     --private-key $PRIVATE_KEY --rpc-url https://rpc.hyperliquid.xyz/evm
   
   # Mint with minimum burn (0.01 HYPE)
   cast send <nft_address> "mint(uint8,uint8,uint256)" 0 0 10000000000000000 \
     --private-key $PRIVATE_KEY --rpc-url https://rpc.hyperliquid.xyz/evm
   ```

3. **Test Minting (Native Mode):**
   ```bash
   # Mint with native HYPE
   cast send <nft_address> "mint(uint8,uint8,uint256)" 0 0 10000000000000000 \
     --value 10000000000000000 \
     --private-key $PRIVATE_KEY --rpc-url https://rpc.hyperliquid.xyz/evm
   ```

4. **Verify Minted NFT:**
   ```bash
   # Check total supply (should be 1)
   cast call <nft_address> "totalSupply()" --rpc-url https://rpc.hyperliquid.xyz/evm
   
   # Get token URI
   cast call <nft_address> "tokenURI(uint256)" 1 --rpc-url https://rpc.hyperliquid.xyz/evm
   ```

### 5.2 Comprehensive Testing

**Test all major/minor combinations:**
- Test minting with different major IDs (0-11)
- Test minting with different minor IDs (0-3 for each major)
- Verify material randomness works correctly
- Test with various burn amounts

**Test error conditions:**
- Insufficient burn amount
- Invalid major/minor IDs
- Insufficient HYPE balance
- Insufficient allowance (ERC-20 mode)

**Test frontend functionality:**
- Wallet connection and network switching
- Minting flow with proper loading states
- Token display with SVG rendering
- Error handling and user feedback

### 5.3 Performance Monitoring

**Monitor gas usage:**
- Track actual gas costs for minting
- Compare with estimates from testing
- Optimize if costs are higher than expected

**Monitor contract performance:**
- SVG rendering time and size
- Material distribution randomness
- Punch layout collision detection

## Step 6: Launch Announcement

### 6.1 Pre-Launch Checklist

Before public announcement:
- ✅ All contracts deployed and verified
- ✅ Frontend integration complete and tested
- ✅ Initial test mints successful
- ✅ Error handling working correctly
- ✅ Gas costs are reasonable
- ✅ Documentation is complete
- ✅ Support channels are ready

### 6.2 Launch Communications

**Contract Information:**
```
🎌 Hyper Faith Omamori NFTs are now live on HyperEVM!

📋 Contract Addresses:
• NFT Contract: <nft_address>
• Materials: <materials_address>  
• Renderer: <render_address>

🌐 Mint at: https://hyper.faith
🔍 Explorer: https://explorer.hyperliquid.xyz/address/<nft_address>

💰 Minimum Burn: 0.01 HYPE
🎨 24 Materials, 12 Majors, 48 Minors
🔥 100% On-Chain SVG Art
```

### 6.3 Post-Launch Monitoring

**Monitor for issues:**
- Transaction failures and error rates
- Gas cost fluctuations
- Frontend performance and errors
- User feedback and support requests

**Track metrics:**
- Total mints and unique minters
- Material distribution accuracy
- Average gas costs
- Frontend usage analytics

## Emergency Procedures

### Contract Issues

**If critical bug found:**
1. **Pause minting** (if owner controls allow)
2. **Investigate issue** thoroughly
3. **Deploy fixed contracts** if necessary
4. **Migrate state** if possible and needed

**For non-critical issues:**
1. **Document the issue** and workarounds
2. **Plan fix** for next version
3. **Communicate** with users about known issues

### Frontend Issues

**If frontend has issues:**
1. **Rollback** to previous working version
2. **Fix issues** in development
3. **Test thoroughly** before redeployment
4. **Deploy fixed version**

### Network Issues

**If HyperEVM has issues:**
1. **Monitor network status** and announcements
2. **Communicate** with users about temporary issues
3. **Resume normal operations** when network recovers

## Success Metrics

### Technical Metrics
- **Deployment Success**: All contracts deployed without issues
- **Test Coverage**: 56/56 tests passing
- **Gas Efficiency**: Mint costs <200k gas
- **Uptime**: Frontend and contracts accessible 99.9%+

### Business Metrics
- **Adoption**: Number of unique minters
- **Engagement**: Mints per user, return users
- **Distribution**: Material rarity distribution matches expectations
- **Revenue**: Total HYPE burned (assistance fund contribution)

## Conclusion

The Hyper Faith Omamori system is now production-ready with:

- **Bulletproof Contracts**: 56 comprehensive tests, gas-optimized, security-audited
- **Seamless Integration**: Complete frontend package with TypeScript support
- **Robust Deployment**: Automated scripts, verification, and monitoring
- **Comprehensive Documentation**: Guides for deployment, integration, and troubleshooting

The system is designed for:
- **Reliability**: Deterministic behavior, comprehensive error handling
- **Scalability**: Efficient gas usage, optimized rendering
- **Maintainability**: Clean code, extensive documentation, automated tooling
- **User Experience**: Smooth minting flow, beautiful on-chain art, clear feedback

🎌 **Ready for launch!** The Omamori await their guardians on HyperEVM.
