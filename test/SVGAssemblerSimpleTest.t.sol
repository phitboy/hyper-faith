// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/SVGAssembler.sol";
import "../contracts/GlyphRenderer.sol";
import "../contracts/PunchRenderer.sol";

contract SVGAssemblerSimpleTest is Test {
    function test_SVGAssemblerDeployment() public {
        // Deploy renderer contracts
        GlyphRenderer glyphRenderer = new GlyphRenderer();
        PunchRenderer punchRenderer = new PunchRenderer();
        
        uint256 gasBefore = gasleft();
        
        // Deploy SVGAssembler contract
        SVGAssembler assembler = new SVGAssembler(address(glyphRenderer), address(punchRenderer));
        
        uint256 gasUsed = gasBefore - gasleft();
        console.log("SVGAssembler deployment gas:", gasUsed);
        console.log("Fits in 2M gas limit:", gasUsed < 2000000);
        console.log("Percentage of 2M limit:", (gasUsed * 100) / 2000000, "%");
        
        if (gasUsed < 2000000) {
            console.log("SUCCESS: SVGAssembler fits in HyperEVM gas limit!");
        } else {
            console.log("FAILED: Exceeds gas limit by:", gasUsed - 2000000);
        }
        
        // Verify contract is deployed correctly
        require(assembler.glyphRenderer() == address(glyphRenderer), "Glyph renderer not set");
        require(assembler.punchRenderer() == address(punchRenderer), "Punch renderer not set");
        require(assembler.owner() == address(this), "Owner not set");
        
        console.log("SVGAssembler deployment: SUCCESS");
    }
    
    function test_RendererContracts() public {
        // Test individual renderer deployments
        uint256 gasBefore = gasleft();
        GlyphRenderer glyphRenderer = new GlyphRenderer();
        uint256 glyphGas = gasBefore - gasleft();
        
        gasBefore = gasleft();
        PunchRenderer punchRenderer = new PunchRenderer();
        uint256 punchGas = gasBefore - gasleft();
        
        gasBefore = gasleft();
        SVGAssembler assembler = new SVGAssembler(address(glyphRenderer), address(punchRenderer));
        uint256 assemblerGas = gasBefore - gasleft();
        
        uint256 totalGas = glyphGas + punchGas + assemblerGas;
        
        console.log("GlyphRenderer gas:", glyphGas);
        console.log("PunchRenderer gas:", punchGas);
        console.log("SVGAssembler gas:", assemblerGas);
        console.log("Total multi-contract system gas:", totalGas);
        console.log("Total fits in 2M limit:", totalGas < 2000000);
        console.log("Total percentage of 2M limit:", (totalGas * 100) / 2000000, "%");
        
        if (totalGas < 2000000) {
            console.log("SUCCESS: Complete rendering system fits in HyperEVM gas limit!");
        } else {
            console.log("FAILED: Total exceeds gas limit by:", totalGas - 2000000);
        }
        
        // Test basic functionality
        string memory majorGlyph = glyphRenderer.renderMajor(0);
        string memory minorGlyph = glyphRenderer.renderMinor(0, 0);
        string memory punches = punchRenderer.renderPunches(12345, 5);
        
        require(bytes(majorGlyph).length > 0, "Major glyph should not be empty");
        require(bytes(minorGlyph).length > 0, "Minor glyph should not be empty");
        require(bytes(punches).length > 0, "Punches should not be empty");
        
        console.log("Renderer functionality: SUCCESS");
    }
}
