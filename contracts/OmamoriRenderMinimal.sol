// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IMaterials.sol";
import "../libraries/OmamoriGlyphs.sol";
import "../libraries/PunchLayout.sol";

/**
 * @title OmamoriRenderMinimal
 * @notice Gas-optimized on-chain SVG renderer for HyperEVM deployment
 * @dev Simplified version with reduced string operations and storage
 * @author Hyper Faith Team
 */
contract OmamoriRenderMinimal {
    
    /// @notice Materials registry for colors and metadata
    IMaterials public immutable materials;
    
    /// @notice SVG dimensions
    uint256 public constant SVG_WIDTH = 1000;
    uint256 public constant SVG_HEIGHT = 1400;
    
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
     * @param hypeBurned Amount of HYPE burned
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
        
        // Generate simplified SVG
        string memory svg = _generateSimpleSVG(majorId, minorId, material, punchCount, seed);
        
        // Create minimal JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name":"Omamori #', _toString(tokenId), '",',
            '"description":"Ancient talismans for modern traders. On-chain SVG art.",',
            '"image":"data:image/svg+xml;base64,', _base64Encode(bytes(svg)), '",',
            '"attributes":[',
                '{"trait_type":"Material","value":"', material.name, '"},',
                '{"trait_type":"Rarity","value":"', material.tierName, '"},',
                '{"trait_type":"Punches","value":', _toString(punchCount), '},',
                '{"trait_type":"Major ID","value":', _toString(majorId), '},',
                '{"trait_type":"Minor ID","value":', _toString(minorId), '},',
                '{"trait_type":"HYPE Burned","value":', _toString(hypeBurned), '}',
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(json))
        ));
    }
    
    /**
     * @notice Generate simplified SVG
     */
    function _generateSimpleSVG(
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
        
        // Generate punches
        string memory punches = _generatePunches(punchX, punchY, punchCount, material.stroke);
        
        return string(abi.encodePacked(
            '<svg viewBox="0 0 1000 1400" xmlns="http://www.w3.org/2000/svg">',
            '<rect width="1000" height="1400" fill="', material.bg, '"/>',
            '<rect x="100" y="150" width="800" height="1100" rx="40" fill="', material.bg, '" stroke="', material.stroke, '" stroke-width="6"/>',
            '<g stroke="', material.stroke, '" fill="', material.stroke, '" stroke-width="6">',
                majorGlyph,
                minorGlyph,
            '</g>',
            punches,
            '<text x="500" y="1300" font-family="monospace" font-size="24" fill="', material.stroke, '" text-anchor="middle">',
                material.name,
            '</text>',
            '</svg>'
        ));
    }
    
    /**
     * @notice Generate punch elements
     */
    function _generatePunches(
        uint256[25] memory punchX,
        uint256[25] memory punchY,
        uint8 punchCount,
        string memory strokeColor
    ) internal pure returns (string memory) {
        if (punchCount == 0) return "";
        
        string memory result = string(abi.encodePacked('<g stroke="', strokeColor, '" fill="none" stroke-width="2">'));
        
        for (uint8 i = 0; i < punchCount; i++) {
            result = string(abi.encodePacked(
                result,
                '<circle cx="', _toString(punchX[i]), '" cy="', _toString(punchY[i]), '" r="8"/>'
            ));
        }
        
        return string(abi.encodePacked(result, '</g>'));
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
    
    /**
     * @notice Simplified Base64 encoding
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
