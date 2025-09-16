// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IMaterials.sol";

/**
 * @title OmamoriNFTUltra
 * @notice Maximum gas-optimized ERC-721 with essential on-chain SVG art
 * @dev Aggressive optimizations for HyperEVM 2M gas limit
 * @author Hyper Faith Team
 */
contract OmamoriNFTUltra is ERC721, Ownable {
    
    /// @notice Deployed MaterialRegistry contract
    IMaterials public constant MATERIALS = IMaterials(0xA5D308DE0Be64df79C6715418070a090195A5657);
    
    /// @notice Burn address for HYPE
    address public constant BURN_ADDRESS = 0xfefeFEFeFEFEFEFEFeFefefefefeFEfEfefefEfe;
    
    /// @notice Minimum HYPE burn amount (0.01 HYPE)
    uint256 public constant MIN_BURN = 10000000000000000;
    
    /// @notice Current token ID counter
    uint256 private _tokenIdCounter = 1;
    
    /// @notice Packed token data (single storage slot)
    mapping(uint256 => uint256) public tokenData;
    
    /// @notice Events
    event HypeBurned(address indexed burner, uint256 indexed tokenId, uint256 amount);
    
    constructor(address _initialOwner) 
        ERC721("Hyperliquid Omamori", "OMAMORI") 
        Ownable(_initialOwner) 
    {}
    
    /**
     * @notice Mint an Omamori NFT by burning native HYPE
     */
    function mint() external payable {
        require(msg.value >= MIN_BURN, "Insufficient burn");
        
        uint256 tokenId = _tokenIdCounter++;
        
        // Burn HYPE
        (bool success, ) = BURN_ADDRESS.call{value: msg.value}("");
        require(success, "Burn failed");
        
        // Generate seed
        uint256 seed = uint256(keccak256(abi.encodePacked(
            block.timestamp, block.prevrandao, msg.sender, tokenId, msg.value
        )));
        
        // Pack all data into single uint256
        // Layout: [128 bits: hypeBurned][64 bits: seed][16 bits: materialId][8 bits: other]
        uint16 materialId = _selectMaterial(uint64(seed));
        uint8 packed = uint8(seed % 12) | // majorId (4 bits)
                      ((uint8(seed >> 8) % 4) << 4) | // minorId (2 bits) 
                      ((uint8(seed >> 16) % 26) << 6); // punchCount (5 bits, but we use 2)
        
        tokenData[tokenId] = (uint256(msg.value) << 128) | 
                            (uint256(seed) << 64) | 
                            (uint256(materialId) << 8) | 
                            uint256(packed);
        
        _mint(msg.sender, tokenId);
        emit HypeBurned(msg.sender, tokenId, msg.value);
    }
    
    /**
     * @notice Generate tokenURI with minimal SVG
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        uint256 data = tokenData[tokenId];
        uint8 majorId = uint8(data) & 0x0F;
        uint8 minorId = (uint8(data) >> 4) & 0x03;
        uint8 punchCount = (uint8(data) >> 6) & 0x03; // Reduced to 0-3
        uint16 materialId = uint16(data >> 8);
        uint128 hypeBurned = uint128(data >> 128);
        
        IMaterials.MaterialView memory material = MATERIALS.viewMaterial(materialId);
        
        // Generate minimal SVG
        string memory svg = string(abi.encodePacked(
            '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">',
            '<rect width="400" height="400" fill="', material.bg, '"/>',
            '<rect x="50" y="50" width="300" height="300" rx="20" fill="', material.bg, '" stroke="', material.stroke, '" stroke-width="4"/>',
            _getGlyph(majorId),
            _getPunches(punchCount, material.stroke),
            '<text x="200" y="380" font-family="monospace" font-size="16" fill="', material.stroke, '" text-anchor="middle">',
            material.name,
            '</text></svg>'
        ));
        
        // Minimal JSON
        string memory json = string(abi.encodePacked(
            '{"name":"Omamori #', _toString(tokenId), '",',
            '"image":"data:image/svg+xml;base64,', _base64(bytes(svg)), '",',
            '"attributes":[',
            '{"trait_type":"Material","value":"', material.name, '"},',
            '{"trait_type":"Rarity","value":"', material.tierName, '"},',
            '{"trait_type":"HYPE","value":', _toString(hypeBurned), '}',
            ']}'
        ));
        
        return string(abi.encodePacked("data:application/json;base64,", _base64(bytes(json))));
    }
    
    /**
     * @notice Get minimal glyph (single element per major)
     */
    function _getGlyph(uint8 id) internal pure returns (string memory) {
        if (id == 0) return '<circle cx="200" cy="200" r="60" fill="none" stroke="currentColor" stroke-width="6"/>';
        if (id == 1) return '<line x1="140" y1="200" x2="260" y2="200" stroke="currentColor" stroke-width="6"/>';
        if (id == 2) return '<polygon points="200,140 240,200 200,260 160,200" fill="none" stroke="currentColor" stroke-width="6"/>';
        if (id == 3) return '<rect x="160" y="160" width="80" height="80" fill="none" stroke="currentColor" stroke-width="6"/>';
        if (id == 4) return '<circle cx="200" cy="200" r="40" fill="currentColor"/>';
        if (id == 5) return '<line x1="200" y1="140" x2="200" y2="260" stroke="currentColor" stroke-width="8"/>';
        if (id == 6) return '<polygon points="200,140 240,220 160,220" fill="none" stroke="currentColor" stroke-width="6"/>';
        if (id == 7) return '<polygon points="160,180 240,180 200,260" fill="none" stroke="currentColor" stroke-width="6"/>';
        if (id == 8) return '<circle cx="180" cy="180" r="8" fill="currentColor"/><circle cx="220" cy="220" r="8" fill="currentColor"/>';
        if (id == 9) return '<line x1="160" y1="160" x2="240" y2="240" stroke="currentColor" stroke-width="6"/><line x1="240" y1="160" x2="160" y2="240" stroke="currentColor" stroke-width="6"/>';
        if (id == 10) return '<rect x="180" y="180" width="40" height="40" fill="none" stroke="currentColor" stroke-width="4"/>';
        if (id == 11) return '<circle cx="200" cy="200" r="20" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="200" cy="200" r="4" fill="currentColor"/>';
        return "";
    }
    
    /**
     * @notice Get minimal punches (0-3 only)
     */
    function _getPunches(uint8 count, string memory stroke) internal pure returns (string memory) {
        if (count == 0) return "";
        if (count == 1) return string(abi.encodePacked('<circle cx="150" cy="150" r="6" fill="none" stroke="', stroke, '" stroke-width="2"/>'));
        if (count == 2) return string(abi.encodePacked('<circle cx="150" cy="150" r="6" fill="none" stroke="', stroke, '" stroke-width="2"/><circle cx="250" cy="150" r="6" fill="none" stroke="', stroke, '" stroke-width="2"/>'));
        return string(abi.encodePacked('<circle cx="150" cy="150" r="6" fill="none" stroke="', stroke, '" stroke-width="2"/><circle cx="250" cy="150" r="6" fill="none" stroke="', stroke, '" stroke-width="2"/><circle cx="200" cy="250" r="6" fill="none" stroke="', stroke, '" stroke-width="2"/>'));
    }
    
    /**
     * @notice Select material using deployed registry
     */
    function _selectMaterial(uint64 seed) internal view returns (uint16) {
        uint256 totalWeight = MATERIALS.totalWeight();
        uint256 randomValue = uint256(seed) % totalWeight;
        
        uint256 cumulativeWeight = 0;
        for (uint16 i = 0; i < 24; i++) {
            cumulativeWeight += MATERIALS.weight(i);
            if (randomValue < cumulativeWeight) return i;
        }
        return 23;
    }
    
    /**
     * @notice Minimal toString
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
     * @notice Minimal Base64 (simplified)
     */
    function _base64(bytes memory data) internal pure returns (string memory) {
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
