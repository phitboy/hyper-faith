// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IMaterials.sol";

/**
 * @title SVGAssembler
 * @notice Orchestrates complete SVG art generation by combining glyphs, punches, and materials
 * @dev Final assembler for multi-contract architecture
 * @author Hyper Faith Team
 */
contract SVGAssembler {
    
    /// @notice Deployed contracts
    IMaterials public constant MATERIALS = IMaterials(0xA5D308DE0Be64df79C6715418070a090195A5657);
    address public glyphRenderer;
    address public punchRenderer;
    
    /// @notice Contract owner
    address public owner;
    
    /// @notice Events
    event RenderersUpdated(address glyphRenderer, address punchRenderer);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "SVGAssembler: Not owner");
        _;
    }
    
    constructor(address _glyphRenderer, address _punchRenderer) {
        owner = msg.sender;
        glyphRenderer = _glyphRenderer;
        punchRenderer = _punchRenderer;
    }
    
    /**
     * @notice Update renderer contract addresses
     */
    function setRenderers(address _glyphRenderer, address _punchRenderer) external onlyOwner {
        glyphRenderer = _glyphRenderer;
        punchRenderer = _punchRenderer;
        emit RenderersUpdated(_glyphRenderer, _punchRenderer);
    }
    
    /**
     * @notice Generate complete tokenURI with embedded SVG art
     */
    function generateTokenURI(
        uint256 tokenId,
        uint8 majorId,
        uint8 minorId,
        uint16 materialId,
        uint8 punchCount,
        uint64 seed,
        uint256 hypeBurned
    ) external view returns (string memory) {
        
        // Get material data
        IMaterials.MaterialView memory material = MATERIALS.viewMaterial(materialId);
        
        // Generate SVG art
        string memory svg = _generateSVG(majorId, minorId, materialId, punchCount, seed, material);
        
        // Create JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name":"Omamori #', _toString(tokenId), '",',
            '"description":"Ancient talismans for modern traders. Fully on-chain generative art.",',
            '"image":"data:image/svg+xml;base64,', _base64Encode(bytes(svg)), '",',
            '"attributes":[',
                '{"trait_type":"Material","value":"', material.name, '"},',
                '{"trait_type":"Rarity","value":"', material.tierName, '"},',
                '{"trait_type":"Major ID","value":', _toString(majorId), '},',
                '{"trait_type":"Minor ID","value":', _toString(minorId), '},',
                '{"trait_type":"Punches","value":', _toString(punchCount), '},',
                '{"trait_type":"HYPE Burned","value":', _toString(hypeBurned), '},',
                '{"trait_type":"Seed","value":"', _toHexString(seed), '"}',
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(json))
        ));
    }
    
    /**
     * @notice Generate complete SVG art
     */
    function _generateSVG(
        uint8 majorId,
        uint8 minorId,
        uint16 materialId,
        uint8 punchCount,
        uint64 seed,
        IMaterials.MaterialView memory material
    ) internal view returns (string memory) {
        
        // Get glyphs from renderer
        string memory majorGlyph = IGlyphRenderer(glyphRenderer).renderMajor(majorId);
        string memory minorGlyph = IGlyphRenderer(glyphRenderer).renderMinor(majorId, minorId);
        
        // Get punches from renderer
        string memory punches = IPunchRenderer(punchRenderer).renderPunches(seed, punchCount);
        
        // Assemble complete SVG
        return string(abi.encodePacked(
            '<svg width="1000" height="1400" viewBox="0 0 1000 1400" xmlns="http://www.w3.org/2000/svg">',
            '<defs>',
                '<linearGradient id="materialGrad" x1="0%" y1="0%" x2="100%" y2="100%">',
                    '<stop offset="0%" style="stop-color:', material.bg, ';stop-opacity:1"/>',
                    '<stop offset="100%" style="stop-color:', material.stroke, ';stop-opacity:1"/>',
                '</linearGradient>',
            '</defs>',
            
            // Background tablet shape
            '<rect x="100" y="200" width="800" height="1000" rx="40" ry="40" ',
                'fill="url(#materialGrad)" stroke="#000" stroke-width="4"/>',
            
            // Material texture overlay
            '<rect x="120" y="220" width="760" height="960" rx="30" ry="30" ',
                'fill="', material.bg, '" opacity="0.3"/>',
            
            // Glyph layer (with material color)
            '<g stroke="', material.stroke, '" fill="', material.stroke, '">',
                majorGlyph,
                minorGlyph,
            '</g>',
            
            // Punch holes layer
            punches,
            
            // Border highlight
            '<rect x="100" y="200" width="800" height="1000" rx="40" ry="40" ',
                'fill="none" stroke="', material.stroke, '" stroke-width="2" opacity="0.8"/>',
            
            '</svg>'
        ));
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
     * @notice Convert uint64 to hex string
     */
    function _toHexString(uint64 value) internal pure returns (string memory) {
        bytes memory buffer = new bytes(18); // "0x" + 16 hex chars
        buffer[0] = "0";
        buffer[1] = "x";
        
        for (uint256 i = 16; i > 0; i--) {
            uint8 digit = uint8(value & 0xf);
            buffer[i + 1] = digit < 10 ? bytes1(uint8(48 + digit)) : bytes1(uint8(87 + digit));
            value >>= 4;
        }
        
        return string(buffer);
    }
    
    /**
     * @notice Base64 encoding
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

/**
 * @title IGlyphRenderer
 * @notice Interface for glyph renderer contract
 */
interface IGlyphRenderer {
    function renderMajor(uint8 majorId) external pure returns (string memory);
    function renderMinor(uint8 majorId, uint8 minorId) external pure returns (string memory);
}

/**
 * @title IPunchRenderer
 * @notice Interface for punch renderer contract
 */
interface IPunchRenderer {
    function renderPunches(uint64 seed, uint8 count) external pure returns (string memory);
}
