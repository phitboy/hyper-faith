// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/OmamoriRender.sol";

contract DeployOmamoriRender is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address materialRegistry = 0xA5D308DE0Be64df79C6715418070a090195A5657;
        
        vm.startBroadcast(deployerPrivateKey);
        
        OmamoriRender render = new OmamoriRender(materialRegistry);
        
        vm.stopBroadcast();
        
        console.log("OmamoriRender deployed at:", address(render));
        console.log("MaterialRegistry:", materialRegistry);
    }
}
