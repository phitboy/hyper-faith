// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/OmamoriNFTOffChain.sol";

contract DeployOffChain is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(string.concat("0x", privateKeyStr));
        
        address initialOwner = vm.envAddress("INITIAL_OWNER");
        address royaltyRecipient = 0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D;
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=== DEPLOYING OFF-CHAIN OMAMORI NFT ===");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Initial Owner:", initialOwner);
        console.log("Royalty Recipient:", royaltyRecipient);
        
        // Deploy the off-chain contract
        OmamoriNFTOffChain nft = new OmamoriNFTOffChain(initialOwner, royaltyRecipient);
        
        console.log("SUCCESS: OmamoriNFTOffChain deployed!");
        console.log("Contract Address:", address(nft));
        console.log("Contract Name:", nft.name());
        console.log("Contract Symbol:", nft.symbol());
        console.log("Royalty Recipient:", nft.royaltyRecipient());
        console.log("Royalty Basis Points:", nft.royaltyBasisPoints());
        
        // Test material names
        console.log("Material 0:", nft.getMaterialName(0));
        console.log("Material 21:", nft.getMaterialName(21));
        console.log("Tier 0:", nft.getMaterialTier(0));
        console.log("Tier 21:", nft.getMaterialTier(21));
        
        vm.stopBroadcast();
    }
}

