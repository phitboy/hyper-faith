// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/OmamoriNFTFairMinimal.sol";

contract DeployFairMinimal is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address initialOwner = vm.envAddress("INITIAL_OWNER");
        address royaltyRecipient = 0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D;
        
        vm.startBroadcast(deployerPrivateKey);
        OmamoriNFTFairMinimal nft = new OmamoriNFTFairMinimal(initialOwner, royaltyRecipient);
        vm.stopBroadcast();
        
        console.log("SECURE NFT DEPLOYED:", address(nft));
    }
}
