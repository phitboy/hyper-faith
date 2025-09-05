#!/bin/bash

echo "🎌 Hyper Faith Omamori - Deployment Status Dashboard"
echo "==================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if addresses file exists
if [ -f "abis/addresses.json" ]; then
    # Extract addresses from JSON
    MATERIALS_ADDRESS=$(jq -r '.["999"].MaterialRegistryPalette' abis/addresses.json 2>/dev/null)
    RENDER_ADDRESS=$(jq -r '.["999"].OmamoriRender' abis/addresses.json 2>/dev/null)
    NFT_ADDRESS=$(jq -r '.["999"].OmamoriNFT' abis/addresses.json 2>/dev/null)
    
    if [ "$MATERIALS_ADDRESS" != "null" ] && [ "$RENDER_ADDRESS" != "null" ] && [ "$NFT_ADDRESS" != "null" ]; then
        DEPLOYED=true
    else
        DEPLOYED=false
    fi
else
    DEPLOYED=false
fi

RPC_URL="https://rpc.hyperliquid.xyz/evm"

echo
if [ "$DEPLOYED" = true ]; then
    echo -e "${GREEN}📍 CONTRACTS DEPLOYED${NC}"
    echo "Materials: $MATERIALS_ADDRESS"
    echo "Render:    $RENDER_ADDRESS"
    echo "NFT:       $NFT_ADDRESS"
else
    echo -e "${YELLOW}📍 CONTRACTS NOT DEPLOYED${NC}"
    echo "Run deployment script to deploy contracts"
fi

echo
echo -e "${CYAN}📊 SYSTEM STATUS${NC}"
echo "==============="

# Test suite status
echo -n "Test Suite: "
if forge test --quiet >/dev/null 2>&1; then
    TEST_COUNT=$(forge test --quiet 2>&1 | grep -o '[0-9]* tests passed' | grep -o '[0-9]*' | head -1)
    echo -e "${GREEN}✓ $TEST_COUNT tests passing${NC}"
else
    echo -e "${RED}✗ Tests failing${NC}"
fi

# Compilation status
echo -n "Compilation: "
if forge build --quiet >/dev/null 2>&1; then
    echo -e "${GREEN}✓ All contracts compile${NC}"
else
    echo -e "${RED}✗ Compilation errors${NC}"
fi

# Network connectivity
echo -n "HyperEVM RPC: "
if curl -s -X POST -H "Content-Type: application/json" \
   --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
   https://rpc.hyperliquid.xyz/evm | grep -q "0x3e7" 2>/dev/null; then
    echo -e "${GREEN}✓ Connected (Chain ID: 999)${NC}"
else
    echo -e "${RED}✗ Connection failed${NC}"
fi

if [ "$DEPLOYED" = true ]; then
    echo
    echo -e "${CYAN}📈 CONTRACT METRICS${NC}"
    echo "=================="
    
    # Total supply
    echo -n "Total Supply: "
    TOTAL_SUPPLY=$(cast call $NFT_ADDRESS "totalSupply()" --rpc-url $RPC_URL 2>/dev/null)
    if [ -n "$TOTAL_SUPPLY" ]; then
        SUPPLY_DEC=$(cast --to-dec $TOTAL_SUPPLY 2>/dev/null)
        echo -e "${BLUE}$SUPPLY_DEC NFTs minted${NC}"
    else
        echo -e "${YELLOW}Unable to fetch${NC}"
    fi
    
    # Burn mode
    echo -n "Burn Mode: "
    BURN_MODE=$(cast call $NFT_ADDRESS "burnMode()" --rpc-url $RPC_URL 2>/dev/null)
    if [ "$BURN_MODE" = "0x0000000000000000000000000000000000000000000000000000000000000000" ]; then
        echo -e "${BLUE}ERC-20 Mode${NC}"
    elif [ "$BURN_MODE" = "0x0000000000000000000000000000000000000000000000000000000000000001" ]; then
        echo -e "${BLUE}Native Mode${NC}"
    else
        echo -e "${YELLOW}Unknown${NC}"
    fi
    
    # Contract owner
    echo -n "NFT Owner: "
    NFT_OWNER=$(cast call $NFT_ADDRESS "owner()" --rpc-url $RPC_URL 2>/dev/null)
    if [ -n "$NFT_OWNER" ]; then
        OWNER_ADDR="0x$(echo $NFT_OWNER | cut -c27-66)"
        echo -e "${BLUE}${OWNER_ADDR:0:10}...${NC}"
    else
        echo -e "${YELLOW}Unable to fetch${NC}"
    fi
    
    # Material registry status
    echo -n "Materials: "
    TOTAL_WEIGHT=$(cast call $MATERIALS_ADDRESS "totalWeight()" --rpc-url $RPC_URL 2>/dev/null)
    if [ "$TOTAL_WEIGHT" = "0x000000000000000000000000000000000000000000000000000000003b9aca00" ]; then
        echo -e "${GREEN}✓ 24 materials, 1B total weight${NC}"
    else
        echo -e "${YELLOW}Configuration issue${NC}"
    fi
fi

echo
echo -e "${CYAN}🔗 INTEGRATION STATUS${NC}"
echo "===================="

