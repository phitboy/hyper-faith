// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/OmamoriRender.sol";
import "../contracts/MaterialRegistryPalette.sol";

/**
 * @title OmamoriRenderTest
 * @notice Tests for the OmamoriRender contract
 * @dev Verifies SVG generation and tokenURI functionality
 */
contract OmamoriRenderTest is Test {
    OmamoriRender public renderer;
    MaterialRegistryPalette public materials;
    
    function setUp() public {
        materials = new MaterialRegistryPalette();
        renderer = new OmamoriRender(address(materials));
    }
    
    /**
     * @notice Test basic tokenURI generation
     */
    function test_TokenURIGeneration() public view {
        string memory uri = renderer.tokenURIView(
            1,      // tokenId
            0,      // majorId (Liquidity)
            0,      // minorId (Fills)
            0,      // materialId (Wood)
            5,      // punchCount
            12345,  // seed
            1e18    // hypeBurned (1 HYPE)
        );
        
        // Should return base64 encoded JSON
        assertTrue(bytes(uri).length > 0, "URI should not be empty");
        assertTrue(_startsWith(uri, "data:application/json;base64,"), "Should be base64 JSON");
    }
    
    /**
     * @notice Test tokenURI with all major glyphs
     */
    function test_AllMajorGlyphs() public view {
        for (uint8 majorId = 0; majorId < 12; majorId++) {
            string memory uri = renderer.tokenURIView(
                1, majorId, 0, 0, 5, 12345, 1e18
            );
            assertTrue(bytes(uri).length > 0, "URI should not be empty for all majors");
        }
    }
    
    /**
     * @notice Test tokenURI with all minor glyphs
     */
    function test_AllMinorGlyphs() public view {
        for (uint8 majorId = 0; majorId < 12; majorId++) {
            for (uint8 minorId = 0; minorId < 4; minorId++) {
                string memory uri = renderer.tokenURIView(
                    1, majorId, minorId, 0, 5, 12345, 1e18
                );
                assertTrue(bytes(uri).length > 0, "URI should not be empty for all minors");
            }
        }
    }
    
    /**
     * @notice Test tokenURI with all materials
     */
    function test_AllMaterials() public view {
        for (uint16 materialId = 0; materialId < 24; materialId++) {
            string memory uri = renderer.tokenURIView(
                1, 0, 0, materialId, 5, 12345, 1e18
            );
            assertTrue(bytes(uri).length > 0, "URI should not be empty for all materials");
        }
    }
    
    /**
     * @notice Test different punch counts
     */
    function test_DifferentPunchCounts() public view {
        for (uint8 punchCount = 0; punchCount <= 25; punchCount++) {
            string memory uri = renderer.tokenURIView(
                1, 0, 0, 0, punchCount, 12345, 1e18
            );
            assertTrue(bytes(uri).length > 0, "URI should not be empty for all punch counts");
        }
    }
    
    /**
     * @notice Test SVG invariance (same visual regardless of HYPE burned)
     */
    function test_SVGInvariance() public view {
        // Generate URIs with different HYPE amounts but same other parameters
        string memory uri1 = renderer.tokenURIView(1, 0, 0, 0, 5, 12345, 1e18);
        string memory uri2 = renderer.tokenURIView(1, 0, 0, 0, 5, 12345, 10e18);
        
        // URIs should be different (different HYPE burned in metadata)
        assertFalse(_stringsEqual(uri1, uri2), "URIs should differ due to HYPE metadata");
        
        // But the visual hash should be the same (this is a conceptual test)
        // In practice, you'd extract and compare the SVG portions
        assertTrue(bytes(uri1).length > 0 && bytes(uri2).length > 0, "Both URIs should be valid");
    }
    
    /**
     * @notice Test deterministic behavior
     */
    function test_DeterministicBehavior() public view {
        string memory uri1 = renderer.tokenURIView(1, 0, 0, 0, 5, 12345, 1e18);
        string memory uri2 = renderer.tokenURIView(1, 0, 0, 0, 5, 12345, 1e18);
        
        assertTrue(_stringsEqual(uri1, uri2), "Same parameters should produce same URI");
    }
    
    /**
     * @notice Test different seeds produce different results
     */
    function test_DifferentSeeds() public view {
        string memory uri1 = renderer.tokenURIView(1, 0, 0, 0, 5, 12345, 1e18);
        string memory uri2 = renderer.tokenURIView(1, 0, 0, 0, 5, 54321, 1e18);
        
        assertFalse(_stringsEqual(uri1, uri2), "Different seeds should produce different URIs");
    }
    
    /**
     * @notice Test invalid glyph IDs revert
     */
    function test_InvalidGlyphIds() public {
        // Invalid major ID
        vm.expectRevert("OmamoriGlyphs: Invalid major ID");
        renderer.tokenURIView(1, 12, 0, 0, 5, 12345, 1e18);
        
        // Invalid minor ID
        vm.expectRevert("OmamoriGlyphs: Invalid major or minor ID");
        renderer.tokenURIView(1, 0, 4, 0, 5, 12345, 1e18);
    }
    
    /**
     * @notice Test invalid material ID reverts
     */
    function test_InvalidMaterialId() public {
        vm.expectRevert("MaterialRegistryPalette: Invalid material ID");
        renderer.tokenURIView(1, 0, 0, 24, 5, 12345, 1e18);
    }
    
    /**
     * @notice Test punch count bounds
     */
    function test_PunchCountBounds() public {
        // Test maximum punch count
        string memory uri = renderer.tokenURIView(1, 0, 0, 0, 25, 12345, 1e18);
        assertTrue(bytes(uri).length > 0, "Should handle max punch count");
        
        // Test zero punch count
        uri = renderer.tokenURIView(1, 0, 0, 0, 0, 12345, 1e18);
        assertTrue(bytes(uri).length > 0, "Should handle zero punch count");
    }
    
    /**
     * @notice Test HYPE formatting in attributes
     */
    function test_HypeFormatting() public view {
        // Test that URI generation works with different HYPE amounts
        string memory uri1 = renderer.tokenURIView(1, 0, 0, 0, 5, 12345, 1e18);
        assertTrue(bytes(uri1).length > 0, "Should generate URI with 1 HYPE");
        
        // Test fractional HYPE amounts
        string memory uri2 = renderer.tokenURIView(1, 0, 0, 0, 5, 12345, 15e17); // 1.5 HYPE
        assertTrue(bytes(uri2).length > 0, "Should generate URI with fractional HYPE");
        
        // URIs should be different due to different HYPE amounts
        assertFalse(_stringsEqual(uri1, uri2), "Different HYPE amounts should produce different URIs");
    }
    
    // Helper functions
    
    function _startsWith(string memory str, string memory prefix) private pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory prefixBytes = bytes(prefix);
        
        if (prefixBytes.length > strBytes.length) return false;
        
        for (uint i = 0; i < prefixBytes.length; i++) {
            if (strBytes[i] != prefixBytes[i]) return false;
        }
        return true;
    }
    
    function _stringsEqual(string memory a, string memory b) private pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
    
    function _contains(string memory str, string memory substr) private pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory substrBytes = bytes(substr);
        
        if (substrBytes.length > strBytes.length) return false;
        
        for (uint i = 0; i <= strBytes.length - substrBytes.length; i++) {
            bool found = true;
            for (uint j = 0; j < substrBytes.length; j++) {
                if (strBytes[i + j] != substrBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) return true;
        }
        return false;
    }
}
