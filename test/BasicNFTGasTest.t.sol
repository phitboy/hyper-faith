// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/OmamoriNFTBasic.sol";

contract BasicNFTGasTest is Test {
    function test_OmamoriNFTBasicGas() public {
        uint256 gasBefore = gasleft();
        
        // Deploy OmamoriNFTBasic
        OmamoriNFTBasic nft = new OmamoriNFTBasic(address(this));
        
        uint256 gasUsed = gasBefore - gasleft();
        console.log("OmamoriNFTBasic deployment gas:", gasUsed);
        console.log("Fits in 2M gas limit:", gasUsed < 2000000);
        console.log("Gas savings vs original:", 4231167 - gasUsed);
    }
}
