# Hyper Faith Omamori Contracts

Production-ready Solidity contracts for the Hyper Faith Omamori NFT project on Hyperliquid HyperEVM.

## Architecture

### Core Contracts

- **MaterialRegistryPalette.sol** - On-chain material palette with 24 materials and weighted distribution (1B total weight)
- **OmamoriGlyphs.sol** - Library for rendering 12 Major + 48 Minor glyphs using SVG primitives only
- **PunchLayout.sol** - Library for deterministic punch diamond layout with collision detection
- **OmamoriRender.sol** - On-chain SVG renderer that generates complete tokenURI JSON
- **OmamoriNFT.sol** - Main ERC-721 contract with HYPE burning mechanism

### Interfaces

- **IMaterials.sol** - Interface for material registry access

## Network Configuration

- **Chain ID**: 999 (Hyperliquid HyperEVM)
- **RPC URL**: https://rpc.hyperliquid.xyz/evm
- **Currency**: HYPE
- **Explorer**: https://hyperevmscan.io/

## Development Setup

```bash
# Install dependencies
forge install

# Build contracts
forge build

# Run tests
forge test -vv

# Run with gas reports
forge test --gas-report

# Deploy locally
anvil --port 8545 --chain-id 31337
forge script Deploy.s.sol --rpc-url local --broadcast

# Deploy to Hyperliquid
forge script Deploy.s.sol --rpc-url hyperliquid --broadcast --verify
```

## Key Features

### On-chain SVG Rendering
- Complete SVG generation on-chain using only geometric primitives
- No external dependencies or off-chain art
- Material colors and names stored on-chain

### HYPE Burn Mechanism
- Dual mode: ERC-20 token burn (default) or native HYPE burn
- Configurable minimum burn amount (0.01 HYPE default)
- Burns to assistance fund: `0xfefefefefefefefefefefefefefefefefefefefe`

### Weighted Material Distribution
- 24 materials across 5 tiers (Common to Mythic)
- Precise 1,000,000,000 total weight distribution
- Deterministic material selection using on-chain randomness

### Punch Diamond System
- 25-slot diamond layout with deterministic transforms
- Collision detection prevents overlap with Major/Minor glyph areas
- Fallback to base diamond if transforms would cause collisions

## Testing

Comprehensive test suite covering:
- Material weight distribution accuracy (100k+ sample tests)
- SVG rendering invariance (same visual output regardless of HYPE burned)
- Punch collision detection and fallback behavior
- Gas optimization and security checks

## Security

- Built on OpenZeppelin battle-tested contracts
- Static analysis with Slither
- Solhint linting for best practices
- Comprehensive test coverage
- Gas-optimized for production use

## Integration

ABIs are automatically exported to `/abis` directory for frontend integration with the deployed site at https://hyper.faith.
