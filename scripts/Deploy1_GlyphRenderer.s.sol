// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/GlyphRenderer.sol";

contract Deploy1_GlyphRenderer is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyStr)));
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=== DEPLOYING GLYPH RENDERER ===");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        
        GlyphRenderer glyphRenderer = new GlyphRenderer();
        
        console.log("GlyphRenderer deployed at:", address(glyphRenderer));
        
        // Test functionality
        string memory majorGlyph = glyphRenderer.renderMajor(0);
        console.log("Test major glyph length:", bytes(majorGlyph).length);
        
        vm.stopBroadcast();
        
        console.log("SUCCESS: GlyphRenderer ready!");
    }
}
