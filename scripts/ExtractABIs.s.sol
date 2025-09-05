// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/MaterialRegistryPalette.sol";
import "../contracts/OmamoriRender.sol";
import "../contracts/OmamoriNFT.sol";
import "../interfaces/IMaterials.sol";

/**
 * @title ExtractABIs
 * @notice Script to extract ABIs for frontend integration
 * @dev Generates ABI files in the /abis directory for wagmi codegen
 */
contract ExtractABIs is Script {
    
    function run() external {
        console.log("=== Extracting ABIs for Frontend ===");
        
        // Extract ABIs using forge's built-in functionality
        // The actual ABI extraction is done via the extractABIs() function below
        // which uses vm.writeJson to write ABI files
        
        extractABIs();
        
        console.log("✓ ABI extraction completed");
        console.log("Files written to ./abis/ directory");
        console.log("\nNext steps:");
        console.log("1. Run 'npm run wagmi:generate' to generate TypeScript types");
        console.log("2. Update frontend contract addresses");
        console.log("3. Replace mock functions with real contract calls");
    }
    
    /**
     * @notice Extract ABIs for all contracts
     */
    function extractABIs() internal {
        // Get contract artifacts and extract ABIs
        string memory materialsABI = vm.readFile("./out/MaterialRegistryPalette.sol/MaterialRegistryPalette.json");
        string memory renderABI = vm.readFile("./out/OmamoriRender.sol/OmamoriRender.json");
        string memory nftABI = vm.readFile("./out/OmamoriNFT.sol/OmamoriNFT.json");
        string memory interfaceABI = vm.readFile("./out/IMaterials.sol/IMaterials.json");
        
        // Write individual ABI files for frontend consumption
        vm.writeFile("./abis/MaterialRegistryPalette.json", materialsABI);
        vm.writeFile("./abis/OmamoriRender.json", renderABI);
        vm.writeFile("./abis/OmamoriNFT.json", nftABI);
        vm.writeFile("./abis/IMaterials.json", interfaceABI);
        
        console.log("✓ MaterialRegistryPalette ABI extracted");
        console.log("✓ OmamoriRender ABI extracted");
        console.log("✓ OmamoriNFT ABI extracted");
        console.log("✓ IMaterials interface ABI extracted");
    }
}