# Frontend integration package
echo -n "Integration Package: "
if [ -d "frontend-integration" ] && [ -f "frontend-integration/package.json" ]; then
    echo -e "${GREEN}✓ Ready${NC}"
else
    echo -e "${YELLOW}Not found${NC}"
fi

# ABI files
echo -n "ABI Files: "
ABI_COUNT=$(find abis -name "*.json" 2>/dev/null | wc -l)
if [ "$ABI_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ $ABI_COUNT files generated${NC}"
else
    echo -e "${YELLOW}Not generated${NC}"
fi

# Deployment scripts
echo -n "Deployment Scripts: "
if [ -f "scripts/Deploy.s.sol" ] && [ -x "scripts/pre-deployment-check.sh" ]; then
    echo -e "${GREEN}✓ Ready${NC}"
else
    echo -e "${YELLOW}Missing files${NC}"
fi

if [ "$DEPLOYED" = true ]; then
    echo
    echo -e "${CYAN}🌐 EXPLORER LINKS${NC}"
    echo "================="
    echo "Materials: https://explorer.hyperliquid.xyz/address/$MATERIALS_ADDRESS"
    echo "Render:    https://explorer.hyperliquid.xyz/address/$RENDER_ADDRESS"
    echo "NFT:       https://explorer.hyperliquid.xyz/address/$NFT_ADDRESS"
    
    echo
    echo -e "${CYAN}⚡ QUICK ACTIONS${NC}"
    echo "==============="
    echo "# Test mint (replace with your private key):"
    echo "cast send $NFT_ADDRESS \"mint(uint8,uint8,uint256)\" 0 0 10000000000000000 \\"
    echo "  --private-key \$PRIVATE_KEY --rpc-url $RPC_URL"
    echo
    echo "# Check token URI:"
    echo "cast call $NFT_ADDRESS \"tokenURI(uint256)\" 1 --rpc-url $RPC_URL"
    echo
    echo "# Update frontend addresses:"
    echo "node scripts/update-addresses.js $MATERIALS_ADDRESS $RENDER_ADDRESS $NFT_ADDRESS"
else
    echo
    echo -e "${CYAN}🚀 DEPLOYMENT COMMANDS${NC}"
    echo "====================="
    echo "# Pre-deployment check:"
    echo "./scripts/pre-deployment-check.sh"
    echo
    echo "# Deploy contracts:"
    echo "forge script scripts/Deploy.s.sol:Deploy --sig \"run()\" \\"
    echo "  --rpc-url https://rpc.hyperliquid.xyz/evm --broadcast --verify"
    echo
    echo "# Verify deployment:"
    echo "./scripts/verify-deployment.sh <materials> <render> <nft>"
fi

echo
echo -e "${CYAN}📚 DOCUMENTATION${NC}"
echo "================"
echo "• PRODUCTION_DEPLOYMENT.md - Complete deployment guide"
echo "• FRONTEND_INTEGRATION.md  - Frontend integration guide"  
echo "• DEPLOYMENT.md           - Technical deployment details"
echo "• contracts/README.md     - Contract system overview"

echo
echo -e "${CYAN}📞 SUPPORT${NC}"
echo "=========="
echo "• GitHub Issues: Create issue for bugs or questions"
echo "• Documentation: Check guides for common solutions"
echo "• Test Suite: Run 'forge test' for contract validation"

# System health summary
echo
echo -e "${CYAN}🏥 SYSTEM HEALTH${NC}"
echo "==============="

HEALTH_SCORE=0
TOTAL_CHECKS=6

# Test suite
if forge test --quiet >/dev/null 2>&1; then
    HEALTH_SCORE=$((HEALTH_SCORE + 1))
fi

# Compilation
if forge build --quiet >/dev/null 2>&1; then
    HEALTH_SCORE=$((HEALTH_SCORE + 1))
fi

# Network
if curl -s -X POST -H "Content-Type: application/json" \
   --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
   https://rpc.hyperliquid.xyz/evm | grep -q "0x3e7" 2>/dev/null; then
    HEALTH_SCORE=$((HEALTH_SCORE + 1))
fi

# Integration package
if [ -d "frontend-integration" ]; then
    HEALTH_SCORE=$((HEALTH_SCORE + 1))
fi

# ABI files
if [ "$ABI_COUNT" -gt 0 ]; then
    HEALTH_SCORE=$((HEALTH_SCORE + 1))
fi

# Deployment readiness
if [ -f "scripts/Deploy.s.sol" ]; then
    HEALTH_SCORE=$((HEALTH_SCORE + 1))
fi

HEALTH_PERCENT=$((HEALTH_SCORE * 100 / TOTAL_CHECKS))

if [ $HEALTH_PERCENT -ge 90 ]; then
    echo -e "${GREEN}🟢 Excellent ($HEALTH_PERCENT%) - Ready for production${NC}"
elif [ $HEALTH_PERCENT -ge 70 ]; then
    echo -e "${YELLOW}🟡 Good ($HEALTH_PERCENT%) - Minor issues to address${NC}"
else
    echo -e "${RED}🔴 Poor ($HEALTH_PERCENT%) - Significant issues need fixing${NC}"
fi

echo
echo "Last updated: $(date)"
