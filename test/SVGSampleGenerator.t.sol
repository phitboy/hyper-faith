// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../contracts/OmamoriNFTSingle.sol";

contract SVGSampleGenerator is Test {
    OmamoriNFTSingle public nft;
    
    function setUp() public {
        nft = new OmamoriNFTSingle(address(this), address(this));
    }
    
    function testDisciplineSize() public {
        console.log("=== DISCIPLINE + SIZE (Major 5, Minor 1) ===");
        nft.mint{value: 0.01 ether}(5, 1);
        string memory tokenURI = nft.tokenURI(1);
        console.log("TokenURI:", tokenURI);
        console.log("");
    }
    
    function testLeverageMargin() public {
        console.log("=== LEVERAGE + MARGIN (Major 1, Minor 0) ===");
        nft.mint{value: 0.01 ether}(1, 0);
        string memory tokenURI = nft.tokenURI(1);
        console.log("TokenURI:", tokenURI);
        console.log("");
    }
    
    function testRNGUptime() public {
        console.log("=== RNG + UPTIME (Major 8, Minor 2) ===");
        nft.mint{value: 0.01 ether}(8, 2);
        string memory tokenURI = nft.tokenURI(1);
        console.log("TokenURI:", tokenURI);
        console.log("");
    }
    
    function testFOMOConviction() public {
        console.log("=== FOMO + CONVICTION (Major 6, Minor 3) ===");
        nft.mint{value: 0.01 ether}(6, 3);
        string memory tokenURI = nft.tokenURI(1);
        console.log("TokenURI:", tokenURI);
        console.log("");
    }
    
    function testEgoHyperliquid() public {
        console.log("=== EGO + HYPERLIQUID (Major 11, Minor 1) ===");
        nft.mint{value: 0.01 ether}(11, 1);
        string memory tokenURI = nft.tokenURI(1);
        console.log("TokenURI:", tokenURI);
        console.log("");
    }
}
