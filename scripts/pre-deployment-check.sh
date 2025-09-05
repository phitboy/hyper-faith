#!/bin/bash

echo "🎌 Hyper Faith Omamori - Pre-Deployment Checklist"
echo "=================================================="

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
    exit 1
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

check_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

echo
echo "1. Environment Setup"
echo "-------------------"

# Check if .env exists
if [ -f ".env" ]; then
    check_pass ".env file exists"
    source .env
else
    check_fail ".env file not found. Copy env.example to .env and configure it."
fi

# Check private key
if [ -n "$PRIVATE_KEY" ] && [ "$PRIVATE_KEY" != "your_private_key_here" ]; then
    check_pass "Private key configured"
else
    check_fail "Private key not configured in .env"
fi

# Check initial owner
if [ -n "$INITIAL_OWNER" ] && [ "$INITIAL_OWNER" != "0x0000000000000000000000000000000000000000" ]; then
    check_pass "Initial owner configured: $INITIAL_OWNER"
else
    check_fail "Initial owner not configured in .env"
fi

# Check HYPE token (if ERC-20 mode)
if [ "$USE_NATIVE_MODE" = "false" ]; then
    if [ -n "$HYPE_TOKEN" ] && [ "$HYPE_TOKEN" != "0x0000000000000000000000000000000000000000" ]; then
        check_pass "HYPE token address configured: $HYPE_TOKEN"
    else
        check_fail "HYPE token address required for ERC-20 mode"
    fi
else
    check_info "Using native HYPE mode - no token address needed"
fi

echo
echo "2. Foundry Setup"
echo "---------------"

# Check forge installation
if command -v forge &> /dev/null; then
    FORGE_VERSION=$(forge --version | head -n1)
    check_pass "Foundry installed: $FORGE_VERSION"
else
    check_fail "Foundry not installed. Run: curl -L https://foundry.paradigm.xyz | bash"
fi

# Check if contracts compile
echo -n "Compiling contracts... "
if forge build --quiet; then
    check_pass "Contracts compile successfully"
else
    check_fail "Contract compilation failed"
fi

echo
echo "3. Test Suite"
echo "------------"

# Run tests
echo -n "Running test suite... "
if forge test --quiet; then
    TEST_COUNT=$(forge test --quiet 2>&1 | grep -o '[0-9]* tests passed' | grep -o '[0-9]*')
    check_pass "All $TEST_COUNT tests passing"
else
    check_fail "Tests failing - fix before deployment"
fi

echo
echo "4. Gas Analysis"
echo "--------------"

# Get gas report
echo "Generating gas report..."
forge test --gas-report --quiet > gas_report.tmp 2>&1

# Extract key gas metrics
MINT_GAS=$(grep "mint" gas_report.tmp | awk '{print $4}' | head -1)
RENDER_GAS=$(grep "tokenURIView" gas_report.tmp | awk '{print $4}' | head -1)

if [ -n "$MINT_GAS" ]; then
    check_info "Mint function average gas: $MINT_GAS"
else
    check_warn "Could not extract mint gas usage"
fi

if [ -n "$RENDER_GAS" ]; then
    check_info "Render function average gas: $RENDER_GAS"
else
    check_warn "Could not extract render gas usage"
fi

rm -f gas_report.tmp

echo
echo "5. Network Connectivity"
echo "----------------------"

# Test RPC connection
echo -n "Testing HyperEVM RPC connection... "
if curl -s -X POST -H "Content-Type: application/json" \
   --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
   https://rpc.hyperliquid.xyz/evm | grep -q "0x3e7"; then
    check_pass "HyperEVM RPC accessible (Chain ID: 999)"
else
    check_fail "Cannot connect to HyperEVM RPC"
fi

# Check wallet balance (if we can derive address from private key)
if command -v cast &> /dev/null; then
    DEPLOYER_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY 2>/dev/null)
    if [ -n "$DEPLOYER_ADDRESS" ]; then
        check_info "Deployer address: $DEPLOYER_ADDRESS"
        
        BALANCE=$(cast balance $DEPLOYER_ADDRESS --rpc-url https://rpc.hyperliquid.xyz/evm 2>/dev/null)
        if [ -n "$BALANCE" ]; then
            BALANCE_ETH=$(cast --to-unit $BALANCE ether 2>/dev/null)
            if (( $(echo "$BALANCE_ETH > 0.1" | bc -l) )); then
                check_pass "Sufficient HYPE balance: $BALANCE_ETH HYPE"
            else
                check_warn "Low HYPE balance: $BALANCE_ETH HYPE (recommend >0.1 for deployment)"
            fi
        else
            check_warn "Could not check HYPE balance"
        fi
    else
        check_warn "Could not derive deployer address from private key"
    fi
else
    check_warn "Cast not available - cannot check wallet balance"
fi

echo
echo "6. Security Checks"
echo "-----------------"

# Check for common security issues
if grep -r "selfdestruct" contracts/ >/dev/null 2>&1; then
    check_warn "selfdestruct found in contracts - review carefully"
else
    check_pass "No selfdestruct calls found"
fi

if grep -r "delegatecall" contracts/ >/dev/null 2>&1; then
    check_warn "delegatecall found in contracts - review carefully"
else
    check_pass "No delegatecall usage found"
fi

# Check burn address
BURN_ADDRESS="0xfefeFEFeFEFEFEFEFeFefefefefeFEfEfefefEfe"
if grep -r "$BURN_ADDRESS" contracts/ >/dev/null 2>&1; then
    check_pass "Correct burn address configured"
else
    check_warn "Burn address not found or incorrect"
fi

echo
echo "7. Contract Size Analysis"
echo "------------------------"

# Check contract sizes
echo "Contract sizes:"
for contract in MaterialRegistryPalette OmamoriRender OmamoriNFT; do
    SIZE_BYTES=$(jq -r '.deployedBytecode.object' "out/$contract.sol/$contract.json" 2>/dev/null | wc -c)
    if [ -n "$SIZE_BYTES" ] && [ "$SIZE_BYTES" -gt 0 ]; then
        SIZE_KB=$((SIZE_BYTES / 2 / 1024))  # Convert hex chars to KB
        if [ $SIZE_KB -lt 24 ]; then
            check_pass "$contract: ${SIZE_KB}KB (within 24KB limit)"
        else
            check_warn "$contract: ${SIZE_KB}KB (approaching 24KB limit)"
        fi
    else
        check_warn "Could not determine size for $contract"
    fi
done

echo
echo "8. Final Checklist"
echo "-----------------"

echo "Before deployment, confirm:"
echo "□ Private key is for the correct wallet"
echo "□ Initial owner address is correct"
echo "□ HYPE token address is verified (if ERC-20 mode)"
echo "□ Sufficient HYPE for deployment gas costs"
echo "□ Network is HyperEVM mainnet (Chain ID: 999)"
echo "□ All tests are passing"
echo "□ Gas costs are acceptable"

echo
echo "Deployment Commands:"
echo "-------------------"
echo "# Dry run (simulation):"
echo "forge script scripts/Deploy.s.sol:Deploy --sig \"run()\" --rpc-url https://rpc.hyperliquid.xyz/evm"
echo
echo "# Actual deployment:"
echo "forge script scripts/Deploy.s.sol:Deploy --sig \"run()\" --rpc-url https://rpc.hyperliquid.xyz/evm --broadcast --verify"
echo
echo "# Update frontend addresses:"
echo "node scripts/update-addresses.js <materials> <render> <nft>"

echo
echo -e "${GREEN}✅ Pre-deployment check complete!${NC}"
echo "Review the output above and proceed with deployment when ready."
