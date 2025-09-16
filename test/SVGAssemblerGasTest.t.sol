// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/SVGAssembler.sol";
import "../contracts/GlyphRenderer.sol";
import "../contracts/PunchRenderer.sol";

contract SVGAssemblerGasTest is Test {
    GlyphRenderer glyphRenderer;
    PunchRenderer punchRenderer;
    SVGAssembler assembler;
    
    function setUp() public {
        // Deploy renderer contracts
        glyphRenderer = new GlyphRenderer();
        punchRenderer = new PunchRenderer();
        
        // Deploy assembler
        assembler = new SVGAssembler(address(glyphRenderer), address(punchRenderer));
    }
    
    function test_SVGAssemblerGas() public {
        uint256 gasBefore = gasleft();
        
        // Deploy SVGAssembler contract (already done in setUp)
        SVGAssembler testAssembler = new SVGAssembler(address(glyphRenderer), address(punchRenderer));
        
        uint256 gasUsed = gasBefore - gasleft();
        console.log("SVGAssembler deployment gas:", gasUsed);
        console.log("Fits in 2M gas limit:", gasUsed < 2000000);
        console.log("Percentage of 2M limit:", (gasUsed * 100) / 2000000, "%");
        
        if (gasUsed < 2000000) {
            console.log("SUCCESS: SVGAssembler fits in HyperEVM gas limit!");
        } else {
            console.log("FAILED: Exceeds gas limit by:", gasUsed - 2000000);
        }
    }
    
    function test_TokenURIGeneration() public {
        // Test complete tokenURI generation
        uint256 gasBefore = gasleft();
        
        string memory tokenURI = assembler.generateTokenURI(
            1,      // tokenId
            0,      // majorId (Liquidity)
            0,      // minorId (Fills)
            0,      // materialId (Wood)
            5,      // punchCount
            12345,  // seed
            10000000000000000 // hypeBurned (0.01 HYPE)
        );
        
        uint256 tokenURIGas = gasBefore - gasleft();
        
        console.log("Complete tokenURI generation gas:", tokenURIGas);
        console.log("TokenURI length:", bytes(tokenURI).length);
        
        // Verify tokenURI is not empty and contains expected data
        require(bytes(tokenURI).length > 0, "Empty tokenURI");
        require(bytes(tokenURI).length > 1000, "TokenURI too short"); // Should be substantial with SVG
        
        // Check if it starts with data URI
        string memory prefix = "data:application/json;base64,";
        bytes memory tokenURIBytes = bytes(tokenURI);
        bytes memory prefixBytes = bytes(prefix);
        
        bool startsWithPrefix = true;
        if (tokenURIBytes.length >= prefixBytes.length) {
            for (uint i = 0; i < prefixBytes.length; i++) {
                if (tokenURIBytes[i] != prefixBytes[i]) {
                    startsWithPrefix = false;
                    break;
                }
            }
        } else {
            startsWithPrefix = false;
        }
        
        require(startsWithPrefix, "TokenURI should start with data URI prefix");
        
        console.log("TokenURI generation: SUCCESS");
    }
    
    function test_MultipleTokenURIs() public {
        // Test different combinations to ensure variety
        uint256 totalGas = 0;
        
        for (uint8 i = 0; i < 3; i++) {
            uint256 gasBefore = gasleft();
            
            string memory tokenURI = assembler.generateTokenURI(
                i + 1,          // tokenId
                i % 12,         // majorId
                i % 4,          // minorId
                i % 24,         // materialId
                (i * 5) % 26,   // punchCount
                12345 + i,      // seed
                10000000000000000 + (i * 1000000000000000) // hypeBurned
            );
            
            uint256 gasUsed = gasBefore - gasleft();
            totalGas += gasUsed;
            
            console.log("TokenURI", i + 1, "gas:", gasUsed);
            console.log("TokenURI", i + 1, "length:", bytes(tokenURI).length);
            
            require(bytes(tokenURI).length > 1000, "TokenURI should be substantial");
        }
        
        console.log("Average tokenURI gas:", totalGas / 3);
        console.log("Multiple tokenURI generation: SUCCESS");
    }
}
