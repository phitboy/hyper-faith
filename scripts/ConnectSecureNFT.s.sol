// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";

interface IOmamoriNFTSecure {
    function setSVGAssembler(address _svgAssembler) external;
    function owner() external view returns (address);
}

contract ConnectSecureNFT is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(string.concat("0x", privateKeyStr));
        address secureNFT = 0xef680bE6F1586d746562F4f5CB95b1e7829b9099;
        address svgAssembler = 0xB42ac8659c9F661EB548C68e67F432cF5D2aa52c;
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=== CONNECTING SECURE NFT TO SVG ASSEMBLER ===");
        console.log("Secure NFT:", secureNFT);
        console.log("SVG Assembler:", svgAssembler);
        
        IOmamoriNFTSecure nft = IOmamoriNFTSecure(secureNFT);
        
        // Verify we're the owner
        address owner = nft.owner();
        console.log("Contract Owner:", owner);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        
        // Connect to SVG Assembler
        nft.setSVGAssembler(svgAssembler);
        
        console.log("SUCCESS: Secure NFT connected to SVG Assembler!");
        
        vm.stopBroadcast();
    }
}
