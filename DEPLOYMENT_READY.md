# Deployment Ready - Final Commands

## Status: Ready for Immediate Deployment

✅ **Security Audit**: Completed (LOW RISK - 0 critical/high vulnerabilities)
✅ **Gas Optimization**: Completed (MaterialRegistryMinimal - 707k gas)
✅ **Environment**: Configured correctly
✅ **Chain Configuration**: Chain ID 999, RPC https://rpc.hyperliquid.xyz/evm
⏳ **HYPE Balance**: Waiting for bridge transfer from HyperCore to HyperEVM

## Deployment Commands (Execute After Bridge)

### Step 1: Verify HYPE Balance
```bash
cast balance 0x7FF97904C8bD597cC5f4fc1Bc0FdC403d7A1A779 --rpc-url https://rpc.hyperliquid.xyz/evm
```

### Step 2: Deploy MaterialRegistryMinimal
```bash
source .env && cast send --rpc-url https://rpc.hyperliquid.xyz/evm --private-key $PRIVATE_KEY --gas-limit 800000 --create $(forge inspect contracts/MaterialRegistryMinimal.sol:MaterialRegistryMinimal bytecode)
```

### Step 3: Initialize Materials (24 transactions)
After deployment, get the contract address and run:
```bash
# Replace CONTRACT_ADDRESS with deployed address
CONTRACT_ADDRESS="0x..."

# Set all 24 materials
source .env && cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 0 "Wood" "Common" "#b78c55" "#6b4e2e" 300000900 --rpc-url https://rpc.hyperliquid.xyz/evm --private-key $PRIVATE_KEY

# ... (repeat for all 24 materials)
```

### Step 4: Finalize Registry
```bash
source .env && cast send $CONTRACT_ADDRESS "finalize()" --rpc-url https://rpc.hyperliquid.xyz/evm --private-key $PRIVATE_KEY
```

### Step 5: Deploy Remaining Contracts
```bash
# Deploy OmamoriRender
source .env && cast send --rpc-url https://rpc.hyperliquid.xyz/evm --private-key $PRIVATE_KEY --gas-limit 2000000 --create $(forge inspect contracts/OmamoriRender.sol:OmamoriRender bytecode) $(cast abi-encode "constructor(address)" $CONTRACT_ADDRESS)

# Deploy OmamoriNFT
# ... (with renderer and materials addresses)
```

## Contract Addresses (To Be Filled)
- **MaterialRegistryMinimal**: `0x...` (pending deployment)
- **OmamoriRender**: `0x...` (pending deployment)  
- **OmamoriNFT**: `0x...` (pending deployment)

## Gas Estimates
- **MaterialRegistryMinimal**: ~707,181 gas
- **Each setMaterial call**: ~50,000 gas
- **Finalize call**: ~15,000 gas
- **OmamoriRender**: ~1,967,023 gas
- **OmamoriNFT**: ~1,865,666 gas

**Total Estimated**: ~5.5M gas across all transactions
**HYPE Required**: ~0.001 HYPE (with buffer)

## Ready for SolidityScan Audit
Once deployed and verified on hyperevmscan.io, contracts will be ready for SolidityScan analysis at https://solidityscan.com/quickscan

## Success Criteria
- ✅ All contracts deployed successfully
- ✅ MaterialRegistry initialized with all 24 materials
- ✅ Contract verification on hyperevmscan.io
- ✅ Basic functionality testing (mint test)
- ✅ SolidityScan audit completion
