// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/OmamoriNFTOptimized.sol";

contract OptimizedNFTGasTest is Test {
    function test_OptimizedNFTGas() public {
        uint256 gasBefore = gasleft();
        
        // Deploy OmamoriNFTOptimized
        OmamoriNFTOptimized nft = new OmamoriNFTOptimized(address(this), address(0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D));
        
        uint256 gasUsed = gasBefore - gasleft();
        console.log("OmamoriNFTOptimized deployment gas:", gasUsed);
        console.log("Fits in 30M gas limit:", gasUsed < 30000000);
        console.log("Percentage of 30M limit:", (gasUsed * 100) / 30000000, "%");
        console.log("Fits in 2M gas limit:", gasUsed < 2000000);
        
        // Test that it's much smaller than the complete version
        require(gasUsed < 5544893, "Should be smaller than complete version");
    }
    
    function test_OptimizedTokenURI() public {
        OmamoriNFTOptimized nft = new OmamoriNFTOptimized(address(this), address(0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D));
        
        vm.deal(address(this), 1 ether);
        
        uint256 gasBefore = gasleft();
        nft.mint{value: 0.01 ether}();
        uint256 mintGas = gasBefore - gasleft();
        
        console.log("Optimized mint gas:", mintGas);
        
        gasBefore = gasleft();
        string memory uri = nft.tokenURI(1);
        uint256 tokenURIGas = gasBefore - gasleft();
        
        console.log("Optimized tokenURI gas:", tokenURIGas);
        console.log("TokenURI length:", bytes(uri).length);
        
        // Verify it works
        require(bytes(uri).length > 0, "Empty tokenURI");
        
        // Test material functions
        console.log("Material 0:", nft.getMaterialName(0));
        console.log("Material 21:", nft.getMaterialName(21));
        console.log("Tier 0:", nft.getMaterialTier(0));
        console.log("Tier 21:", nft.getMaterialTier(21));
        
        (string memory bg, string memory stroke) = nft.getMaterialColors(0);
        console.log("Material 0 colors:", bg, stroke);
    }
    
    function test_RoyaltyInfo() public {
        OmamoriNFTOptimized nft = new OmamoriNFTOptimized(address(this), address(0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D));
        
        // Test 5% royalty on 1 ETH sale
        (address recipient, uint256 amount) = nft.royaltyInfo(1, 1 ether);
        
        console.log("Royalty recipient:", recipient);
        console.log("Royalty amount for 1 ETH:", amount);
        
        require(recipient == address(0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D), "Wrong recipient");
        require(amount == 0.05 ether, "Wrong royalty amount");
        
        // Test EIP-2981 interface support
        require(nft.supportsInterface(0x2a55205a), "Should support EIP-2981");
    }
}
