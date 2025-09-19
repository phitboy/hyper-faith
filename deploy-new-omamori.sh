#!/bin/bash

# Deploy New Omamori NFT Contract to HyperEVM Mainnet
# Handles big blocks and 30M gas limit properly

set -e

echo "🚀 Deploying New Omamori NFT to HyperEVM Mainnet"
echo "================================================"

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable not set"
    echo "Please set your private key: export PRIVATE_KEY=your_private_key"
    exit 1
fi

echo "✅ Private key found"

# Step 1: Enable big blocks
echo ""
echo "📦 Step 1: Enabling big blocks (30M gas limit)..."
python3 enable_big_blocks_v2.py

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Big blocks enablement failed, but continuing..."
    echo "   You may need to enable manually or deployment might fail"
else
    echo "✅ Big blocks enabled successfully"
fi

# Wait a moment for the setting to propagate
echo "⏳ Waiting 5 seconds for settings to propagate..."
sleep 5

# Step 2: Deploy the contract
echo ""
echo "🏗️  Step 2: Deploying contract..."
echo "Network: HyperEVM Mainnet (Chain ID: 999)"
echo "RPC: https://rpc.hyperliquid.xyz/evm"

# Use forge to deploy with proper gas settings
forge script scripts/DeployNewOmamori.s.sol:DeployNewOmamori \
    --rpc-url https://rpc.hyperliquid.xyz/evm \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify \
    --gas-limit 30000000 \
    --gas-price 1000000000 \
    -vvv

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment Successful!"
    echo "========================"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Copy the contract address from the output above"
    echo "2. Update Supabase environment variables:"
    echo "   - CONTRACT_ADDRESS=<new_contract_address>"
    echo "3. Update frontend wagmi config with new address"
    echo "4. Test minting functionality"
    echo ""
    echo "🔗 Useful Links:"
    echo "- HyperEVM Explorer: https://hyperevmscan.io"
    echo "- Supabase Dashboard: https://app.supabase.com"
    echo ""
else
    echo ""
    echo "❌ Deployment Failed!"
    echo "===================="
    echo ""
    echo "🔧 Troubleshooting:"
    echo "1. Check if big blocks are enabled for your address"
    echo "2. Ensure you have enough HYPE for gas fees"
    echo "3. Verify your private key is correct"
    echo "4. Check HyperEVM network status"
    echo ""
    exit 1
fi
