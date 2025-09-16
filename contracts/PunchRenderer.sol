// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PunchRenderer
 * @notice Renders punch hole patterns using SVG rectangles (extracted from PunchLayout)
 * @dev Deployable contract version for multi-contract architecture
 * @author Hyper Faith Team
 */
contract PunchRenderer {
    
    /// @notice Number of punch slots in the diamond
    uint256 public constant PUNCH_COUNT = 25;
    
    /// @notice Punch rectangle dimensions
    uint256 public constant PUNCH_WIDTH = 40;
    uint256 public constant PUNCH_HEIGHT = 90;
    
    /**
     * @notice Get base diamond slot positions (25 slots in 1,2,3,4,5,4,3,2,1 pattern)
     * @return xs Array of x coordinates for all 25 slots
     * @return ys Array of y coordinates for all 25 slots
     */
    function getBaseSlots() public pure returns (uint256[PUNCH_COUNT] memory xs, uint256[PUNCH_COUNT] memory ys) {
        // Diamond pattern: rows 1,2,3,4,5,4,3,2,1 = 25 total slots
        // Centered around (500, 620)
        uint256[25] memory tempXs = [
            uint256(500),                           // Row 1 (1 slot)
            460, 540,                               // Row 2 (2 slots)  
            420, 500, 580,                          // Row 3 (3 slots)
            380, 460, 540, 620,                     // Row 4 (4 slots)
            340, 420, 500, 580, 660,                // Row 5 (5 slots) - center
            380, 460, 540, 620,                     // Row 6 (4 slots)
            420, 500, 580,                          // Row 7 (3 slots)
            460, 540,                               // Row 8 (2 slots)
            500                                     // Row 9 (1 slot)
        ];
        
        uint256[25] memory tempYs = [
            uint256(420),                           // Row 1
            460, 460,                               // Row 2
            500, 500, 500,                          // Row 3
            540, 540, 540, 540,                     // Row 4
            580, 580, 580, 580, 580,                // Row 5 - center
            620, 620, 620, 620,                     // Row 6
            660, 660, 660,                          // Row 7
            700, 700,                               // Row 8
            740                                     // Row 9
        ];
        
        for (uint256 i = 0; i < PUNCH_COUNT; i++) {
            xs[i] = tempXs[i];
            ys[i] = tempYs[i];
        }
        
        return (xs, ys);
    }
    
    /**
     * @notice Transform punch slots with deterministic jitter and collision avoidance
     * @param seed Random seed for deterministic transforms
     * @param count Number of punches to generate (0-25)
     * @return transformedXs Array of transformed x coordinates
     * @return transformedYs Array of transformed y coordinates
     */
    function transformSlots(uint64 seed, uint8 count) 
        public 
        pure 
        returns (uint256[PUNCH_COUNT] memory transformedXs, uint256[PUNCH_COUNT] memory transformedYs) 
    {
        require(count <= PUNCH_COUNT, "PunchRenderer: Too many punches");
        
        (uint256[PUNCH_COUNT] memory baseXs, uint256[PUNCH_COUNT] memory baseYs) = getBaseSlots();
        
        // Apply deterministic transforms
        for (uint256 i = 0; i < count; i++) {
            uint256 slotSeed = uint256(keccak256(abi.encodePacked(seed, i)));
            
            // Apply jitter (±20 pixels max)
            int256 jitterX = int256((slotSeed >> 8) % 41) - 20;  // -20 to +20
            int256 jitterY = int256((slotSeed >> 16) % 41) - 20; // -20 to +20
            
            // Apply transforms with bounds checking
            transformedXs[i] = uint256(int256(baseXs[i]) + jitterX);
            transformedYs[i] = uint256(int256(baseYs[i]) + jitterY);
            
            // Ensure punches stay within tablet bounds (200-800, 300-900)
            if (transformedXs[i] < 220) transformedXs[i] = 220;
            if (transformedXs[i] > 760) transformedXs[i] = 760; // 800 - PUNCH_WIDTH
            if (transformedYs[i] < 320) transformedYs[i] = 320;
            if (transformedYs[i] > 810) transformedYs[i] = 810; // 900 - PUNCH_HEIGHT
        }
        
        return (transformedXs, transformedYs);
    }
    
    /**
     * @notice Render punch holes as SVG rectangles
     * @param seed Random seed for punch generation
     * @param count Number of punches to render (0-25)
     * @return SVG string containing all punch rectangles
     */
    function renderPunches(uint64 seed, uint8 count) external pure returns (string memory) {
        if (count == 0) {
            return "";
        }
        
        (uint256[PUNCH_COUNT] memory xs, uint256[PUNCH_COUNT] memory ys) = transformSlots(seed, count);
        
        string memory punches = "";
        
        for (uint256 i = 0; i < count; i++) {
            punches = string(abi.encodePacked(
                punches,
                '<rect x="', _toString(xs[i]), '" y="', _toString(ys[i]), 
                '" width="', _toString(PUNCH_WIDTH), '" height="', _toString(PUNCH_HEIGHT),
                '" rx="8" ry="8" fill="black" opacity="0.8"/>'
            ));
        }
        
        return punches;
    }
    
    /**
     * @notice Check if a punch overlaps with glyph areas
     * @param punchX Punch x coordinate
     * @param punchY Punch y coordinate
     * @return overlaps True if punch overlaps with major or minor glyph areas
     */
    function checkGlyphOverlap(uint256 punchX, uint256 punchY) external pure returns (bool overlaps) {
        // Major glyph area: x=220..380, y=320..600
        bool majorOverlap = (
            punchX < 380 && (punchX + PUNCH_WIDTH) > 220 &&
            punchY < 600 && (punchY + PUNCH_HEIGHT) > 320
        );
        
        // Minor glyph area: x=700..860, y=980..1180
        bool minorOverlap = (
            punchX < 860 && (punchX + PUNCH_WIDTH) > 700 &&
            punchY < 1180 && (punchY + PUNCH_HEIGHT) > 980
        );
        
        return majorOverlap || minorOverlap;
    }
    
    /**
     * @notice Convert uint256 to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
}
