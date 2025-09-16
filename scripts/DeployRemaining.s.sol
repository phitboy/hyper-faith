// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/OmamoriRender.sol";
import "../contracts/OmamoriNFT.sol";

/**
 * @title DeployRemaining
 * @notice Deploy remaining contracts after MaterialRegistry is deployed
 */
contract DeployRemaining is Script {
    
    function run() public {
        address materialsAddress = 0xA5D308DE0Be64df79C6715418070a090195A5657;
        address initialOwner = 0x7FF97904C8bD597cC5f4fc1Bc0FdC403d7A1A779;
        address hypeToken = address(0); // Using native mode
        
        vm.startBroadcast();
        
        console.log("=== Deploying Remaining Contracts ===");
        console.log("Materials address:", materialsAddress);
        console.log("Initial owner:", initialOwner);
        
        // Deploy OmamoriRender
        console.log("\n1. Deploying OmamoriRender...");
        OmamoriRender renderer = new OmamoriRender(materialsAddress);
        console.log("OmamoriRender deployed at:", address(renderer));
        
        // Deploy OmamoriNFT
        console.log("\n2. Deploying OmamoriNFT...");
        OmamoriNFT nft = new OmamoriNFT(
            hypeToken,
            address(renderer),
            materialsAddress,
            initialOwner
        );
        console.log("OmamoriNFT deployed at:", address(nft));
        
        // Set native burn mode
        console.log("\n3. Setting native burn mode...");
        nft.setBurnMode(OmamoriNFT.BurnMode.NATIVE);
        console.log("Burn mode set to NATIVE");
        
        vm.stopBroadcast();
        
        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("MaterialRegistry:", materialsAddress);
        console.log("OmamoriRender:", address(renderer));
        console.log("OmamoriNFT:", address(nft));
        console.log("\nNext step: Initialize MaterialRegistry with materials");
    }
}
