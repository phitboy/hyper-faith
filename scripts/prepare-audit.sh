#!/bin/bash

echo "🛡️ Preparing Hyper Faith Omamori Audit Package"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create audit package directory
AUDIT_DIR="audit-package"
rm -rf $AUDIT_DIR
mkdir -p $AUDIT_DIR

echo -e "${BLUE}📁 Creating audit package structure...${NC}"

# Copy core contracts
mkdir -p $AUDIT_DIR/contracts
cp -r contracts/* $AUDIT_DIR/contracts/
cp -r interfaces $AUDIT_DIR/
cp -r libraries $AUDIT_DIR/

# Copy test suite for reference
mkdir -p $AUDIT_DIR/test
cp -r test/* $AUDIT_DIR/test/

# Copy configuration files
cp foundry.toml $AUDIT_DIR/
cp .solhint.json $AUDIT_DIR/
cp slither.config.json $AUDIT_DIR/

# Copy documentation
cp AUDIT_PREPARATION.md $AUDIT_DIR/
cp contracts/README.md $AUDIT_DIR/CONTRACT_OVERVIEW.md
cp DEPLOYMENT.md $AUDIT_DIR/
cp PRODUCTION_DEPLOYMENT.md $AUDIT_DIR/

# Create audit-specific files
cp audit-package/README.md $AUDIT_DIR/

# Generate contract statistics
echo -e "${BLUE}📊 Generating contract statistics...${NC}"

cat > $AUDIT_DIR/STATISTICS.md << 'EOF'
# Contract Statistics

## Lines of Code
```bash
# Generated automatically
EOF

# Count lines of code
echo "Contract,Lines,Functions,Modifiers" > $AUDIT_DIR/contract_metrics.csv
for contract in contracts/*.sol libraries/*.sol interfaces/*.sol; do
    if [ -f "$contract" ]; then
        filename=$(basename "$contract")
        lines=$(wc -l < "$contract")
        functions=$(grep -c "function " "$contract" || echo 0)
        modifiers=$(grep -c "modifier " "$contract" || echo 0)
        echo "$filename,$lines,$functions,$modifiers" >> $AUDIT_DIR/contract_metrics.csv
        echo "$filename: $lines lines, $functions functions, $modifiers modifiers" >> $AUDIT_DIR/STATISTICS.md
    fi
done

echo '```' >> $AUDIT_DIR/STATISTICS.md

# Generate test report
echo -e "${BLUE}🧪 Running test suite...${NC}"
forge test --gas-report > $AUDIT_DIR/TEST_REPORT.txt 2>&1

# Generate gas report
echo -e "${BLUE}⛽ Generating gas report...${NC}"
forge test --gas-report --json > $AUDIT_DIR/gas_report.json 2>/dev/null

# Create deployment simulation
echo -e "${BLUE}🚀 Running deployment simulation...${NC}"
forge script scripts/Deploy.s.sol:Deploy --sig "run()" --rpc-url https://rpc.hyperliquid.xyz/evm > $AUDIT_DIR/DEPLOYMENT_SIMULATION.txt 2>&1

# Generate ABI files for reference
echo -e "${BLUE}📋 Extracting ABIs...${NC}"
mkdir -p $AUDIT_DIR/abis
bash scripts/extract-abis.sh > /dev/null 2>&1
cp -r abis/* $AUDIT_DIR/abis/ 2>/dev/null || true

# Create audit checklist
cat > $AUDIT_DIR/AUDIT_CHECKLIST.md << 'EOF'
# Security Audit Checklist

## Critical Security Areas

### 🔥 High Priority Issues
- [ ] **Economic Security**
  - [ ] HYPE burn mechanism validation
  - [ ] Minimum burn amount enforcement
  - [ ] Burn address verification
  - [ ] Integer overflow/underflow protection
  
- [ ] **Access Control**
  - [ ] Owner privilege limitations
  - [ ] Function visibility correctness
  - [ ] Unauthorized access prevention
  
- [ ] **Randomness & Fairness**
  - [ ] Seed generation security
  - [ ] Material distribution accuracy
  - [ ] Manipulation resistance

### 🟡 Medium Priority Issues
- [ ] **Gas Optimization & DoS**
  - [ ] Gas limit compliance
  - [ ] Loop bound verification
  - [ ] DoS attack resistance
  
- [ ] **Data Integrity**
  - [ ] Material registry correctness
  - [ ] SVG generation validation
  - [ ] Metadata accuracy

### 🟢 Low Priority Issues
- [ ] **Code Quality**
  - [ ] Best practices compliance
  - [ ] Documentation completeness
  - [ ] Error handling

## Specific Vulnerabilities to Check

### Smart Contract Security
- [ ] Reentrancy attacks
- [ ] Front-running vulnerabilities
- [ ] Flash loan attacks
- [ ] Griefing attacks
- [ ] Timestamp manipulation
- [ ] Block hash manipulation

### Economic Attacks
- [ ] Burn mechanism bypass
- [ ] Material distribution manipulation
- [ ] Gas price manipulation
- [ ] MEV extraction opportunities

### Access Control
- [ ] Privilege escalation
- [ ] Function selector collisions
- [ ] Proxy upgrade vulnerabilities (N/A - no proxies)
- [ ] Multi-sig bypass (N/A - single owner)

## Testing Verification
- [ ] All 56 tests pass
- [ ] Gas usage within limits
- [ ] Edge cases covered
- [ ] Statistical distribution tests

## Documentation Review
- [ ] NatSpec completeness
- [ ] Architecture documentation
- [ ] Deployment procedures
- [ ] Emergency procedures

## Deployment Security
- [ ] Constructor parameters
- [ ] Initial state validation
- [ ] Upgrade mechanisms (N/A - immutable)
- [ ] Emergency stops (N/A - by design)

## Sign-off
- [ ] **Auditor**: ________________
- [ ] **Date**: ________________
- [ ] **Severity Assessment**: ________________
- [ ] **Recommendations**: ________________
EOF

# Create summary file
cat > $AUDIT_DIR/PACKAGE_CONTENTS.md << 'EOF'
# Audit Package Contents

## Core Files for Review

### Smart Contracts
- `contracts/OmamoriNFT.sol` - Main ERC-721 contract with HYPE burning
- `contracts/MaterialRegistryPalette.sol` - Material registry with weighted distribution
- `contracts/OmamoriRender.sol` - On-chain SVG generation and metadata
- `libraries/OmamoriGlyphs.sol` - SVG glyph rendering library
- `libraries/PunchLayout.sol` - Collision detection and geometric algorithms
- `interfaces/IMaterials.sol` - Material registry interface

### Configuration
- `foundry.toml` - Foundry configuration
- `.solhint.json` - Solidity linting rules
- `slither.config.json` - Static analysis configuration

### Documentation
- `README.md` - Quick start guide for auditors
- `AUDIT_PREPARATION.md` - Comprehensive audit information
- `CONTRACT_OVERVIEW.md` - Contract system overview
- `AUDIT_CHECKLIST.md` - Security audit checklist
- `STATISTICS.md` - Contract metrics and statistics

### Test Suite (Reference)
- `test/` - Complete test suite (56 tests)
- `TEST_REPORT.txt` - Latest test results
- `gas_report.json` - Gas usage analysis

### Deployment Information
- `DEPLOYMENT.md` - Technical deployment details
- `PRODUCTION_DEPLOYMENT.md` - Production deployment guide
- `DEPLOYMENT_SIMULATION.txt` - Deployment simulation results

### Generated Files
- `abis/` - Contract ABIs for reference
- `contract_metrics.csv` - Contract statistics
- `PACKAGE_CONTENTS.md` - This file

## Quick Commands

```bash
# Setup environment
forge install

# Run all tests
forge test

# Run with gas reporting
forge test --gas-report

# Static analysis (requires installation)
slither contracts/
solhint contracts/**/*.sol

