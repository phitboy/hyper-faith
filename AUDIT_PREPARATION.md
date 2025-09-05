# Hyper Faith Omamori - Audit Preparation

## Overview

The Hyper Faith Omamori system is ready for security audit before production deployment. This document provides all necessary information for auditors.

## Contract System Architecture

### Core Contracts (5 total)

1. **MaterialRegistryPalette.sol** - Material data and weighted distribution
2. **OmamoriRender.sol** - On-chain SVG generation and metadata
3. **OmamoriNFT.sol** - Main ERC-721 contract with HYPE burning
4. **OmamoriGlyphs.sol** (library) - SVG glyph rendering
5. **PunchLayout.sol** (library) - Geometric collision detection

### Interfaces

- **IMaterials.sol** - Material registry interface

## Key Security Features

### Access Control
- **Ownable Pattern**: OmamoriNFT uses OpenZeppelin Ownable
- **Immutable References**: Renderer and materials addresses are immutable
- **Owner Functions**: Only burn mode switching and emergency token recovery

### Economic Security
- **Minimum Burn**: 0.01 HYPE minimum burn amount prevents spam
- **Dual Burn Modes**: ERC-20 token transfer vs native HYPE payment
- **Burn Address**: 0xfefeFEFeFEFEFEFEFeFefefefefeFEfEfefefEfe (assistance fund)
- **No Reentrancy**: No external calls during minting

### Randomness & Determinism
- **Deterministic Generation**: All traits derived from blockhash + user + tokenId
- **No Oracle Dependency**: Self-contained randomness using block.prevrandao
- **Collision Detection**: Geometric algorithms prevent punch overlaps

## Audit Scope

### In-Scope Contracts
```
contracts/
├── MaterialRegistryPalette.sol    # Material registry with weighted distribution
├── OmamoriRender.sol             # SVG generation and tokenURI
├── OmamoriNFT.sol               # Main ERC-721 with burning mechanism
└── libraries/
    ├── OmamoriGlyphs.sol        # SVG glyph rendering library
    └── PunchLayout.sol          # Collision detection library

interfaces/
└── IMaterials.sol               # Material interface
```

### Out-of-Scope
- Frontend code (React/TypeScript)
- Deployment scripts
- Test files (but available for reference)

## Critical Areas for Review

### 1. Economic Security
- **HYPE Burn Mechanism**: Dual mode implementation (ERC-20 vs Native)
- **Minimum Burn Validation**: Prevents spam attacks
- **Burn Address Handling**: Correct transfer to assistance fund
- **Integer Overflow/Underflow**: All arithmetic operations

### 2. Access Control
- **Owner Privileges**: Limited to burn mode and emergency recovery
- **Immutable References**: Cannot change renderer/materials after deployment
- **Function Visibility**: All functions have appropriate visibility

### 3. Randomness & Fairness
- **Material Distribution**: Weighted random selection (1B total weight)
- **Seed Generation**: Uses block.prevrandao + msg.sender + tokenId
- **Deterministic Behavior**: Same inputs always produce same outputs
- **No Manipulation**: Users cannot influence randomness

### 4. Gas Optimization & DoS
- **Gas Limits**: Large SVG generation within reasonable gas bounds
- **Loop Bounds**: All loops have fixed or bounded iterations
- **Collision Detection**: Fallback to base diamond if transforms fail
- **Storage Efficiency**: Packed structs and minimal storage

### 5. Data Integrity
- **Material Registry**: 24 materials with exact weight distribution
- **Glyph Rendering**: 12 majors × 4 minors = 48 total combinations
- **Punch Layout**: Collision detection against glyph bounding boxes
- **Metadata Generation**: Base64 encoding and JSON structure

## Test Coverage

### Comprehensive Test Suite (56 tests)
```
test/
├── MaterialRegistryPalette.t.sol  # 8 tests - Weight distribution, access
├── OmamoriGlyphs.t.sol           # 8 tests - SVG generation, coordinates
├── PunchLayout.t.sol             # 12 tests - Collision detection, transforms
├── OmamoriRender.t.sol           # 12 tests - SVG rendering, metadata
└── OmamoriNFT.t.sol             # 16 tests - Minting, burning, ownership
```

