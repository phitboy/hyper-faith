// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/MaterialRegistryPalette.sol";
import "../contracts/OmamoriRender.sol";
import "../contracts/OmamoriNFT.sol";

/**
 * @title Deploy
 * @notice Deployment script for the complete Omamori system
 * @dev Deploys all contracts in correct order and configures them
 */
contract Deploy is Script {
    
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
        
        console.log("=== Deploying Omamori System ===");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", msg.sender);
        console.log("Initial Owner:", config.initialOwner);
        
        // 1. Deploy MaterialRegistryPalette
        console.log("\n1. Deploying MaterialRegistryPalette...");
        MaterialRegistryPalette materials = new MaterialRegistryPalette();
        console.log("MaterialRegistryPalette deployed at:", address(materials));
        
        // Verify materials deployment
        require(materials.totalWeight() == 1_000_000_000, "Materials total weight incorrect");
        console.log("Materials total weight verified:", materials.totalWeight());
        
        // 2. Deploy OmamoriRender
        console.log("\n2. Deploying OmamoriRender...");
        OmamoriRender renderer = new OmamoriRender(address(materials));
        console.log("OmamoriRender deployed at:", address(renderer));
        
        // Verify renderer deployment
        require(address(renderer.materials()) == address(materials), "Renderer materials mismatch");
        console.log("Renderer materials reference verified");
        
        // 3. Deploy OmamoriNFT
        console.log("\n3. Deploying OmamoriNFT...");
        OmamoriNFT nft = new OmamoriNFT(
            config.hypeToken,
            address(renderer),
            address(materials),
            config.initialOwner
        );
        console.log("OmamoriNFT deployed at:", address(nft));
        
        // Verify NFT deployment
        require(address(nft.renderer()) == address(renderer), "NFT renderer mismatch");
        require(address(nft.materials()) == address(materials), "NFT materials mismatch");
        require(nft.owner() == config.initialOwner, "NFT owner mismatch");
        console.log("NFT contract references verified");
        
        // 4. Configure initial settings
        console.log("\n4. Configuring initial settings...");
        
        if (config.useNativeMode) {
            // Switch to native HYPE mode if requested
            if (msg.sender == config.initialOwner) {
                nft.setBurnMode(OmamoriNFT.BurnMode.NATIVE);
                console.log("Burn mode set to NATIVE");
            } else {
                console.log("WARNING: Cannot set burn mode - deployer is not initial owner");
            }
        } else {
            console.log("Using default ERC-20 burn mode");
            if (config.hypeToken != address(0)) {
                console.log("HYPE token configured:", config.hypeToken);
            } else {
                console.log("WARNING: HYPE token not configured - set before using ERC-20 mode");
            }
        }
        
        // 5. Test basic functionality
        console.log("\n5. Testing basic functionality...");
        
        // Test materials access
        IMaterials.MaterialView memory wood = materials.viewMaterial(0);
        require(keccak256(bytes(wood.name)) == keccak256(bytes("Wood")), "Wood material incorrect");
        console.log("Materials access test passed");
        
        // Test renderer (this will be expensive but ensures it works)
        try renderer.tokenURIView(1, 0, 0, 0, 5, 12345, 1e18) returns (string memory uri) {
            require(bytes(uri).length > 0, "Empty URI generated");
            console.log("Renderer test passed - URI length:", bytes(uri).length);
        } catch {
            console.log("WARNING: Renderer test failed - check gas limits");
        }
        
        vm.stopBroadcast();
        
        // 6. Print deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("MaterialRegistryPalette:", address(materials));
        console.log("OmamoriRender:", address(renderer));
        console.log("OmamoriNFT:", address(nft));
        console.log("Burn Address:", nft.BURN_ADDRESS());
        console.log("Min Burn Amount:", nft.MIN_BURN());
        console.log("Current Burn Mode:", uint256(nft.burnMode()));
        
        console.log("\n=== Next Steps ===");
        console.log("1. Verify contracts on block explorer");
        console.log("2. Update frontend with new contract addresses");
        console.log("3. Configure HYPE token address if using ERC-20 mode");
        console.log("4. Test minting functionality");
        
        return DeployedContracts({
            materials: address(materials),
            renderer: address(renderer),
            nft: address(nft)
        });
    }
    
    /**
     * @notice Get deployment configuration from environment variables
     * @return config Deployment configuration struct
     */
    function getDeployConfig() internal view returns (DeployConfig memory config) {
        // Try to get HYPE token address from environment
        try vm.envAddress("HYPE_TOKEN") returns (address hypeToken) {
            config.hypeToken = hypeToken;
        } catch {
            config.hypeToken = address(0); // Will need to be set later
        }
        
        // Try to get initial owner from environment, default to deployer
        try vm.envAddress("INITIAL_OWNER") returns (address initialOwner) {
            config.initialOwner = initialOwner;
        } catch {
            config.initialOwner = msg.sender;
        }
        
        // Try to get burn mode preference from environment
        try vm.envBool("USE_NATIVE_MODE") returns (bool useNative) {
            config.useNativeMode = useNative;
        } catch {
            config.useNativeMode = false; // Default to ERC-20 mode
        }
        
        return config;
    }
    
    /**
     * @notice Deploy to local testnet (for testing)
     */
    function deployLocal() external returns (DeployedContracts memory) {
        // Override config for local testing
        vm.setEnv("INITIAL_OWNER", vm.toString(msg.sender));
        vm.setEnv("USE_NATIVE_MODE", "true");
        
        return run();
    }
    
    /**
     * @notice Deploy to HyperEVM mainnet
     */
    function deployMainnet() external returns (DeployedContracts memory) {
        require(block.chainid == 999, "Must be on HyperEVM mainnet");
        
        // Ensure critical environment variables are set
        address hypeToken = vm.envAddress("HYPE_TOKEN");
        address initialOwner = vm.envAddress("INITIAL_OWNER");
        
        require(hypeToken != address(0), "HYPE_TOKEN must be set for mainnet");
        require(initialOwner != address(0), "INITIAL_OWNER must be set for mainnet");
        
        console.log("=== MAINNET DEPLOYMENT ===");
        console.log("WARNING: This will deploy to HyperEVM mainnet!");
        console.log("HYPE Token:", hypeToken);
        console.log("Initial Owner:", initialOwner);
        
        return run();
    }
}
