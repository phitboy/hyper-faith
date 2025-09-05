# Omamori Deployment Guide

This guide covers deploying the complete Omamori system to HyperEVM and integrating with the frontend.

## Prerequisites

- [Foundry](https://getfoundry.sh/) installed
- Private key with HYPE for gas fees
- HYPE token address (if using ERC-20 burn mode)
- `jq` installed for ABI extraction

## Quick Start

1. **Setup Environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

2. **Build Contracts**
   ```bash
   forge build
   ```

3. **Run Tests**
   ```bash
   forge test
   ```

4. **Deploy to HyperEVM**
   ```bash
   forge script scripts/Deploy.s.sol:Deploy --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
   ```

5. **Extract ABIs**
   ```bash
   ./scripts/extract-abis.sh
   ```

6. **Update Frontend**
   - Update contract addresses in `abis/addresses.json`
   - Run wagmi codegen to generate TypeScript types
   - Replace mock functions with real contract calls

## Detailed Deployment Steps

### 1. Environment Configuration

Create a `.env` file from the template:

```bash
cp env.example .env
```

Configure the following variables:

```bash
# Required
PRIVATE_KEY=your_private_key_without_0x_prefix
RPC_URL=https://rpc.hyperliquid.xyz/evm
INITIAL_OWNER=0xYourOwnerAddress

# For ERC-20 burn mode
HYPE_TOKEN=0xHypeTokenAddress
USE_NATIVE_MODE=false

# For native burn mode
USE_NATIVE_MODE=true
```

### 2. Contract Deployment

#### Option A: Automatic Deployment
```bash
forge script scripts/Deploy.s.sol:Deploy --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

#### Option B: Mainnet Deployment (with validation)
```bash
forge script scripts/Deploy.s.sol:Deploy --sig "deployMainnet()" --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
```

#### Option C: Local Testing
```bash
# Start local node first
anvil --chain-id 999

# Deploy to local node
forge script scripts/Deploy.s.sol:Deploy --sig "deployLocal()" --rpc-url http://localhost:8545 --private-key $PRIVATE_KEY --broadcast
```

### 3. Post-Deployment Configuration

After deployment, you'll see output like:
```
=== Deployment Summary ===
MaterialRegistryPalette: 0x1234...
OmamoriRender: 0x5678...
OmamoriNFT: 0x9abc...
```

#### Update Contract Addresses
1. Update `abis/addresses.json` with deployed addresses
2. Update `wagmi.config.ts` with deployed addresses
3. Update frontend configuration

#### Configure NFT Contract (if needed)
```bash
# Set HYPE token address (ERC-20 mode)
cast send $NFT_ADDRESS "setHypeToken(address)" $HYPE_TOKEN --rpc-url $RPC_URL --private-key $PRIVATE_KEY

# Switch to native mode
cast send $NFT_ADDRESS "setBurnMode(uint8)" 1 --rpc-url $RPC_URL --private-key $PRIVATE_KEY
```

### 4. ABI Generation for Frontend

Extract ABIs for frontend integration:
```bash
./scripts/extract-abis.sh
```

This creates:
- `abis/MaterialRegistryPalette.json`
- `abis/OmamoriRender.json` 
- `abis/OmamoriNFT.json`
- `abis/IMaterials.json`
- `abis/addresses.json`

### 5. Frontend Integration

#### Install Wagmi CLI (if not already installed)
```bash
npm install -g @wagmi/cli
```

#### Generate TypeScript Types
```bash
wagmi generate
```

#### Update Frontend Code
Replace mock functions in `src/lib/contracts/omamori.ts` with real contract calls:

```typescript
import { useContractRead, useContractWrite } from 'wagmi'
import { omamoriNFTABI } from '../generated'

// Replace mintOmamoriMock with real contract call
export function useMintOmamori() {
  return useContractWrite({
    address: '0xYourNFTAddress',
    abi: omamoriNFTABI,
    functionName: 'mint',
  })
}
```

## Contract Addresses

After deployment, update these addresses in your frontend:

### HyperEVM Mainnet (Chain ID: 999)
```json
{
  "999": {
    "MaterialRegistryPalette": "0x0000000000000000000000000000000000000000",
    "OmamoriRender": "0x0000000000000000000000000000000000000000", 
    "OmamoriNFT": "0x0000000000000000000000000000000000000000"
  }
}
```

## Verification

### Contract Verification (if supported)
```bash
forge verify-contract $CONTRACT_ADDRESS src/contracts/OmamoriNFT.sol:OmamoriNFT --chain-id 999 --constructor-args $(cast abi-encode "constructor(address,address,address,address)" $HYPE_TOKEN $RENDERER $MATERIALS $OWNER)
```

### Functional Testing
```bash
# Test material access
cast call $MATERIALS_ADDRESS "viewMaterial(uint16)" 0 --rpc-url $RPC_URL

# Test renderer
cast call $RENDERER_ADDRESS "tokenURIView(uint256,uint8,uint8,uint16,uint8,uint64,uint256)" 1 0 0 0 5 12345 1000000000000000000 --rpc-url $RPC_URL

# Test minting (requires HYPE approval first)
cast send $NFT_ADDRESS "mint(uint8,uint8,uint256)" 0 0 10000000000000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY
```

## Gas Estimates

Typical gas usage on HyperEVM:

| Operation | Gas Used | Cost (HYPE) |
|-----------|----------|-------------|
| Deploy Materials | ~2.5M | ~0.0025 |
| Deploy Renderer | ~4M | ~0.004 |
| Deploy NFT | ~3M | ~0.003 |
| Mint NFT | ~170k | ~0.00017 |
| TokenURI | ~1.3M | ~0.0013 |

## Troubleshooting

### Common Issues

1. **"Insufficient HYPE burn"**
   - Ensure burn amount >= 0.01 HYPE (10000000000000000 wei)

2. **"Insufficient allowance"**
   - Approve HYPE token spending before minting in ERC-20 mode

3. **"Invalid major/minor ID"**
   - Major ID must be 0-11, Minor ID must be 0-3

4. **Gas estimation failed**
   - Increase gas limit for complex operations like tokenURI

### Debug Commands

```bash
# Check contract deployment
cast code $CONTRACT_ADDRESS --rpc-url $RPC_URL

# Check contract owner
cast call $NFT_ADDRESS "owner()" --rpc-url $RPC_URL

# Check burn mode
cast call $NFT_ADDRESS "burnMode()" --rpc-url $RPC_URL

# Check total supply
cast call $NFT_ADDRESS "totalSupply()" --rpc-url $RPC_URL
```

## Security Considerations

1. **Private Key Management**
   - Never commit private keys to version control
   - Use hardware wallets for mainnet deployments
   - Consider multi-sig for contract ownership

2. **Contract Verification**
   - Verify all contracts on block explorer
   - Ensure source code matches deployed bytecode

3. **Access Controls**
   - Review owner-only functions
   - Consider timelock for critical changes
   - Plan ownership transfer procedures

## Next Steps

After successful deployment:

1. ✅ Verify contracts on block explorer
2. ✅ Update frontend with contract addresses
3. ✅ Test minting functionality
4. ✅ Monitor gas costs and optimize if needed
5. ✅ Set up monitoring and alerts
6. ✅ Plan upgrade procedures (if needed)

For support, refer to the contract documentation or create an issue in the repository.