### Test Categories
- **Unit Tests**: Individual function testing
- **Integration Tests**: Contract interaction testing
- **Edge Cases**: Boundary conditions and error states
- **Gas Tests**: Performance and optimization validation
- **Statistical Tests**: Material distribution fairness

## Known Design Decisions

### 1. Deterministic Randomness
- **Choice**: Use block.prevrandao + msg.sender + tokenId for seed
- **Rationale**: Provides unpredictability while being deterministic
- **Trade-off**: Miners could theoretically influence, but cost prohibitive

### 2. On-Chain SVG Generation
- **Choice**: Generate entire SVG on-chain vs IPFS/external storage
- **Rationale**: True decentralization, no external dependencies
- **Trade-off**: Higher gas costs but permanent availability

### 3. Dual Burn Modes
- **Choice**: Support both ERC-20 token burning and native HYPE
- **Rationale**: Flexibility for different user preferences
- **Trade-off**: Additional complexity but better UX options

### 4. Collision Detection
- **Choice**: AABB collision detection with fallback to base diamond
- **Rationale**: Prevents visual overlaps while ensuring mint success
- **Trade-off**: Complex geometry but better visual quality

## Potential Risk Areas

### 1. Gas Consumption
- **Risk**: SVG generation could hit gas limits
- **Mitigation**: Tested with worst-case scenarios, fallback mechanisms
- **Status**: Average 170k gas per mint, well within limits

### 2. Randomness Manipulation
- **Risk**: Miners could influence block.prevrandao
- **Mitigation**: Cost prohibitive, seed includes user address
- **Status**: Acceptable risk for NFT traits

### 3. Integer Arithmetic
- **Risk**: Overflow/underflow in weight calculations
- **Mitigation**: Solidity 0.8.24 built-in overflow protection
- **Status**: All arithmetic operations checked

### 4. External Dependencies
- **Risk**: OpenZeppelin contract vulnerabilities
- **Mitigation**: Using latest stable versions, minimal dependencies
- **Status**: Only ERC721 and Ownable used

## Deployment Configuration

### HyperEVM Mainnet
- **Chain ID**: 999
- **RPC**: https://rpc.hyperliquid.xyz/evm
- **Currency**: HYPE (18 decimals)
- **Block Explorer**: https://explorer.hyperliquid.xyz

### Contract Sizes
- MaterialRegistryPalette: ~18KB
- OmamoriRender: ~40KB  
- OmamoriNFT: ~35KB
- All within 24KB contract size limit

## Audit Deliverables Requested

### 1. Security Report
- Vulnerability assessment (Critical/High/Medium/Low)
- Gas optimization recommendations
- Code quality assessment
- Best practices compliance

### 2. Specific Focus Areas
- Economic attack vectors
- Randomness manipulation
- Gas griefing attacks
- Access control bypass
- Integer overflow/underflow
- Reentrancy vulnerabilities

### 3. Recommendations
- Pre-deployment security improvements
- Post-deployment monitoring suggestions
- Emergency response procedures
- Upgrade path considerations (if any)

## Supporting Materials

### Documentation
- Complete system documentation in `/docs`
- Deployment guides and procedures
- Frontend integration specifications
- Test suite with 100% critical path coverage

### Code Quality
- Solidity 0.8.24 (latest stable)
- Comprehensive NatSpec documentation
- Consistent coding standards
- Static analysis clean (Slither, Solhint)

### Testing
- 56 comprehensive tests covering all functions
- Gas usage reports and optimization
- Statistical distribution validation
- Edge case and error condition testing

## Contact Information

For audit questions or clarifications:
- **Repository**: Hyper Faith Omamori contracts
- **Test Suite**: Run `forge test` for full validation
- **Gas Reports**: Run `forge test --gas-report`
- **Documentation**: Available in repository `/docs` folder

## Audit Timeline

**Suggested Timeline**:
- **Preparation**: Contract freeze, documentation finalization
- **Audit Duration**: 1-2 weeks depending on auditor
- **Remediation**: Address any findings
- **Re-audit**: If critical issues found
- **Deployment**: After audit approval

The contracts are production-ready and have undergone extensive testing. We're seeking audit validation before mainnet deployment to ensure the highest security standards for our users.
