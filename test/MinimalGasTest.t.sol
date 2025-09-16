// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/OmamoriRenderMinimal.sol";
import "../contracts/MaterialRegistryMinimal.sol";

contract MinimalGasTest is Test {
    function test_OmamoriRenderMinimalGas() public {
        uint256 gasBefore = gasleft();
        
        // Deploy MaterialRegistry for testing
        MaterialRegistryMinimal materials = new MaterialRegistryMinimal();
        
        // Deploy OmamoriRenderMinimal
        OmamoriRenderMinimal render = new OmamoriRenderMinimal(address(materials));
        
        uint256 gasUsed = gasBefore - gasleft();
        console.log("OmamoriRenderMinimal deployment gas:", gasUsed);
        console.log("Fits in 2M gas limit:", gasUsed < 2000000);
        console.log("Gas savings vs original:", 2543416 - gasUsed);
    }
}
