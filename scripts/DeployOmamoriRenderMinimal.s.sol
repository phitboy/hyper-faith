// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/OmamoriRenderMinimal.sol";

contract DeployOmamoriRenderMinimal is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyStr)));
        address materialRegistry = 0xA5D308DE0Be64df79C6715418070a090195A5657;
        
        vm.startBroadcast(deployerPrivateKey);
        
        OmamoriRenderMinimal render = new OmamoriRenderMinimal(materialRegistry);
        
        vm.stopBroadcast();
        
        console.log("OmamoriRenderMinimal deployed at:", address(render));
        console.log("MaterialRegistry:", materialRegistry);
    }
}
