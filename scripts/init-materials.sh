#!/bin/bash

# Initialize all materials in the deployed MaterialRegistry
CONTRACT_ADDRESS="0xA5D308DE0Be64df79C6715418070a090195A5657"
RPC_URL="https://rpc.hyperliquid.xyz/evm"

echo "Initializing materials in MaterialRegistry at $CONTRACT_ADDRESS"

# Source environment
source .env

# Materials 3-23 (0-2 already done)
echo "Setting material 3: Clay..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 3 "Clay" "Common" "#b0643a" "#6a3d26" 50000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 4: Limestone..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 4 "Limestone" "Common" "#cfc8b7" "#6f6a5c" 50000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 5: Slate..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 5 "Slate" "Uncommon" "#4b4f59" "#b8bdc9" 100000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 6: Basalt..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 6 "Basalt" "Uncommon" "#3e3b3a" "#b3ada9" 80000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 7: Granite..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 7 "Granite" "Uncommon" "#8b8e95" "#2e3138" 80000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 8: Marble..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 8 "Marble" "Uncommon" "#e6e6ea" "#6e6e78" 40000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 9: Bronze..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 9 "Bronze" "Uncommon" "#8c6e3d" "#f1c277" 30000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 10: Obsidian..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 10 "Obsidian" "Uncommon" "#111216" "#8f8f99" 20000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 11: Silver..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 11 "Silver" "Rare" "#c0c0c0" "#5b5b5b" 15000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 12: Jade..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 12 "Jade" "Rare" "#2f6e5b" "#a7e0cc" 10000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 13: Crystal..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 13 "Crystal" "Rare" "#e8f2ff" "#7aa0c8" 10000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 14: Onyx..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 14 "Onyx" "Rare" "#1a1a1a" "#9c9c9c" 7000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 15: Amber..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 15 "Amber" "Rare" "#c37a3a" "#ffd08a" 7000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 16: Amethyst..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 16 "Amethyst" "Ultra Rare" "#5d3b8a" "#c8b1ff" 400000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 17: Opal..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 17 "Opal" "Ultra Rare" "#d9ecff" "#9fd5ff" 200000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 18: Emerald..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 18 "Emerald" "Ultra Rare" "#1f7a44" "#9af0bf" 150000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 19: Sapphire..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 19 "Sapphire" "Ultra Rare" "#143a8a" "#88b0ff" 120000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 20: Ruby..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 20 "Ruby" "Ultra Rare" "#8a1423" "#ff98a6" 80000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 21: Lapis Lazuli..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 21 "Lapis Lazuli" "Ultra Rare" "#1b3b8a" "#c0d0ff" 49000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 22: Gold..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 22 "Gold" "Mythic" "#d4af37" "#5a4b10" 50 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Setting material 23: Meteorite..."
cast send $CONTRACT_ADDRESS "setMaterial(uint16,string,string,string,string,uint256)" 23 "Meteorite" "Mythic" "#5a5752" "#d7d3cc" 50 --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "Finalizing MaterialRegistry..."
cast send $CONTRACT_ADDRESS "finalize()" --rpc-url $RPC_URL --private-key $PRIVATE_KEY

echo "✅ All materials initialized and registry finalized!"
