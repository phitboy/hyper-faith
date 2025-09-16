// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/OmamoriNFTFairMinimal.sol";

contract FairMinimalGasTest is Test {
    function test_DeploymentGas() public {
        address owner = address(0x1);
        address royaltyRecipient = address(0x2);
        
        uint256 gasBefore = gasleft();
        OmamoriNFTFairMinimal nft = new OmamoriNFTFairMinimal(owner, royaltyRecipient);
        uint256 gasUsed = gasBefore - gasleft();
        
        console.log("=== FAIR MINIMAL NFT GAS ===");
        console.log("Deployment gas:", gasUsed);
        console.log("HyperEVM limit: 2,000,000");
        console.log("Fits:", gasUsed <= 2000000);
        console.log("Percentage:", (gasUsed * 100) / 2000000, "%");
        
        assertEq(nft.name(), "Hyperliquid Omamori");
        assertTrue(gasUsed <= 2000000);
    }
}
