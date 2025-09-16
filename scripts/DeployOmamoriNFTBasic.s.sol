// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/OmamoriNFTBasic.sol";

contract DeployOmamoriNFTBasic is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyStr)));
        address initialOwner = vm.envAddress("INITIAL_OWNER");
        
        vm.startBroadcast(deployerPrivateKey);
        
        OmamoriNFTBasic nft = new OmamoriNFTBasic(initialOwner);
        
        vm.stopBroadcast();
        
        console.log("OmamoriNFTBasic deployed at:", address(nft));
        console.log("Initial Owner:", initialOwner);
        console.log("Burn Address:", nft.BURN_ADDRESS());
        console.log("Min Burn Amount:", nft.MIN_BURN());
    }
}
