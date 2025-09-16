// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/PunchRenderer.sol";

contract DeployPunchOnly is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyStr)));
        
        vm.startBroadcast(deployerPrivateKey);
        
        PunchRenderer punchRenderer = new PunchRenderer();
        
        console.log("PunchRenderer deployed at:", address(punchRenderer));
        
        vm.stopBroadcast();
    }
}
