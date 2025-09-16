// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/OmamoriNFTWithRoyalties.sol";

contract DeployRoyaltyMinimal is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        address initialOwner = vm.envAddress("INITIAL_OWNER");
        uint256 deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyStr)));
        
        vm.startBroadcast(deployerPrivateKey);
        
        OmamoriNFTWithRoyalties omamoriNFT = new OmamoriNFTWithRoyalties(
            initialOwner,
            0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D
        );
        
        console.log("Deployed at:", address(omamoriNFT));
        
        vm.stopBroadcast();
    }
}
