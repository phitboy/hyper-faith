// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/OmamoriNFTUltra.sol";

contract UltraNFTGasTest is Test {
    function test_OmamoriNFTUltraGas() public {
        uint256 gasBefore = gasleft();
        
        // Deploy OmamoriNFTUltra
        OmamoriNFTUltra nft = new OmamoriNFTUltra(address(this));
        
        uint256 gasUsed = gasBefore - gasleft();
        console.log("OmamoriNFTUltra deployment gas:", gasUsed);
        console.log("Fits in 2M gas limit:", gasUsed < 2000000);
        console.log("Gas savings vs original:", 4231167 - gasUsed);
        console.log("Percentage of 2M limit:", (gasUsed * 100) / 2000000, "%");
        
        if (gasUsed < 2000000) {
            console.log("SUCCESS: Contract fits in HyperEVM gas limit!");
        } else {
            console.log("FAILED: Still exceeds gas limit by:", gasUsed - 2000000);
        }
    }
}
