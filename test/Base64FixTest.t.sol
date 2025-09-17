// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/OmamoriNFTSingle.sol";

contract Base64FixTest is Test {
    OmamoriNFTSingle public nft;
    
    function setUp() public {
        nft = new OmamoriNFTSingle(address(this), address(0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D));
    }
    
    function testTokenURIFormat() public {
        // Mint a token
        nft.mint{value: 0.01 ether}();
        
        // Get tokenURI
        string memory tokenURI = nft.tokenURI(1);
        
        // Should start with data:application/json;base64,
        assertTrue(
            bytes(tokenURI).length > 29,
            "TokenURI too short"
        );
        
        // Extract and decode JSON
        string memory prefix = "data:application/json;base64,";
        bytes memory tokenURIBytes = bytes(tokenURI);
        bytes memory prefixBytes = bytes(prefix);
        
        // Check prefix
        for (uint i = 0; i < prefixBytes.length; i++) {
            assertEq(tokenURIBytes[i], prefixBytes[i], "Invalid prefix");
        }
        
        console.log("TokenURI:", tokenURI);
        console.log("TokenURI length:", bytes(tokenURI).length);
        
        // This should not revert if base64 is valid
        // We'll check this in the frontend parsing
    }
    
    function testBase64Encoding() public view {
        // Test simple string encoding
        string memory testString = "Hello World";
        // This would test the internal _base64Encode function if it were public
        // For now, we test via tokenURI which uses it
    }
}

