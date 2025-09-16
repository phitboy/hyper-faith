// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/SVGAssembler.sol";

contract DeploySVGOnly is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyStr)));
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Use deployed renderer addresses
        address glyphRenderer = 0x11Bb63863024444A5E4BB4d157aaDDc8441C8618;
        address punchRenderer = 0x72cFcB2e443b4D6AA341871C85Cbd390aE0Ab2Af;
        
        SVGAssembler svgAssembler = new SVGAssembler(glyphRenderer, punchRenderer);
        
        console.log("SVGAssembler deployed at:", address(svgAssembler));
        console.log("Connected to GlyphRenderer:", glyphRenderer);
        console.log("Connected to PunchRenderer:", punchRenderer);
        
        vm.stopBroadcast();
    }
}
