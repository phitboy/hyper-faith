// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/PunchRenderer.sol";

contract PunchRendererGasTest is Test {
    function test_PunchRendererGas() public {
        uint256 gasBefore = gasleft();
        
        // Deploy PunchRenderer contract
        PunchRenderer renderer = new PunchRenderer();
        
        uint256 gasUsed = gasBefore - gasleft();
        console.log("PunchRenderer deployment gas:", gasUsed);
        console.log("Fits in 2M gas limit:", gasUsed < 2000000);
        console.log("Percentage of 2M limit:", (gasUsed * 100) / 2000000, "%");
        
        if (gasUsed < 2000000) {
            console.log("SUCCESS: PunchRenderer fits in HyperEVM gas limit!");
        } else {
            console.log("FAILED: Exceeds gas limit by:", gasUsed - 2000000);
        }
    }
    
    function test_PunchRendering() public {
        PunchRenderer renderer = new PunchRenderer();
        
        // Test punch rendering with different counts
        uint64 seed = 12345;
        
        // Test 0 punches
        uint256 gasBefore = gasleft();
        string memory noPunches = renderer.renderPunches(seed, 0);
        uint256 noPunchGas = gasBefore - gasleft();
        
        console.log("0 punches gas:", noPunchGas);
        console.log("0 punches result:", bytes(noPunches).length == 0 ? "empty" : "not empty");
        
        // Test 5 punches
        gasBefore = gasleft();
        string memory fivePunches = renderer.renderPunches(seed, 5);
        uint256 fivePunchGas = gasBefore - gasleft();
        
        console.log("5 punches gas:", fivePunchGas);
        console.log("5 punches length:", bytes(fivePunches).length);
        
        // Test 25 punches (max)
        gasBefore = gasleft();
        string memory maxPunches = renderer.renderPunches(seed, 25);
        uint256 maxPunchGas = gasBefore - gasleft();
        
        console.log("25 punches gas:", maxPunchGas);
        console.log("25 punches length:", bytes(maxPunches).length);
        
        // Test slot transformation
        gasBefore = gasleft();
        (uint256[25] memory xs, uint256[25] memory ys) = renderer.transformSlots(seed, 10);
        uint256 transformGas = gasBefore - gasleft();
        
        console.log("Transform 10 slots gas:", transformGas);
        console.log("First transformed position:", xs[0], ys[0]);
        
        // Verify results
        require(bytes(noPunches).length == 0, "No punches should be empty");
        require(bytes(fivePunches).length > 0, "Five punches should not be empty");
        require(bytes(maxPunches).length > bytes(fivePunches).length, "Max punches should be longer");
        
        console.log("Punch rendering: SUCCESS");
    }
    
    function test_GlyphOverlapCheck() public {
        PunchRenderer renderer = new PunchRenderer();
        
        // Test overlap detection
        uint256 gasBefore = gasleft();
        bool majorOverlap = renderer.checkGlyphOverlap(300, 400); // Should overlap major glyph area
        uint256 overlapGas = gasBefore - gasleft();
        
        console.log("Glyph overlap check gas:", overlapGas);
        console.log("Major area overlap detected:", majorOverlap);
        
        bool noOverlap = renderer.checkGlyphOverlap(500, 500); // Should not overlap
        console.log("Center area overlap:", noOverlap);
        
        require(majorOverlap == true, "Should detect major glyph overlap");
        
        console.log("Overlap detection: SUCCESS");
    }
}
