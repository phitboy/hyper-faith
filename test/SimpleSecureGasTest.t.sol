// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/OmamoriNFTSecure.sol";

contract SimpleSecureGasTest is Test {
    function test_DeploymentGas() public {
        address owner = address(0x1);
        address royaltyRecipient = address(0x2);
        
        uint256 gasBefore = gasleft();
        
        OmamoriNFTSecure nft = new OmamoriNFTSecure(owner, royaltyRecipient);
        
        uint256 gasUsed = gasBefore - gasleft();
        
        console.log("=== SECURE NFT GAS ANALYSIS ===");
        console.log("Deployment gas used:", gasUsed);
        console.log("HyperEVM block limit: 2,000,000");
        console.log("Fits within limit:", gasUsed <= 2000000);
        console.log("Percentage of limit:", (gasUsed * 100) / 2000000, "%");
        
        // Verify basic functionality
        assertEq(nft.name(), "Hyperliquid Omamori");
        assertEq(nft.symbol(), "OMAMORI");
        
        console.log("Contract deployed successfully with security features");
    }
}
