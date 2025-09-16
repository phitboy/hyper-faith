// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/OmamoriNFTFairMinimal.sol";

contract DeploySecureFinal is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        address initialOwner = vm.envAddress("INITIAL_OWNER");
        uint256 deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyStr)));
        address royaltyRecipient = 0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D;
        
        vm.startBroadcast(deployerPrivateKey);
        
        OmamoriNFTFairMinimal secureNFT = new OmamoriNFTFairMinimal(initialOwner, royaltyRecipient);
        
        console.log("=== SECURE NFT DEPLOYED ===");
        console.log("Contract:", address(secureNFT));
        console.log("Owner:", initialOwner);
        console.log("Royalties:", royaltyRecipient);
        console.log("Features: Pure randomness, Fair rarity, 5% royalties");
        
        vm.stopBroadcast();
    }
}
