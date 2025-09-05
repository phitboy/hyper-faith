#!/bin/bash

# Extract ABIs for Frontend Integration
# This script extracts ABI files from Foundry artifacts for wagmi codegen

echo "=== Extracting ABIs for Frontend ==="

# Ensure abis directory exists
mkdir -p abis

# Extract ABI from each contract's JSON artifact using jq
echo "Extracting MaterialRegistryPalette ABI..."
jq '.abi' out/MaterialRegistryPalette.sol/MaterialRegistryPalette.json > abis/MaterialRegistryPalette.json

echo "Extracting OmamoriRender ABI..."
jq '.abi' out/OmamoriRender.sol/OmamoriRender.json > abis/OmamoriRender.json

echo "Extracting OmamoriNFT ABI..."
jq '.abi' out/OmamoriNFT.sol/OmamoriNFT.json > abis/OmamoriNFT.json

echo "Extracting IMaterials interface ABI..."
jq '.abi' out/IMaterials.sol/IMaterials.json > abis/IMaterials.json

# Create a combined contract addresses file for frontend
echo "Creating contract addresses template..."
cat > abis/addresses.json << EOF
{
  "999": {
    "MaterialRegistryPalette": "0x0000000000000000000000000000000000000000",
    "OmamoriRender": "0x0000000000000000000000000000000000000000",
    "OmamoriNFT": "0x0000000000000000000000000000000000000000"
  }
}
EOF

echo "✓ ABI extraction completed"
echo "✓ Files written to ./abis/ directory"
echo "✓ Contract addresses template created"
echo ""
echo "Next steps:"
echo "1. Deploy contracts and update addresses in abis/addresses.json"
echo "2. Run wagmi codegen to generate TypeScript types"
echo "3. Update frontend to use real contract calls"
