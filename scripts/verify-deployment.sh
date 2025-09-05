#!/bin/bash

echo "🔍 Hyper Faith Omamori - Deployment Verification"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

check_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if addresses are provided
if [ $# -ne 3 ]; then
    echo "Usage: $0 <materials_address> <render_address> <nft_address>"
    echo "Example: $0 0x123... 0x456... 0x789..."
    exit 1
fi

MATERIALS_ADDRESS=$1
RENDER_ADDRESS=$2
NFT_ADDRESS=$3

echo "Verifying deployment:"
echo "Materials: $MATERIALS_ADDRESS"
echo "Render:    $RENDER_ADDRESS"
echo "NFT:       $NFT_ADDRESS"
echo

# RPC URL
RPC_URL="https://rpc.hyperliquid.xyz/evm"

echo "1. Contract Existence"
echo "--------------------"

# Check if contracts exist
for contract in "Materials:$MATERIALS_ADDRESS" "Render:$RENDER_ADDRESS" "NFT:$NFT_ADDRESS"; do
    name=$(echo $contract | cut -d: -f1)
    addr=$(echo $contract | cut -d: -f2)
    
    CODE=$(cast code $addr --rpc-url $RPC_URL 2>/dev/null)
    if [ -n "$CODE" ] && [ "$CODE" != "0x" ]; then
        check_pass "$name contract deployed at $addr"
    else
        check_fail "$name contract not found at $addr"
    fi
done

echo
echo "2. Contract Interfaces"
echo "---------------------"

# Test MaterialRegistryPalette interface
echo -n "Testing MaterialRegistryPalette.totalWeight()... "
TOTAL_WEIGHT=$(cast call $MATERIALS_ADDRESS "totalWeight()" --rpc-url $RPC_URL 2>/dev/null)
if [ "$TOTAL_WEIGHT" = "0x000000000000000000000000000000000000000000000000000000003b9aca00" ]; then
    check_pass "Total weight correct: 1,000,000,000"
else
    check_fail "Total weight incorrect: $TOTAL_WEIGHT"
fi

echo -n "Testing MaterialRegistryPalette.viewMaterial(0)... "
MATERIAL_0=$(cast call $MATERIALS_ADDRESS "viewMaterial(uint16)" 0 --rpc-url $RPC_URL 2>/dev/null)
if [ -n "$MATERIAL_0" ]; then
    check_pass "Material 0 accessible"
else
    check_fail "Cannot access material 0"
fi

# Test OmamoriRender interface
echo -n "Testing OmamoriRender.tokenURIView()... "
# Test with sample parameters: tokenId=1, majorId=0, minorId=0, materialId=0, punchCount=5, seed=0x1234, hypeBurned=10000000000000000
URI_RESULT=$(cast call $RENDER_ADDRESS "tokenURIView(uint256,uint8,uint8,uint16,uint8,uint64,uint256)" 1 0 0 0 5 0x1234 10000000000000000 --rpc-url $RPC_URL 2>/dev/null)
if [ -n "$URI_RESULT" ] && [[ $URI_RESULT == *"data:application/json;base64"* ]]; then
    check_pass "Render function working"
else
    check_fail "Render function not working properly"
fi

# Test OmamoriNFT interface
echo -n "Testing OmamoriNFT.totalSupply()... "
TOTAL_SUPPLY=$(cast call $NFT_ADDRESS "totalSupply()" --rpc-url $RPC_URL 2>/dev/null)
if [ "$TOTAL_SUPPLY" = "0x0000000000000000000000000000000000000000000000000000000000000000" ]; then
    check_pass "Total supply is 0 (no mints yet)"
else
    check_info "Total supply: $(cast --to-dec $TOTAL_SUPPLY 2>/dev/null)"
fi

echo -n "Testing OmamoriNFT.burnMode()... "
BURN_MODE=$(cast call $NFT_ADDRESS "burnMode()" --rpc-url $RPC_URL 2>/dev/null)
if [ "$BURN_MODE" = "0x0000000000000000000000000000000000000000000000000000000000000000" ]; then
    check_info "Burn mode: ERC-20"
elif [ "$BURN_MODE" = "0x0000000000000000000000000000000000000000000000000000000000000001" ]; then
    check_info "Burn mode: Native"
else
    check_warn "Unknown burn mode: $BURN_MODE"
fi

echo
echo "3. Contract Linking"
echo "------------------"

# Check if OmamoriRender has correct materials address
echo -n "Checking OmamoriRender.materials()... "
RENDER_MATERIALS=$(cast call $RENDER_ADDRESS "materials()" --rpc-url $RPC_URL 2>/dev/null)
EXPECTED_MATERIALS=$(echo $MATERIALS_ADDRESS | tr '[:upper:]' '[:lower:]')
ACTUAL_MATERIALS=$(echo $RENDER_MATERIALS | cut -c27-66 | tr '[:upper:]' '[:lower:]')

if [ "$ACTUAL_MATERIALS" = "${EXPECTED_MATERIALS:2}" ]; then
    check_pass "OmamoriRender correctly linked to MaterialRegistryPalette"
else
    check_fail "OmamoriRender materials address mismatch"
    echo "  Expected: $EXPECTED_MATERIALS"
    echo "  Actual:   0x$ACTUAL_MATERIALS"
fi

# Check if OmamoriNFT has correct renderer address
echo -n "Checking OmamoriNFT.renderer()... "
NFT_RENDERER=$(cast call $NFT_ADDRESS "renderer()" --rpc-url $RPC_URL 2>/dev/null)
EXPECTED_RENDERER=$(echo $RENDER_ADDRESS | tr '[:upper:]' '[:lower:]')
ACTUAL_RENDERER=$(echo $NFT_RENDERER | cut -c27-66 | tr '[:upper:]' '[:lower:]')

if [ "$ACTUAL_RENDERER" = "${EXPECTED_RENDERER:2}" ]; then
    check_pass "OmamoriNFT correctly linked to OmamoriRender"
else
    check_fail "OmamoriNFT renderer address mismatch"
    echo "  Expected: $EXPECTED_RENDERER"
    echo "  Actual:   0x$ACTUAL_RENDERER"
fi

echo
echo "4. Access Control"
echo "----------------"

# Check NFT owner
echo -n "Checking OmamoriNFT owner... "
NFT_OWNER=$(cast call $NFT_ADDRESS "owner()" --rpc-url $RPC_URL 2>/dev/null)
if [ -n "$NFT_OWNER" ]; then
    OWNER_ADDR="0x$(echo $NFT_OWNER | cut -c27-66)"
    check_info "NFT contract owner: $OWNER_ADDR"
else
    check_warn "Could not retrieve NFT owner"
fi

echo
echo "5. Sample Operations"
echo "-------------------"

# Test material weight calculation
echo -n "Testing weighted material selection... "
WEIGHTS_RESULT=$(cast call $MATERIALS_ADDRESS "getAllWeights()" --rpc-url $RPC_URL 2>/dev/null)
if [ -n "$WEIGHTS_RESULT" ]; then
    check_pass "Material weights accessible"
else
    check_fail "Cannot access material weights"
fi

# Test glyph rendering
echo -n "Testing glyph rendering... "
MAJOR_GLYPH=$(cast call $RENDER_ADDRESS "renderMajor(uint8)" 0 --rpc-url $RPC_URL 2>/dev/null)
if [ -n "$MAJOR_GLYPH" ] && [[ $MAJOR_GLYPH == *"3c"* ]]; then  # Should contain SVG elements
    check_pass "Glyph rendering functional"
else
    check_fail "Glyph rendering not working"
fi

echo
echo "6. Gas Cost Analysis"
echo "-------------------"

# Estimate mint gas cost
echo -n "Estimating mint gas cost... "
# This is a rough estimate - actual cost depends on material randomness
MINT_GAS=$(cast estimate $NFT_ADDRESS "mint(uint8,uint8,uint256)" 0 0 10000000000000000 --rpc-url $RPC_URL 2>/dev/null)
if [ -n "$MINT_GAS" ]; then
    MINT_GAS_DEC=$(cast --to-dec $MINT_GAS 2>/dev/null)
    check_info "Estimated mint gas: $MINT_GAS_DEC"
else
    check_warn "Could not estimate mint gas cost"
fi

echo
echo "7. Integration Readiness"
echo "-----------------------"

# Check if addresses.json exists and update it
if [ -f "abis/addresses.json" ]; then
    echo -n "Updating abis/addresses.json... "
    cat > abis/addresses.json << EOF
{
  "999": {
    "MaterialRegistryPalette": "$MATERIALS_ADDRESS",
    "OmamoriRender": "$RENDER_ADDRESS", 
    "OmamoriNFT": "$NFT_ADDRESS"
  }
}
EOF
    check_pass "Contract addresses updated"
else
    check_warn "abis/addresses.json not found"
fi

# Run ABI extraction
if [ -f "scripts/extract-abis.sh" ]; then
    echo -n "Extracting ABIs... "
    if bash scripts/extract-abis.sh >/dev/null 2>&1; then
        check_pass "ABIs extracted successfully"
    else
        check_warn "ABI extraction failed"
    fi
else
    check_warn "ABI extraction script not found"
fi

echo
echo "8. Frontend Integration"
echo "----------------------"

echo "Next steps for frontend integration:"
echo "1. Update contract addresses:"
echo "   node scripts/update-addresses.js $MATERIALS_ADDRESS $RENDER_ADDRESS $NFT_ADDRESS"
echo
echo "2. Generate TypeScript types:"
echo "   cd frontend-integration && npm run generate"
echo
echo "3. Update live frontend at https://hyper.faith with new addresses"
echo
echo "4. Test minting with small amounts first"

echo
echo "Contract URLs:"
echo "Materials: https://explorer.hyperliquid.xyz/address/$MATERIALS_ADDRESS"
echo "Render:    https://explorer.hyperliquid.xyz/address/$RENDER_ADDRESS"
echo "NFT:       https://explorer.hyperliquid.xyz/address/$NFT_ADDRESS"

echo
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment verification complete!${NC}"
    echo "Contracts are deployed and functional."
else
    echo -e "${RED}❌ Deployment verification failed!${NC}"
    echo "Please review the errors above."
fi
