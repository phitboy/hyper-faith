// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PunchLayout
 * @notice Library for deterministic punch diamond layout with collision detection
 * @dev Implements 25-slot diamond with transforms that avoid glyph overlap
 * @author Hyper Faith Team
 */
library PunchLayout {
    
    /// @notice Number of punch slots in the diamond
    uint256 public constant PUNCH_COUNT = 25;
    
    /// @notice Punch rectangle dimensions
    uint256 public constant PUNCH_WIDTH = 40;
    uint256 public constant PUNCH_HEIGHT = 90;
    
    /// @notice Tablet interior bounds
    struct TabletBounds {
        uint256 xMin;
        uint256 yMin;
        uint256 xMax;
        uint256 yMax;
    }
    
    /// @notice Glyph bounding box
    struct GlyphBox {
        uint256 x1;
        uint256 y1;
        uint256 x2;
        uint256 y2;
    }
    
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
            470, 470,                               // Row 2
            520, 520, 520,                          // Row 3
            570, 570, 570, 570,                     // Row 4
            620, 620, 620, 620, 620,                // Row 5 - center
            670, 670, 670, 670,                     // Row 6
            720, 720, 720,                          // Row 7
            770, 770,                               // Row 8
            820                                     // Row 9
        ];
        
        xs = tempXs;
        ys = tempYs;
    }
    
    /**
     * @notice Get tablet bounds for collision detection
     * @return TabletBounds struct with interior boundaries
     */
    function getTabletBounds() public pure returns (TabletBounds memory) {
        return TabletBounds({
            xMin: 140,
            yMin: 190,
            xMax: 860,
            yMax: 1210
        });
    }
    
    /**
     * @notice Get Major glyph bounding box (top-left cluster)
     * @return GlyphBox struct with Major glyph boundaries
     */
    function getMajorBox() public pure returns (GlyphBox memory) {
        return GlyphBox({
            x1: 200,
            y1: 320,
            x2: 390,
            y2: 600
        });
    }
    
    /**
     * @notice Get Minor glyph bounding box (bottom-right cluster)
     * @return GlyphBox struct with Minor glyph boundaries
     */
    function getMinorBox() public pure returns (GlyphBox memory) {
        return GlyphBox({
            x1: 690,
            y1: 970,
            x2: 870,
            y2: 1190
        });
    }
    
    /**
     * @notice Get fixed-point angle table for rotations
     * @return angles Array of 7 angles in degrees: {-12, -8, -4, 0, 4, 8, 12}
     * @return cos1e4 Array of cosine values scaled by 1e4
     * @return sin1e4 Array of sine values scaled by 1e4
     */
    function getAngleTable() public pure returns (
        int256[7] memory angles,
        int256[7] memory cos1e4,
        int256[7] memory sin1e4
    ) {
        angles = [int256(-12), -8, -4, 0, 4, 8, 12];
        cos1e4 = [int256(9781), 9903, 9976, 10000, 9976, 9903, 9781];
        sin1e4 = [int256(-2079), -1392, -698, 0, 698, 1392, 2079];
    }
    
    /**
     * @notice Generate deterministic jitter from seed and nonce
     * @param seed Random seed for deterministic generation
     * @param nonce Additional entropy for variation
     * @return dx Translation in x direction (-18 to 18)
     * @return dy Translation in y direction (-18 to 18)
     */
    function generateJitter(uint64 seed, uint256 nonce) public pure returns (int256 dx, int256 dy) {
        uint256 hash1 = uint256(keccak256(abi.encodePacked(seed, nonce, uint256(0xF17E))));
        uint256 hash2 = uint256(keccak256(abi.encodePacked(seed, nonce, uint256(0x1234))));
        
        int256 rx = int256((hash1 % 256)) - 128; // -127 to 127
        int256 ry = int256((hash2 % 256)) - 128;
        
        dx = rx % 19; // -18 to 18
        dy = ry % 19;
    }
    
    /**
     * @notice Check if two axis-aligned bounding boxes overlap
     * @param ax1 First box left edge
     * @param ay1 First box top edge  
     * @param ax2 First box right edge
     * @param ay2 First box bottom edge
     * @param bx1 Second box left edge
     * @param by1 Second box top edge
     * @param bx2 Second box right edge
     * @param by2 Second box bottom edge
     * @return True if boxes overlap
     */
    function checkOverlap(
        uint256 ax1, uint256 ay1, uint256 ax2, uint256 ay2,
        uint256 bx1, uint256 by1, uint256 bx2, uint256 by2
    ) public pure returns (bool) {
        return !(ax2 < bx1 || bx2 < ax1 || ay2 < by1 || by2 < ay1);
    }
    
    /**
     * @notice Transform punch slots with rotation and translation, avoiding collisions
     * @param seed Random seed for deterministic transforms
     * @param punchCount Number of active punches (0-25)
     * @return transformedX Array of transformed x coordinates
     * @return transformedY Array of transformed y coordinates
     * @dev Tries up to 10 transform candidates, falls back to base diamond if all fail
     */
    function transformSlots(uint64 seed, uint8 punchCount) 
        external 
        pure 
        returns (uint256[PUNCH_COUNT] memory transformedX, uint256[PUNCH_COUNT] memory transformedY) 
    {
        require(punchCount <= PUNCH_COUNT, "PunchLayout: Invalid punch count");
        
        (uint256[PUNCH_COUNT] memory baseX, uint256[PUNCH_COUNT] memory baseY) = getBaseSlots();
        TabletBounds memory bounds = getTabletBounds();
        GlyphBox memory majorBox = getMajorBox();
        GlyphBox memory minorBox = getMinorBox();
        (, int256[7] memory cos1e4, int256[7] memory sin1e4) = getAngleTable();
        
        // Pivot point for rotation (center of diamond)
        int256 cx = 500;
        int256 cy = 620;
        
        // Try up to 10 transform candidates
        for (uint256 k = 0; k < 10; k++) {
            uint256 angleIdx = uint256(keccak256(abi.encodePacked(seed, k))) % 7;
            (int256 dx, int256 dy) = generateJitter(seed, k + 33);
            
            int256 cosA = cos1e4[angleIdx];
            int256 sinA = sin1e4[angleIdx];
            
            bool transformValid = true;
            
            // Check if transform is valid for all active punches
            for (uint256 i = 0; i < punchCount && i < PUNCH_COUNT; i++) {
                int256 x0 = int256(baseX[i]);
                int256 y0 = int256(baseY[i]);
                
                // Rotate around pivot
                int256 xr = cx + ((x0 - cx) * cosA - (y0 - cy) * sinA) / 10000;
                int256 yr = cy + ((x0 - cx) * sinA + (y0 - cy) * cosA) / 10000;
                
                // Translate
                int256 xt = xr + dx;
                int256 yt = yr + dy;
                
                // Convert to unsigned for bounds checking
                if (xt < 0 || yt < 0) {
                    transformValid = false;
                    break;
                }
                
                uint256 punchX = uint256(xt);
                uint256 punchY = uint256(yt);
                
                // Punch rectangle bounds (40x90 centered on punch position)
                uint256 punchLeft = punchX >= PUNCH_WIDTH/2 ? punchX - PUNCH_WIDTH/2 : 0;
                uint256 punchTop = punchY >= PUNCH_HEIGHT/2 ? punchY - PUNCH_HEIGHT/2 : 0;
                uint256 punchRight = punchX + PUNCH_WIDTH/2;
                uint256 punchBottom = punchY + PUNCH_HEIGHT/2;
                
                // Check tablet bounds
                if (punchLeft < bounds.xMin || punchTop < bounds.yMin || 
                    punchRight > bounds.xMax || punchBottom > bounds.yMax) {
                    transformValid = false;
                    break;
                }
                
                // Check Major glyph overlap
                if (checkOverlap(punchLeft, punchTop, punchRight, punchBottom,
                                majorBox.x1, majorBox.y1, majorBox.x2, majorBox.y2)) {
                    transformValid = false;
                    break;
                }
                
                // Check Minor glyph overlap
                if (checkOverlap(punchLeft, punchTop, punchRight, punchBottom,
                                minorBox.x1, minorBox.y1, minorBox.x2, minorBox.y2)) {
                    transformValid = false;
                    break;
                }
            }
            
            if (transformValid) {
                // Apply the valid transform to all slots
                for (uint256 i = 0; i < PUNCH_COUNT; i++) {
                    int256 x0 = int256(baseX[i]);
                    int256 y0 = int256(baseY[i]);
                    
                    // Rotate around pivot
                    int256 xr = cx + ((x0 - cx) * cosA - (y0 - cy) * sinA) / 10000;
                    int256 yr = cy + ((x0 - cx) * sinA + (y0 - cy) * cosA) / 10000;
                    
                    // Translate
                    int256 xt = xr + dx;
                    int256 yt = yr + dy;
                    
                    // Ensure non-negative coordinates
                    transformedX[i] = xt >= 0 ? uint256(xt) : 0;
                    transformedY[i] = yt >= 0 ? uint256(yt) : 0;
                }
                
                return (transformedX, transformedY);
            }
        }
        
        // Fallback to base diamond if no valid transform found
        transformedX = baseX;
        transformedY = baseY;
    }
}
