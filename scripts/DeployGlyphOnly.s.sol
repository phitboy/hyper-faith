// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/GlyphRenderer.sol";

contract DeployGlyphOnly is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyStr)));
        
        vm.startBroadcast(deployerPrivateKey);
        
        GlyphRenderer glyphRenderer = new GlyphRenderer();
        
        console.log("GlyphRenderer deployed at:", address(glyphRenderer));
        
        vm.stopBroadcast();
    }
}
