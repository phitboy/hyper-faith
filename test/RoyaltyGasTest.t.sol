// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/OmamoriNFTWithRoyalties.sol";

contract RoyaltyGasTest is Test {
    function test_RoyaltyContractGas() public {
        address royaltyRecipient = 0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D;
        
        uint256 gasBefore = gasleft();
        
        // Deploy royalty-enabled NFT contract
        OmamoriNFTWithRoyalties nft = new OmamoriNFTWithRoyalties(
            address(this), 
            royaltyRecipient
        );
        
        uint256 gasUsed = gasBefore - gasleft();
        console.log("OmamoriNFTWithRoyalties deployment gas:", gasUsed);
        console.log("Fits in 2M gas limit:", gasUsed < 2000000);
        console.log("Percentage of 2M limit:", (gasUsed * 100) / 2000000, "%");
        
        if (gasUsed < 2000000) {
            console.log("SUCCESS: Royalty NFT fits in HyperEVM gas limit!");
        } else {
            console.log("FAILED: Exceeds gas limit by:", gasUsed - 2000000);
        }
        
        // Test royalty functionality
        console.log("");
        console.log("=== ROYALTY CONFIGURATION ===");
        console.log("Royalty recipient:", nft.royaltyRecipient());
        console.log("Royalty basis points:", nft.royaltyBasisPoints());
        
        // Test royaltyInfo function
        uint256 salePrice = 1 ether;
        (address receiver, uint256 royaltyAmount) = nft.royaltyInfo(1, salePrice);
        
        console.log("For 1 ETH sale:");
        console.log("  Royalty receiver:", receiver);
        console.log("  Royalty amount:", royaltyAmount);
        console.log("  Royalty percentage:", (royaltyAmount * 100) / salePrice, "%");
        
        // Verify configuration
        require(receiver == royaltyRecipient, "Wrong royalty recipient");
        require(royaltyAmount == (salePrice * 500) / 10000, "Wrong royalty amount");
        require(nft.royaltyBasisPoints() == 500, "Wrong basis points");
        
        console.log("All royalty tests passed!");
    }
    
    function test_RoyaltyInterfaceSupport() public {
        address royaltyRecipient = 0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D;
        
        OmamoriNFTWithRoyalties nft = new OmamoriNFTWithRoyalties(
            address(this), 
            royaltyRecipient
        );
        
        // Test interface support
        bool supportsERC721 = nft.supportsInterface(type(IERC721).interfaceId);
        bool supportsERC2981 = nft.supportsInterface(type(IERC2981).interfaceId);
        bool supportsERC165 = nft.supportsInterface(type(IERC165).interfaceId);
        
        console.log("Interface support:");
        console.log("  ERC721:", supportsERC721);
        console.log("  ERC2981 (Royalties):", supportsERC2981);
        console.log("  ERC165:", supportsERC165);
        
        require(supportsERC721, "Should support ERC721");
        require(supportsERC2981, "Should support ERC2981");
        require(supportsERC165, "Should support ERC165");
        
        console.log("Interface support: SUCCESS");
    }
    
    function test_RoyaltyCalculations() public {
        address royaltyRecipient = 0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D;
        
        OmamoriNFTWithRoyalties nft = new OmamoriNFTWithRoyalties(
            address(this), 
            royaltyRecipient
        );
        
        // Test different sale prices
        uint256[] memory salePrices = new uint256[](4);
        salePrices[0] = 0.1 ether;  // 0.1 ETH
        salePrices[1] = 1 ether;    // 1 ETH
        salePrices[2] = 10 ether;   // 10 ETH
        salePrices[3] = 100 ether;  // 100 ETH
        
        console.log("Royalty calculations (5%):");
        
        for (uint i = 0; i < salePrices.length; i++) {
            (address receiver, uint256 royaltyAmount) = nft.royaltyInfo(1, salePrices[i]);
            
            console.log("Sale price:", salePrices[i] / 1e18, "ETH");
            console.log("  Royalty:", royaltyAmount / 1e15, "milli-ETH");
            console.log("  Percentage:", (royaltyAmount * 100) / salePrices[i], "%");
            
            require(receiver == royaltyRecipient, "Wrong recipient");
            require(royaltyAmount == (salePrices[i] * 500) / 10000, "Wrong calculation");
        }
        
        console.log("Royalty calculations: SUCCESS");
    }
}
