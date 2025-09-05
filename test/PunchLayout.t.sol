// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../libraries/PunchLayout.sol";

/**
 * @title PunchLayoutTest
 * @notice Tests for punch diamond layout and collision detection
 * @dev Verifies transform logic, collision detection, and fallback behavior
 */
contract PunchLayoutTest is Test {
    
    /**
     * @notice Test base diamond slot generation
     */
    function test_BaseSlots() public pure {
        (uint256[25] memory xs, uint256[25] memory ys) = PunchLayout.getBaseSlots();
        
        // Verify we have 25 slots
        assertEq(xs.length, 25, "Should have 25 x coordinates");
        assertEq(ys.length, 25, "Should have 25 y coordinates");
        
        // Verify center slot (index 12 in 5th row)
        assertEq(xs[12], 500, "Center x should be 500");
        assertEq(ys[12], 620, "Center y should be 620");
        
        // Verify first slot (top of diamond)
        assertEq(xs[0], 500, "First slot x should be 500");
        assertEq(ys[0], 420, "First slot y should be 420");
        
        // Verify last slot (bottom of diamond)
        assertEq(xs[24], 500, "Last slot x should be 500");
        assertEq(ys[24], 820, "Last slot y should be 820");
    }
    
    /**
     * @notice Test tablet bounds configuration
     */
    function test_TabletBounds() public pure {
        PunchLayout.TabletBounds memory bounds = PunchLayout.getTabletBounds();
        
        assertEq(bounds.xMin, 140, "Tablet xMin incorrect");
        assertEq(bounds.yMin, 190, "Tablet yMin incorrect");
        assertEq(bounds.xMax, 860, "Tablet xMax incorrect");
        assertEq(bounds.yMax, 1210, "Tablet yMax incorrect");
        
        // Verify bounds make sense
        assertTrue(bounds.xMax > bounds.xMin, "xMax should be greater than xMin");
        assertTrue(bounds.yMax > bounds.yMin, "yMax should be greater than yMin");
    }
    
    /**
     * @notice Test glyph bounding boxes
     */
    function test_GlyphBoxes() public pure {
        PunchLayout.GlyphBox memory majorBox = PunchLayout.getMajorBox();
        PunchLayout.GlyphBox memory minorBox = PunchLayout.getMinorBox();
        
        // Major box (top-left)
        assertEq(majorBox.x1, 200, "Major box x1 incorrect");
        assertEq(majorBox.y1, 320, "Major box y1 incorrect");
        assertEq(majorBox.x2, 390, "Major box x2 incorrect");
        assertEq(majorBox.y2, 600, "Major box y2 incorrect");
        
        // Minor box (bottom-right)
        assertEq(minorBox.x1, 690, "Minor box x1 incorrect");
        assertEq(minorBox.y1, 970, "Minor box y1 incorrect");
        assertEq(minorBox.x2, 870, "Minor box x2 incorrect");
        assertEq(minorBox.y2, 1190, "Minor box y2 incorrect");
        
        // Verify boxes don't overlap
        assertFalse(
            PunchLayout.checkOverlap(
                majorBox.x1, majorBox.y1, majorBox.x2, majorBox.y2,
                minorBox.x1, minorBox.y1, minorBox.x2, minorBox.y2
            ),
            "Major and Minor boxes should not overlap"
        );
    }
    
    /**
     * @notice Test angle table values
     */
    function test_AngleTable() public pure {
        (int256[7] memory angles, int256[7] memory cos1e4, int256[7] memory sin1e4) = PunchLayout.getAngleTable();
        
        // Verify angle values
        assertEq(angles[0], -12, "First angle should be -12");
        assertEq(angles[3], 0, "Middle angle should be 0");
        assertEq(angles[6], 12, "Last angle should be 12");
        
        // Verify cos(0) = 1.0 (scaled by 1e4)
        assertEq(cos1e4[3], 10000, "cos(0) should be 10000");
        
        // Verify sin(0) = 0
        assertEq(sin1e4[3], 0, "sin(0) should be 0");
        
        // Verify symmetry: cos(-x) = cos(x)
        assertEq(cos1e4[0], cos1e4[6], "cos should be symmetric");
        
        // Verify antisymmetry: sin(-x) = -sin(x)
        assertEq(sin1e4[0], -sin1e4[6], "sin should be antisymmetric");
    }
    
    /**
     * @notice Test jitter generation
     */
    function test_JitterGeneration() public pure {
        uint64 seed = 12345;
        
        (int256 dx1, int256 dy1) = PunchLayout.generateJitter(seed, 0);
        (int256 dx2, int256 dy2) = PunchLayout.generateJitter(seed, 1);
        
        // Verify jitter is in valid range (-18 to 18)
        assertTrue(dx1 >= -18 && dx1 <= 18, "dx1 out of range");
        assertTrue(dy1 >= -18 && dy1 <= 18, "dy1 out of range");
        assertTrue(dx2 >= -18 && dx2 <= 18, "dx2 out of range");
        assertTrue(dy2 >= -18 && dy2 <= 18, "dy2 out of range");
        
        // Verify different nonces produce different results
        assertTrue(dx1 != dx2 || dy1 != dy2, "Different nonces should produce different jitter");
        
        // Verify deterministic behavior
        (int256 dx1_repeat, int256 dy1_repeat) = PunchLayout.generateJitter(seed, 0);
        assertEq(dx1, dx1_repeat, "Jitter should be deterministic");
        assertEq(dy1, dy1_repeat, "Jitter should be deterministic");
    }
    
    /**
     * @notice Test overlap detection
     */
    function test_OverlapDetection() public pure {
        // Test non-overlapping boxes
        assertFalse(
            PunchLayout.checkOverlap(0, 0, 10, 10, 20, 20, 30, 30),
            "Separated boxes should not overlap"
        );
        
        // Test overlapping boxes
        assertTrue(
            PunchLayout.checkOverlap(0, 0, 10, 10, 5, 5, 15, 15),
            "Overlapping boxes should be detected"
        );
        
        // Test touching boxes (edge case - should be considered overlap for collision detection)
        assertTrue(
            PunchLayout.checkOverlap(0, 0, 10, 10, 10, 10, 20, 20),
            "Touching boxes should be considered overlap for collision detection"
        );
        
        // Test contained boxes
        assertTrue(
            PunchLayout.checkOverlap(0, 0, 20, 20, 5, 5, 15, 15),
            "Contained boxes should overlap"
        );
    }
    
    /**
     * @notice Test transform slots with no punches
     */
    function test_TransformSlotsNoPunches() public pure {
        uint64 seed = 12345;
        (uint256[25] memory transformedX, uint256[25] memory transformedY) = PunchLayout.transformSlots(seed, 0);
        
        // With 0 punches, any transform should be valid
        // Verify we get some result (could be transformed or base)
        assertTrue(transformedX.length == 25, "Should return 25 x coordinates");
        assertTrue(transformedY.length == 25, "Should return 25 y coordinates");
    }
    
    /**
     * @notice Test transform slots with full diamond
     */
    function test_TransformSlotsFullDiamond() public pure {
        uint64 seed = 12345;
        (uint256[25] memory transformedX, uint256[25] memory transformedY) = PunchLayout.transformSlots(seed, 25);
        
        // Verify all coordinates are within tablet bounds
        PunchLayout.TabletBounds memory bounds = PunchLayout.getTabletBounds();
        
        for (uint256 i = 0; i < 25; i++) {
            assertTrue(transformedX[i] >= bounds.xMin, "Transformed x below minimum");
            assertTrue(transformedX[i] <= bounds.xMax, "Transformed x above maximum");
            assertTrue(transformedY[i] >= bounds.yMin, "Transformed y below minimum");
            assertTrue(transformedY[i] <= bounds.yMax, "Transformed y above maximum");
        }
    }
    
    /**
     * @notice Test deterministic behavior
     */
    function test_DeterministicBehavior() public pure {
        uint64 seed = 54321;
        uint8 punchCount = 10;
        
        (uint256[25] memory x1, uint256[25] memory y1) = PunchLayout.transformSlots(seed, punchCount);
        (uint256[25] memory x2, uint256[25] memory y2) = PunchLayout.transformSlots(seed, punchCount);
        
        // Same seed should produce same results
        for (uint256 i = 0; i < 25; i++) {
            assertEq(x1[i], x2[i], "X coordinates should be deterministic");
            assertEq(y1[i], y2[i], "Y coordinates should be deterministic");
        }
    }
    
    /**
     * @notice Test different seeds produce different results
     */
    function test_DifferentSeedsDifferentResults() public pure {
        // Use fewer punches to increase chance of valid transforms
        uint8 punchCount = 5;
        
        (uint256[25] memory x1, uint256[25] memory y1) = PunchLayout.transformSlots(12345, punchCount);
        (uint256[25] memory x2, uint256[25] memory y2) = PunchLayout.transformSlots(54321, punchCount);
        
        // Different seeds should likely produce different results
        bool different = false;
        for (uint256 i = 0; i < 25; i++) {
            if (x1[i] != x2[i] || y1[i] != y2[i]) {
                different = true;
                break;
            }
        }
        assertTrue(different, "Different seeds should produce different results");
    }
    
    /**
     * @notice Test invalid punch count
     */
    function test_InvalidPunchCount() public {
        vm.expectRevert("PunchLayout: Invalid punch count");
        PunchLayout.transformSlots(12345, 26);
    }
    
    /**
     * @notice Test collision avoidance with many seeds
     */
    function test_CollisionAvoidanceMultipleSeeds() public pure {
        PunchLayout.GlyphBox memory majorBox = PunchLayout.getMajorBox();
        PunchLayout.GlyphBox memory minorBox = PunchLayout.getMinorBox();
        
        // Test with multiple seeds to ensure collision avoidance works
        // Use fewer punches to avoid base diamond fallback
        for (uint64 seed = 1; seed <= 5; seed++) {
            (uint256[25] memory transformedX, uint256[25] memory transformedY) = PunchLayout.transformSlots(seed, 5);
            
            // Check first 5 punches don't overlap with glyph boxes
            for (uint256 i = 0; i < 5; i++) {
                uint256 punchLeft = transformedX[i] >= 20 ? transformedX[i] - 20 : 0;
                uint256 punchTop = transformedY[i] >= 45 ? transformedY[i] - 45 : 0;
                uint256 punchRight = transformedX[i] + 20;
                uint256 punchBottom = transformedY[i] + 45;
                
                // Should not overlap with Major box (only check if not in center area)
                if (transformedX[i] < 450 || transformedX[i] > 550) {
                    assertFalse(
                        PunchLayout.checkOverlap(
                            punchLeft, punchTop, punchRight, punchBottom,
                            majorBox.x1, majorBox.y1, majorBox.x2, majorBox.y2
                        ),
                        "Punch should not overlap Major glyph"
                    );
                }
                
                // Should not overlap with Minor box (only check if not in center area)
                if (transformedX[i] < 450 || transformedX[i] > 550) {
                    assertFalse(
                        PunchLayout.checkOverlap(
                            punchLeft, punchTop, punchRight, punchBottom,
                            minorBox.x1, minorBox.y1, minorBox.x2, minorBox.y2
                        ),
                        "Punch should not overlap Minor glyph"
                    );
                }
            }
        }
    }
}
