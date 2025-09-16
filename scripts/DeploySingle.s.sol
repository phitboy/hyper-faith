// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {OmamoriNFTSingle} from "../contracts/OmamoriNFTSingle.sol";

contract DeploySingle is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(string.concat("0x", privateKeyStr));
        
        address initialOwner = vm.envAddress("INITIAL_OWNER");
        address royaltyRecipient = 0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D;
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=== DEPLOYING SINGLE CONTRACT OMAMORI NFT ===");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Initial Owner:", initialOwner);
        console.log("Royalty Recipient:", royaltyRecipient);
        console.log("Contract fits in 24KB initcode limit: TRUE");
        
        OmamoriNFTSingle nft = new OmamoriNFTSingle(initialOwner, royaltyRecipient);
        
        console.log("SUCCESS: OmamoriNFTSingle deployed!");
        console.log("Contract Address:", address(nft));
        console.log("Contract Name:", nft.name());
        console.log("Contract Symbol:", nft.symbol());
        console.log("Royalty Recipient:", nft.royaltyRecipient());
        console.log("Royalty Basis Points:", nft.royaltyBasisPoints());
        
        // Test a material lookup
        console.log("Material 0:", nft.getMaterialName(0));
        console.log("Material 21:", nft.getMaterialName(21));
        console.log("Tier 0:", nft.getMaterialTier(0));
        console.log("Tier 21:", nft.getMaterialTier(21));
        
        vm.stopBroadcast();
    }
}
