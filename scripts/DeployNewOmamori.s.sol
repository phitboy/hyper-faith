// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/OmamoriNFT.sol";

/**
 * @title DeployNewOmamori
 * @notice Deploy the new clean Omamori NFT contract to HyperEVM mainnet
 */
contract DeployNewOmamori is Script {
    
    function run() public {
        // Configuration
        address initialOwner = 0x7FF97904C8bD597cC5f4fc1Bc0FdC403d7A1A779; // Your address
        address royaltyRecipient = 0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D; // Royalty recipient
        string memory baseTokenURI = "https://impoplixuoggwnzgvqvx.supabase.co/functions/v1/metadata/";
        
        console.log("=== Deploying New Omamori NFT Contract ===");
        console.log("Network: HyperEVM Mainnet");
        console.log("Initial Owner:", initialOwner);
        console.log("Royalty Recipient:", royaltyRecipient);
        console.log("Base URI:", baseTokenURI);
        console.log();
        
        vm.startBroadcast();
        
        console.log("Deploying OmamoriNFT...");
        
        // Deploy the contract
        OmamoriNFT omamoriNFT = new OmamoriNFT(
            initialOwner,
            royaltyRecipient,
            baseTokenURI
        );
        
        console.log("Contract deployed successfully!");
        console.log("Contract Address:", address(omamoriNFT));
        console.log();
        
        // Verify deployment
        console.log("Verifying deployment...");
        string memory name = omamoriNFT.name();
        string memory symbol = omamoriNFT.symbol();
        address owner = omamoriNFT.owner();
        uint256 minBurn = omamoriNFT.MIN_BURN();
        address burnAddress = omamoriNFT.BURN_ADDRESS();
        
        console.log("- Name:", name);
        console.log("- Symbol:", symbol);
        console.log("- Owner:", owner);
        console.log("- Min Burn:", minBurn, "wei (0.01 HYPE)");
        console.log("- Burn Address:", burnAddress);
        console.log();
        
        // Test basic functionality
        console.log("Testing contract functions...");
        
        // Check royalty info
        (address royaltyAddr, uint256 royaltyAmount) = omamoriNFT.royaltyInfo(1, 1 ether);
        console.log("- Royalty Address:", royaltyAddr);
        console.log("- Royalty Amount (for 1 ETH):", royaltyAmount, "wei (5%)");
        
        vm.stopBroadcast();
        
        console.log();
        console.log("Deployment Complete!");
        console.log();
        console.log("Next Steps:");
        console.log("1. Update Supabase CONTRACT_ADDRESS environment variable");
        console.log("2. Update frontend contract address in wagmi config");
        console.log("3. Test minting functionality");
        console.log("4. Verify contract on HyperEVM explorer");
        console.log();
        console.log("Contract Address:", address(omamoriNFT));
    }
}
