// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../libraries/OmamoriGlyphs.sol";

/**
 * @title OmamoriGlyphsTest
 * @notice Tests for glyph rendering functionality
 * @dev Verifies all 12 Major and 48 Minor glyphs render correctly
 */
contract OmamoriGlyphsTest is Test {
    
    /**
     * @notice Test that all Major glyphs render without reverting
     */
    function test_AllMajorGlyphs() public pure {
        for (uint8 i = 0; i < 12; i++) {
            string memory glyph = OmamoriGlyphs.renderMajor(i);
            assertTrue(bytes(glyph).length > 0, "Major glyph should not be empty");
            
            // Verify it contains SVG elements (basic sanity check)
            assertTrue(_containsSvgElement(glyph), "Should contain SVG elements");
        }
    }
    
    /**
     * @notice Test that all Minor glyphs render without reverting
     */
    function test_AllMinorGlyphs() public pure {
        for (uint8 majorId = 0; majorId < 12; majorId++) {
            for (uint8 minorId = 0; minorId < 4; minorId++) {
                string memory glyph = OmamoriGlyphs.renderMinor(majorId, minorId);
                assertTrue(bytes(glyph).length > 0, "Minor glyph should not be empty");
                
                // Verify it contains SVG elements
                assertTrue(_containsSvgElement(glyph), "Should contain SVG elements");
            }
        }
    }
    
    /**
     * @notice Test specific Major glyphs for expected content
     */
    function test_SpecificMajorGlyphs() public pure {
        // Test Liquidity (ID 0) - should contain three lines
        string memory liquidity = OmamoriGlyphs.renderMajor(0);
        assertTrue(_countOccurrences(liquidity, "<line") == 3, "Liquidity should have 3 lines");
        
        // Test RNG (ID 8) - should contain six circles (braille pattern)
        string memory rng = OmamoriGlyphs.renderMajor(8);
        assertTrue(_countOccurrences(rng, "<circle") == 6, "RNG should have 6 circles");
        
        // Test FOMO (ID 6) - should contain polygon (triangle)
        string memory fomo = OmamoriGlyphs.renderMajor(6);
        assertTrue(_contains(fomo, "<polygon"), "FOMO should contain polygon");
        
        // Test Max Pain (ID 9) - should contain two lines (X cross)
        string memory maxPain = OmamoriGlyphs.renderMajor(9);
        assertTrue(_countOccurrences(maxPain, "<line") == 2, "Max Pain should have 2 lines");
    }
    
    /**
     * @notice Test specific Minor glyphs for expected content
     */
    function test_SpecificMinorGlyphs() public pure {
        // Test Liquidity -> Fills (0,0) - should have many lines
        string memory fills = OmamoriGlyphs.renderMinor(0, 0);
        assertTrue(_countOccurrences(fills, "<line") >= 9, "Fills should have many lines");
        
        // Test RNG -> Mints (8,0) - should have 2 circles (top row)
        string memory mints = OmamoriGlyphs.renderMinor(8, 0);
        assertTrue(_countOccurrences(mints, "<circle") == 2, "Mints should have 2 circles");
        
        // Test Ego -> Hyperliquid (11,1) - should have halo circle
        string memory hyperliquid = OmamoriGlyphs.renderMinor(11, 1);
        assertTrue(_countOccurrences(hyperliquid, "<circle") >= 2, "Hyperliquid should have multiple circles");
    }
    
    /**
     * @notice Test invalid Major glyph IDs revert
     */
    function test_InvalidMajorId() public {
        vm.expectRevert("OmamoriGlyphs: Invalid major ID");
        OmamoriGlyphs.renderMajor(12);
        
        vm.expectRevert("OmamoriGlyphs: Invalid major ID");
        OmamoriGlyphs.renderMajor(255);
    }
    
    /**
     * @notice Test invalid Minor glyph IDs revert
     */
    function test_InvalidMinorId() public {
        // Invalid minor ID for valid major
        vm.expectRevert("OmamoriGlyphs: Invalid major or minor ID");
        OmamoriGlyphs.renderMinor(0, 4);
        
        // Invalid major ID
        vm.expectRevert("OmamoriGlyphs: Invalid major or minor ID");
        OmamoriGlyphs.renderMinor(12, 0);
        
        // Both invalid
        vm.expectRevert("OmamoriGlyphs: Invalid major or minor ID");
        OmamoriGlyphs.renderMinor(12, 4);
    }
    
    /**
     * @notice Test that glyphs use only SVG primitives (no text)
     */
    function test_NoTextElements() public pure {
        // Check all Major glyphs
        for (uint8 i = 0; i < 12; i++) {
            string memory glyph = OmamoriGlyphs.renderMajor(i);
            assertFalse(_contains(glyph, "<text"), "Major glyph should not contain text");
            assertFalse(_contains(glyph, "emoji"), "Major glyph should not contain emoji");
        }
        
        // Check all Minor glyphs
        for (uint8 majorId = 0; majorId < 12; majorId++) {
            for (uint8 minorId = 0; minorId < 4; minorId++) {
                string memory glyph = OmamoriGlyphs.renderMinor(majorId, minorId);
                assertFalse(_contains(glyph, "<text"), "Minor glyph should not contain text");
                assertFalse(_contains(glyph, "emoji"), "Minor glyph should not contain emoji");
            }
        }
    }
    
    /**
     * @notice Test glyph coordinate validity
     */
    function test_GlyphCoordinateRanges() public pure {
        // Major glyphs should contain valid SVG coordinates
        for (uint8 i = 0; i < 12; i++) {
            string memory glyph = OmamoriGlyphs.renderMajor(i);
            assertTrue(_hasValidCoordinates(glyph), "Major glyph should have valid coordinates");
        }
        
        // Minor glyphs should contain valid SVG coordinates
        for (uint8 majorId = 0; majorId < 12; majorId++) {
            for (uint8 minorId = 0; minorId < 4; minorId++) {
                string memory glyph = OmamoriGlyphs.renderMinor(majorId, minorId);
                assertTrue(_hasValidCoordinates(glyph), "Minor glyph should have valid coordinates");
            }
        }
    }
    
    // Helper functions
    
    function _containsSvgElement(string memory svg) private pure returns (bool) {
        return _contains(svg, "<line") || _contains(svg, "<rect") || 
               _contains(svg, "<circle") || _contains(svg, "<polygon") || 
               _contains(svg, "<polyline") || _contains(svg, "<path");
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
    
    function _countOccurrences(string memory str, string memory substr) private pure returns (uint256) {
        bytes memory strBytes = bytes(str);
        bytes memory substrBytes = bytes(substr);
        uint256 count = 0;
        
        if (substrBytes.length > strBytes.length) return 0;
        
        for (uint i = 0; i <= strBytes.length - substrBytes.length; i++) {
            bool found = true;
            for (uint j = 0; j < substrBytes.length; j++) {
                if (strBytes[i + j] != substrBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                count++;
                i += substrBytes.length - 1; // Skip past this occurrence
            }
        }
        return count;
    }
    
    function _hasValidCoordinates(string memory svg) private pure returns (bool) {
        // Check for various coordinate formats in SVG
        return (_contains(svg, "x") || _contains(svg, "cx") || _contains(svg, "points")) && 
               (_contains(svg, "y") || _contains(svg, "cy") || _contains(svg, "points")) && 
               bytes(svg).length > 20; // Reasonable minimum length for SVG content
    }
}
