// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/GlyphRenderer.sol";

contract GlyphRendererGasTest is Test {
    function test_GlyphRendererGas() public {
        uint256 gasBefore = gasleft();
        
        // Deploy GlyphRenderer contract
        GlyphRenderer renderer = new GlyphRenderer();
        
        uint256 gasUsed = gasBefore - gasleft();
        console.log("GlyphRenderer deployment gas:", gasUsed);
        console.log("Fits in 2M gas limit:", gasUsed < 2000000);
        console.log("Percentage of 2M limit:", (gasUsed * 100) / 2000000, "%");
        
        if (gasUsed < 2000000) {
            console.log("SUCCESS: GlyphRenderer fits in HyperEVM gas limit!");
        } else {
            console.log("FAILED: Exceeds gas limit by:", gasUsed - 2000000);
        }
    }
    
    function test_GlyphRendering() public {
        GlyphRenderer renderer = new GlyphRenderer();
        
        // Test major glyph rendering
        uint256 gasBefore = gasleft();
        string memory majorGlyph = renderer.renderMajor(0); // Liquidity
        uint256 majorGas = gasBefore - gasleft();
        
        console.log("Major glyph render gas:", majorGas);
        console.log("Major glyph length:", bytes(majorGlyph).length);
        
        // Test minor glyph rendering
        gasBefore = gasleft();
        string memory minorGlyph = renderer.renderMinor(0, 0); // Liquidity -> Fills
        uint256 minorGas = gasBefore - gasleft();
        
        console.log("Minor glyph render gas:", minorGas);
        console.log("Minor glyph length:", bytes(minorGlyph).length);
        
        // Verify glyphs are not empty
        require(bytes(majorGlyph).length > 0, "Empty major glyph");
        require(bytes(minorGlyph).length > 0, "Empty minor glyph");
        
        console.log("Glyph rendering: SUCCESS");
    }
}
