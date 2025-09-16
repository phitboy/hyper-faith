// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/OmamoriNFTComplete.sol";

contract CompleteNFTGasTest is Test {
    function test_OmamoriNFTCompleteGas() public {
        uint256 gasBefore = gasleft();
        
        // Deploy OmamoriNFTComplete
        OmamoriNFTComplete nft = new OmamoriNFTComplete(address(this), address(0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D));
        
        uint256 gasUsed = gasBefore - gasleft();
        console.log("OmamoriNFTComplete deployment gas:", gasUsed);
        console.log("Fits in 2M gas limit:", gasUsed < 2000000);
        console.log("Gas savings vs original:", 4231167 - gasUsed);
        console.log("Percentage of 2M limit:", (gasUsed * 100) / 2000000, "%");
    }
    
    function test_TokenURIGeneration() public {
        // Deploy and test tokenURI generation
        OmamoriNFTComplete nft = new OmamoriNFTComplete(address(this), address(0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D));
        
        // Mock a mint by setting token data directly
        vm.deal(address(this), 1 ether);
        
        uint256 gasBefore = gasleft();
        nft.mint{value: 0.01 ether}();
        uint256 mintGas = gasBefore - gasleft();
        
        console.log("Mint gas usage:", mintGas);
        
        gasBefore = gasleft();
        string memory uri = nft.tokenURI(1);
        uint256 tokenURIGas = gasBefore - gasleft();
        
        console.log("TokenURI gas usage:", tokenURIGas);
        console.log("TokenURI length:", bytes(uri).length);
        
        // Verify it's a valid data URI
        require(bytes(uri).length > 0, "Empty tokenURI");
        
        // Check it starts with data:application/json;base64,
        string memory prefix = "data:application/json;base64,";
        bytes memory uriBytes = bytes(uri);
        bytes memory prefixBytes = bytes(prefix);
        
        bool validPrefix = true;
        if (uriBytes.length >= prefixBytes.length) {
            for (uint i = 0; i < prefixBytes.length; i++) {
                if (uriBytes[i] != prefixBytes[i]) {
                    validPrefix = false;
                    break;
                }
            }
        } else {
            validPrefix = false;
        }
        
        require(validPrefix, "Invalid tokenURI format");
        console.log("TokenURI format: VALID");
    }
}
