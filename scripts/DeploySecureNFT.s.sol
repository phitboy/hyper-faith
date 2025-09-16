// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/OmamoriNFTSecure.sol";

/**
 * @title Deploy Secure Omamori NFT Contract
 * @notice Deploys OmamoriNFTSecure with proper randomness and fair rarity distribution
 */
contract DeploySecureNFT is Script {
    function run() external {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address initialOwner = vm.envAddress("INITIAL_OWNER");
        
        // Royalty recipient (same as before)
        address royaltyRecipient = 0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D;
        
        console.log("=== DEPLOYING SECURE OMAMORI NFT ===");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Initial Owner:", initialOwner);
        console.log("Royalty Recipient:", royaltyRecipient);
        console.log("Royalty Rate: 5%");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy secure contract
        OmamoriNFTSecure secureNFT = new OmamoriNFTSecure(
            initialOwner,
            royaltyRecipient
        );
        
        vm.stopBroadcast();
        
        console.log("=== DEPLOYMENT SUCCESSFUL ===");
        console.log("OmamoriNFTSecure deployed at:", address(secureNFT));
        console.log("");
        console.log("SECURITY FEATURES:");
        console.log("- Pure randomness (no HYPE influence)");
        console.log("- Fair rarity: 50% Common, 25% Uncommon, 15% Rare, 7.5% Ultra, 2.5% Mythic");
        console.log("- EIP-2981 royalties: 5% to", royaltyRecipient);
        console.log("- Anti-gaming protection");
        console.log("");
        console.log("NEXT STEPS:");
        console.log("1. Connect to SVGAssembler:", "0xB42ac8659c9F661EB548C68e67F432cF5D2aa52c");
        console.log("2. Update frontend contract address");
        console.log("3. Test secure minting");
    }
}
