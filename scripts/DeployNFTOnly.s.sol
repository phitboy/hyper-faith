// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/OmamoriNFTMulti.sol";

contract DeployNFTOnly is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        address initialOwner = vm.envAddress("INITIAL_OWNER");
        uint256 deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyStr)));
        
        vm.startBroadcast(deployerPrivateKey);
        
        OmamoriNFT omamoriNFT = new OmamoriNFT(initialOwner);
        
        console.log("OmamoriNFT deployed at:", address(omamoriNFT));
        console.log("Initial owner:", initialOwner);
        
        vm.stopBroadcast();
    }
}
