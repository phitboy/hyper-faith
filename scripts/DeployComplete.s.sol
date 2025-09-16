// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {OmamoriNFTComplete} from "../contracts/OmamoriNFTComplete.sol";

contract DeployComplete is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(string.concat("0x", privateKeyStr));
        
        address initialOwner = vm.envAddress("INITIAL_OWNER");
        address royaltyRecipient = 0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D;
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=== DEPLOYING COMPLETE SINGLE CONTRACT ===");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Initial Owner:", initialOwner);
        console.log("Royalty Recipient:", royaltyRecipient);
        console.log("Using BIG BLOCKS (30M gas limit)");
        
        OmamoriNFTComplete nft = new OmamoriNFTComplete(initialOwner, royaltyRecipient);
        
        console.log("SUCCESS: OmamoriNFTComplete deployed!");
        console.log("Contract Address:", address(nft));
        console.log("Contract Name:", nft.name());
        console.log("Contract Symbol:", nft.symbol());
        console.log("Royalty Recipient:", nft.royaltyRecipient());
        console.log("Royalty Basis Points:", nft.royaltyBasisPoints());
        
        vm.stopBroadcast();
    }
}
