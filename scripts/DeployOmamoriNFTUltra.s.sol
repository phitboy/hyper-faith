// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/OmamoriNFTUltra.sol";

contract DeployOmamoriNFTUltra is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyStr)));
        address initialOwner = vm.envAddress("INITIAL_OWNER");
        
        vm.startBroadcast(deployerPrivateKey);
        
        OmamoriNFTUltra nft = new OmamoriNFTUltra(initialOwner);
        
        vm.stopBroadcast();
        
        console.log("=== DEPLOYMENT SUCCESS ===");
        console.log("OmamoriNFTUltra deployed at:", address(nft));
        console.log("Initial Owner:", initialOwner);
        console.log("MaterialRegistry:", address(nft.MATERIALS()));
        console.log("Burn Address:", nft.BURN_ADDRESS());
        console.log("Min Burn Amount:", nft.MIN_BURN());
        console.log("=== READY FOR MINTING ===");
    }
}
