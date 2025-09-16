// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

contract DeployLibraries is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyStr)));
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy OmamoriGlyphs library first
        bytes memory glyphsBytecode = vm.getCode("OmamoriGlyphs");
        address glyphsAddr;
        assembly {
            glyphsAddr := create2(0, add(glyphsBytecode, 0x20), mload(glyphsBytecode), 0)
        }
        
        console.log("OmamoriGlyphs deployed at:", glyphsAddr);
        
        vm.stopBroadcast();
    }
}
