// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/OmamoriNFTCore.sol";

contract ConnectSystem is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyStr)));
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Contract addresses
        address nftContract = 0x8339cC8dc7BD719D84c488d649923e9ed50f5128;
        address svgAssembler = 0xB42ac8659c9F661EB548C68e67F432cF5D2aa52c;
        
        console.log("=== CONNECTING OMAMORI SYSTEM ===");
        console.log("NFT Contract:", nftContract);
        console.log("SVG Assembler:", svgAssembler);
        
        // Connect SVG assembler to NFT contract
        OmamoriNFTCore nft = OmamoriNFTCore(nftContract);
        nft.setSVGAssembler(svgAssembler);
        
        console.log("System connected successfully!");
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("=== COMPLETE SYSTEM DEPLOYED ===");
        console.log("MaterialRegistry:  0xA5D308DE0Be64df79C6715418070a090195A5657");
        console.log("GlyphRenderer:     0x11Bb63863024444A5E4BB4d157aaDDc8441C8618");
        console.log("PunchRenderer:     0x72cFcB2e443b4D6AA341871C85Cbd390aE0Ab2Af");
        console.log("SVGAssembler:      0xB42ac8659c9F661EB548C68e67F432cF5D2aa52c");
        console.log("OmamoriNFTCore:    0x8339cC8dc7BD719D84c488d649923e9ed50f5128");
        console.log("");
        console.log("READY FOR MINTING!");
        console.log("Minimum burn: 0.01 HYPE");
        console.log("Full on-chain SVG art generation enabled!");
    }
}
