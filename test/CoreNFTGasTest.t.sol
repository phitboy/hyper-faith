// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/OmamoriNFTMulti.sol";

contract CoreNFTGasTest is Test {
    function test_CoreNFTGas() public {
        uint256 gasBefore = gasleft();
        
        // Deploy core NFT contract
        OmamoriNFT nft = new OmamoriNFT(address(this));
        
        uint256 gasUsed = gasBefore - gasleft();
        console.log("Core OmamoriNFT deployment gas:", gasUsed);
        console.log("Fits in 2M gas limit:", gasUsed < 2000000);
        console.log("Percentage of 2M limit:", (gasUsed * 100) / 2000000, "%");
        
        if (gasUsed < 2000000) {
            console.log("SUCCESS: Core NFT fits in HyperEVM gas limit!");
        } else {
            console.log("FAILED: Exceeds gas limit by:", gasUsed - 2000000);
        }
    }
    
    function test_BasicMinting() public {
        OmamoriNFT nft = new OmamoriNFT(address(this));
        
        // Test minting functionality
        vm.deal(address(this), 1 ether);
        
        uint256 gasBefore = gasleft();
        nft.mint{value: 0.01 ether}();
        uint256 mintGas = gasBefore - gasleft();
        
        console.log("Mint gas usage:", mintGas);
        
        // Test basic tokenURI (without renderers)
        gasBefore = gasleft();
        string memory uri = nft.tokenURI(1);
        uint256 tokenURIGas = gasBefore - gasleft();
        
        console.log("Basic tokenURI gas usage:", tokenURIGas);
        console.log("TokenURI length:", bytes(uri).length);
        
        // Verify basic functionality
        require(nft.ownerOf(1) == address(this), "Mint failed");
        require(bytes(uri).length > 0, "Empty tokenURI");
        
        console.log("Basic minting: SUCCESS");
    }
}