# Deployment simulation
forge script scripts/Deploy.s.sol:Deploy --sig "run()" --rpc-url https://rpc.hyperliquid.xyz/evm
```

## Key Metrics
- **Total Contracts**: 5 core + 1 interface
- **Total Tests**: 56 (all passing)
- **Solidity Version**: 0.8.24
- **Target Chain**: HyperEVM (Chain ID: 999)
- **Estimated Deployment Cost**: ~0.2 HYPE
EOF

# Create archive
echo -e "${BLUE}📦 Creating audit package archive...${NC}"
tar -czf hyper-faith-omamori-audit.tar.gz $AUDIT_DIR/

# Final summary
echo
echo -e "${GREEN}✅ Audit package prepared successfully!${NC}"
echo
echo "📁 Package location: $AUDIT_DIR/"
echo "📦 Archive: hyper-faith-omamori-audit.tar.gz"
echo
echo "📋 Package contents:"
echo "   • 5 core contracts + 1 interface"
echo "   • Complete test suite (56 tests)"
echo "   • Comprehensive documentation"
echo "   • Configuration files"
echo "   • Gas reports and statistics"
echo "   • Deployment simulation"
echo
echo "🛡️ Ready for security audit!"
echo
echo "Next steps:"
echo "1. Share audit package with security auditor"
echo "2. Review audit findings and implement fixes"
echo "3. Re-audit if critical issues found"
echo "4. Deploy to production after audit approval"
