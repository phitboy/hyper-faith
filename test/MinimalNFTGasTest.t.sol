// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/OmamoriNFTMinimal.sol";
import "../contracts/MaterialRegistryMinimal.sol";

contract MinimalNFTGasTest is Test {
    function test_OmamoriNFTMinimalGas() public {
        uint256 gasBefore = gasleft();
        
        // Deploy MaterialRegistry for testing
        MaterialRegistryMinimal materials = new MaterialRegistryMinimal();
        
        // Deploy OmamoriNFTMinimal
        OmamoriNFTMinimal nft = new OmamoriNFTMinimal(
            address(0), // No HYPE token for test
            address(materials),
            address(this) // owner
        );
        
        uint256 gasUsed = gasBefore - gasleft();
        console.log("OmamoriNFTMinimal deployment gas:", gasUsed);
        console.log("Fits in 2M gas limit:", gasUsed < 2000000);
        console.log("Gas savings vs original:", 4231167 - gasUsed);
    }
}
