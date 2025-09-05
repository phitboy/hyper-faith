// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IMaterials.sol";
import "../libraries/OmamoriGlyphs.sol";
import "../libraries/PunchLayout.sol";

/**
 * @title OmamoriRender
 * @notice On-chain SVG renderer that generates complete tokenURI JSON with embedded SVG
 * @dev Integrates materials, glyphs, and punch layout for complete on-chain rendering
 * @author Hyper Faith Team
 */
contract OmamoriRender {
    
    /// @notice Materials registry for colors and metadata
    IMaterials public immutable materials;
    
    /// @notice SVG viewBox dimensions
    uint256 public constant SVG_WIDTH = 1000;
    uint256 public constant SVG_HEIGHT = 1400;
    
    /**
     * @notice Initialize renderer with materials registry
     * @param _materials Address of the materials registry contract
     */
    constructor(address _materials) {
        materials = IMaterials(_materials);
    }
    
    /**
     * @notice Generate complete tokenURI JSON with embedded SVG
     * @param tokenId Token ID for metadata
     * @param majorId Major glyph ID (0-11)
     * @param minorId Minor glyph ID (0-3)
     * @param materialId Material ID (0-23)
     * @param punchCount Number of punches (0-25)
     * @param seed Random seed for punch layout
     * @param hypeBurned Amount of HYPE burned (metadata only, doesn't affect visuals)
     * @return Base64 encoded JSON metadata with embedded SVG
     */
    function tokenURIView(
        uint256 tokenId,
        uint8 majorId,
        uint8 minorId,
        uint16 materialId,
        uint8 punchCount,
        uint64 seed,
        uint256 hypeBurned
    ) external view returns (string memory) {
        // Get material data
        IMaterials.MaterialView memory material = materials.viewMaterial(materialId);
        
        // Generate SVG
        string memory svg = _generateSVG(majorId, minorId, material, punchCount, seed);
        
        // Generate attributes
        string memory attributes = _generateAttributes(
            majorId, minorId, material, materialId, punchCount, hypeBurned
        );
        
        // Create JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name":"Omamori #', _toString(tokenId), '",',
            '"description":"Ancient talismans for the modern trader. 100% on-chain SVG art.",',
            '"image":"data:image/svg+xml;base64,', _base64Encode(bytes(svg)), '",',
            '"attributes":', attributes,
            '}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(json))
        ));
    }
    
    /**
     * @notice Generate complete SVG for the Omamori tablet
     * @param majorId Major glyph ID
     * @param minorId Minor glyph ID  
     * @param material Material data with colors
     * @param punchCount Number of punches
     * @param seed Random seed for layout
     * @return Complete SVG string
     */
    function _generateSVG(
        uint8 majorId,
        uint8 minorId,
        IMaterials.MaterialView memory material,
        uint8 punchCount,
        uint64 seed
    ) internal pure returns (string memory) {
        // Get punch positions
        (uint256[25] memory punchX, uint256[25] memory punchY) = PunchLayout.transformSlots(seed, punchCount);
        
        // Render glyphs
        string memory majorGlyph = OmamoriGlyphs.renderMajor(majorId);
        string memory minorGlyph = OmamoriGlyphs.renderMinor(majorId, minorId);
        
        // Generate punch elements
        string memory punches = _generatePunches(punchX, punchY, punchCount, material.stroke);
        
        return string(abi.encodePacked(
            '<svg viewBox="0 0 ', _toString(SVG_WIDTH), ' ', _toString(SVG_HEIGHT), '" xmlns="http://www.w3.org/2000/svg">',
            '<defs>',
                '<style>',
                    '.tablet-bg { fill: ', material.bg, '; }',
                    '.tablet-stroke { stroke: ', material.stroke, '; fill: none; }',
                    '.glyph { stroke: ', material.stroke, '; fill: ', material.stroke, '; }',
                    '.punch { stroke: ', material.stroke, '; }',
                '</style>',
            '</defs>',
            
            // Background
            '<rect width="', _toString(SVG_WIDTH), '" height="', _toString(SVG_HEIGHT), '" class="tablet-bg"/>',
            
            // Main tablet slab with rounded corners
            '<rect x="100" y="150" width="800" height="1100" rx="40" ry="40" class="tablet-bg tablet-stroke" stroke-width="6"/>',
            
            // Glyphs with material stroke color
            '<g class="glyph" stroke-width="6">',
                majorGlyph,
                minorGlyph,
            '</g>',
            
            // Punches
            punches,
            
            // Material label at bottom
            '<text x="500" y="1300" font-family="monospace" font-size="24" font-weight="bold" fill="', material.stroke, '" text-anchor="middle">',
                material.name,
            '</text>',
            '<text x="500" y="1330" font-family="sans-serif" font-size="16" fill="', material.stroke, '" text-anchor="middle" opacity="0.7">',
                material.tierName,
            '</text>',
            
            '</svg>'
        ));
    }
    
    /**
     * @notice Generate punch rectangle elements
     * @param punchX Array of punch x coordinates
     * @param punchY Array of punch y coordinates
     * @param punchCount Number of active punches
     * @param strokeColor Stroke color for punches
     * @return SVG string for all punch elements
     */
    function _generatePunches(
        uint256[25] memory punchX,
        uint256[25] memory punchY,
        uint8 punchCount,
        string memory strokeColor
    ) internal pure returns (string memory) {
        string memory result = '<g class="punch">';
        
        for (uint256 i = 0; i < 25; i++) {
            // Calculate punch rectangle (12x12 centered on coordinate)
            uint256 x = punchX[i] >= 6 ? punchX[i] - 6 : 0;
            uint256 y = punchY[i] >= 6 ? punchY[i] - 6 : 0;
            
            if (i < punchCount) {
                // Filled punch (active)
                result = string(abi.encodePacked(
                    result,
                    '<rect x="', _toString(x), '" y="', _toString(y), '" width="12" height="12" ',
                    'rx="2" ry="2" fill="', strokeColor, '" stroke="', strokeColor, '" stroke-width="1" opacity="0.8"/>'
                ));
            } else {
                // Empty punch (inactive)
                result = string(abi.encodePacked(
                    result,
                    '<rect x="', _toString(x), '" y="', _toString(y), '" width="12" height="12" ',
                    'rx="2" ry="2" fill="none" stroke="', strokeColor, '" stroke-width="1" opacity="0.3"/>'
                ));
            }
        }
        
        return string(abi.encodePacked(result, '</g>'));
    }
    
    /**
     * @notice Generate JSON attributes array
     * @param majorId Major glyph ID
     * @param minorId Minor glyph ID
     * @param material Material data
     * @param materialId Material ID
     * @param punchCount Number of punches
     * @param hypeBurned Amount of HYPE burned
     * @return JSON attributes string
     */
    function _generateAttributes(
        uint8 majorId,
        uint8 minorId,
        IMaterials.MaterialView memory material,
        uint16 materialId,
        uint8 punchCount,
        uint256 hypeBurned
    ) internal pure returns (string memory) {
        // Major names
        string[12] memory majorNames = [
            "Liquidity", "Leverage", "Volatility", "Narrative", "The Macro", "Discipline",
            "FOMO", "FUD", "RNG", "Max Pain", "The Chat", "Ego"
        ];
        
        // Minor names per major
        string[4][12] memory minorNames = [
            ["Fills", "Market-Maker", "Spread", "Volume"],                    // Liquidity
            ["Margin", "Liqd", "Max Long", "Max Short"],                     // Leverage  
            ["Pump", "Dump", "Chop", "Pattern"],                             // Volatility
            ["Insider", "Hype", "News", "Cope"],                             // Narrative
            ["Regulator", "Bear", "Bull", "Black Swan"],                     // The Macro
            ["Take Profit", "Size", "Strategy", "Sideline"],                 // Discipline
            ["BTFD", "Top Signal", "Market Price", "Conviction"],            // FOMO
            ["Shills", "PsyOps", "Rugs", "Scam"],                          // FUD
            ["Mints", "Order Routing", "Uptime", "Prediction"],             // RNG
            ["Too Early", "Too Late", "Too Little", "Too Much"],            // Max Pain
            ["Alpha", "Slop", "In", "Out"],                                 // The Chat
            ["Touch Grass", "Hyperliquid", "Family", "Needs"]               // Ego
        ];
        
        return string(abi.encodePacked(
            '[',
            '{"trait_type":"Major","value":"', majorNames[majorId], '"},',
            '{"trait_type":"Minor","value":"', minorNames[majorId][minorId], '"},',
            '{"trait_type":"Material","value":"', material.name, '"},',
            '{"trait_type":"Rarity Tier","value":"', material.tierName, '"},',
            '{"trait_type":"Material ID","value":', _toString(materialId), '},',
            '{"trait_type":"Punch Count","value":', _toString(punchCount), '},',
            '{"trait_type":"HYPE Burned","value":"', _formatHype(hypeBurned), '"}',
            ']'
        ));
    }
    
    /**
     * @notice Format HYPE amount for display (convert wei to HYPE)
     * @param amount Amount in wei
     * @return Formatted string with HYPE suffix
     */
    function _formatHype(uint256 amount) internal pure returns (string memory) {
        // Convert wei to HYPE (18 decimals) and format
        uint256 hype = amount / 1e18;
        uint256 remainder = (amount % 1e18) / 1e16; // 2 decimal places
        
        if (remainder == 0) {
            return string(abi.encodePacked(_toString(hype), " HYPE"));
        } else if (remainder < 10) {
            // Pad single digit with zero (e.g., 1.05 HYPE)
            return string(abi.encodePacked(_toString(hype), ".0", _toString(remainder), " HYPE"));
        } else {
            return string(abi.encodePacked(_toString(hype), ".", _toString(remainder), " HYPE"));
        }
    }
    
    /**
     * @notice Convert uint256 to string
     * @param value Number to convert
     * @return String representation
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
    
    /**
     * @notice Base64 encode bytes
     * @param data Data to encode
     * @return Base64 encoded string
     */
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        string memory result = new string(encodedLen + 32);
        
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            
            for {
                let dataPtr := data
                let endPtr := add(dataPtr, mload(data))
            } lt(dataPtr, endPtr) {
                
            } {
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)
                
                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(input, 0x3F))))
                resultPtr := add(resultPtr, 1)
            }
            
            switch mod(mload(data), 3)
            case 1 {
                mstore8(sub(resultPtr, 2), 0x3d)
                mstore8(sub(resultPtr, 1), 0x3d)
            }
            case 2 {
                mstore8(sub(resultPtr, 1), 0x3d)
            }
        }
        
        return result;
    }
}
