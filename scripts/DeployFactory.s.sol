// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/MaterialRegistryFactory.sol";
import "../contracts/OmamoriRender.sol";
import "../contracts/OmamoriNFT.sol";

/**
 * @title DeployFactory
 * @notice Factory-based deployment script optimized for HyperEVM 2M gas limit
 * @dev Deploys contracts in stages to fit within block gas limits
 */
contract DeployFactory is Script {
    
    // Deployment configuration
    struct DeployConfig {
        address hypeToken;      // HYPE ERC-20 token address (if using ERC-20 mode)
        address initialOwner;   // Initial owner of the NFT contract
        bool useNativeMode;     // Whether to use native HYPE mode initially
    }
    
    // Deployed contract addresses
    struct DeployedContracts {
        address materials;
        address renderer;
        address nft;
    }
    
    function run() public returns (DeployedContracts memory) {
        // Get deployment configuration from environment or use defaults
        DeployConfig memory config = getDeployConfig();
        
        // Start broadcasting transactions
        vm.startBroadcast();
        
        console.log("=== Deploying Omamori System (Factory Pattern) ===");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", msg.sender);
        console.log("Initial Owner:", config.initialOwner);
        
        // 1. Deploy MaterialRegistryFactory
        console.log("\n1. Deploying MaterialRegistryFactory...");
        MaterialRegistryFactory materials = new MaterialRegistryFactory(config.initialOwner);
        console.log("MaterialRegistryFactory deployed at:", address(materials));
        
        vm.stopBroadcast();
        
        console.log("\n=== DEPLOYMENT PHASE 1 COMPLETE ===");
        console.log("Next steps:");
        console.log("1. Initialize materials in batches:");
        console.log("   - Run initializeBatch(0, 5)");
        console.log("   - Run initializeBatch(5, 10)");
        console.log("   - Run initializeBatch(10, 15)");
        console.log("   - Run initializeBatch(15, 20)");
        console.log("   - Run initializeBatch(20, 24)");
        console.log("   - Run finalizeInitialization()");
        console.log("2. Deploy remaining contracts with deployPhase2()");
        
        return DeployedContracts({
            materials: address(materials),
            renderer: address(0),
            nft: address(0)
        });
    }
    
    function deployPhase2(address materialsAddress) public returns (DeployedContracts memory) {
        DeployConfig memory config = getDeployConfig();
        
        vm.startBroadcast();
        
        console.log("=== Deploying Phase 2: Renderer and NFT ===");
        
        // 2. Deploy OmamoriRender
        console.log("\n2. Deploying OmamoriRender...");
        OmamoriRender renderer = new OmamoriRender(materialsAddress);
        console.log("OmamoriRender deployed at:", address(renderer));
        
        // 3. Deploy OmamoriNFT
        console.log("\n3. Deploying OmamoriNFT...");
        OmamoriNFT nft = new OmamoriNFT(
            config.hypeToken,
            address(renderer),
            materialsAddress,
            config.initialOwner
        );
        console.log("OmamoriNFT deployed at:", address(nft));
        
        // 4. Configure initial settings (if deployer is owner)
        console.log("\n4. Configuring initial settings...");
        if (msg.sender == config.initialOwner) {
            if (config.useNativeMode) {
                nft.setBurnMode(OmamoriNFT.BurnMode.NATIVE);
                console.log("Burn mode set to NATIVE");
            }
        } else {
            console.log("WARNING: Cannot configure - deployer is not initial owner");
        }
        
        vm.stopBroadcast();
        
        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("MaterialRegistryFactory:", materialsAddress);
        console.log("OmamoriRender:", address(renderer));
        console.log("OmamoriNFT:", address(nft));
        
        return DeployedContracts({
            materials: materialsAddress,
            renderer: address(renderer),
            nft: address(nft)
        });
    }
    
    /**
     * @notice Get deployment configuration from environment variables
     * @return DeployConfig struct with deployment parameters
     */
    function getDeployConfig() internal view returns (DeployConfig memory) {
        return DeployConfig({
            hypeToken: vm.envOr("HYPE_TOKEN", address(0)),
            initialOwner: vm.envOr("INITIAL_OWNER", msg.sender),
            useNativeMode: vm.envOr("USE_NATIVE_MODE", false)
        });
    }
}
