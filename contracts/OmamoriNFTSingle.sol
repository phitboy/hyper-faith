// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title OmamoriNFTSingle
 * @notice Ultra-minimal single-contract Omamori NFT that fits initcode size limit
 * @dev Optimized for deployment within EIP-3860 24KB bytecode limit
 * @author Hyper Faith Team
 */
contract OmamoriNFTSingle is ERC721, Ownable, IERC2981 {
    
    /// @notice Burn address for HYPE
    address public constant BURN_ADDRESS = 0xfefeFEFeFEFEFEFEFeFefefefefeFEfEfefefEfe;
    
    /// @notice Minimum HYPE burn amount (0.01 HYPE)
    uint256 public constant MIN_BURN = 10000000000000000;
    
    /// @notice Current token ID counter
    uint256 private _tokenIdCounter = 1;
    
    /// @notice Token data storage (packed for gas efficiency)
    mapping(uint256 => bytes32) public tokenData;
    
    /// @notice Royalty configuration
    address public royaltyRecipient;
    uint96 public royaltyBasisPoints; // 500 = 5%
    
    /// @notice Events
    event HypeBurned(address indexed burner, uint256 indexed tokenId, uint256 amount);
    
    constructor(address _initialOwner, address _royaltyRecipient) 
        ERC721("Hyperliquid Omamori", "OMAMORI") 
        Ownable(_initialOwner) 
    {
        royaltyRecipient = _royaltyRecipient;
        royaltyBasisPoints = 500; // 5%
    }
    
    /**
     * @notice Mint an Omamori NFT by burning native HYPE
     */
    function mint() external payable {
        require(msg.value >= MIN_BURN, "Insufficient burn amount");
        
        uint256 tokenId = _tokenIdCounter++;
        
        // Burn native HYPE
        (bool success, ) = BURN_ADDRESS.call{value: msg.value}("");
        require(success, "HYPE burn failed");
        
        // Generate pure random seed (NO msg.value influence for fairness)
        uint64 seed = uint64(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            tokenId
        ))));
        
        // Select material using secure rarity distribution
        uint16 materialId = _selectMaterialSecure(seed);
        uint8 majorId = uint8(seed % 12);
        uint8 minorId = uint8((seed >> 8) % 4);
        uint8 punchCount = uint8((seed >> 16) % 26);
        uint120 hypeBurned = uint120(msg.value);
        
        // Pack data efficiently
        bytes32 packedData = bytes32(
            (uint256(seed) << 192) |
            (uint256(materialId) << 176) |
            (uint256(majorId) << 168) |
            (uint256(minorId) << 160) |
            (uint256(punchCount) << 152) |
            uint256(hypeBurned)
        );
        
        tokenData[tokenId] = packedData;
        _mint(msg.sender, tokenId);
        emit HypeBurned(msg.sender, tokenId, msg.value);
    }
    
    /**
     * @notice Secure material selection with proper rarity distribution
     */
    function _selectMaterialSecure(uint64 seed) internal pure returns (uint16) {
        uint256 roll = seed % 10000;
        
        if (roll < 5000) return uint16(seed % 6); // Common (50%)
        if (roll < 7500) return uint16(6 + (seed % 6)); // Uncommon (25%)
        if (roll < 9000) return uint16(12 + (seed % 6)); // Rare (15%)
        if (roll < 9750) return uint16(18 + (seed % 3)); // Ultra Rare (7.5%)
        return uint16(21 + (seed % 3)); // Mythic (2.5%)
    }
    
    /**
     * @notice Get unpacked token data
     */
    function getTokenData(uint256 tokenId) external view returns (
        uint64 seed,
        uint16 materialId,
        uint8 majorId,
        uint8 minorId,
        uint8 punchCount,
        uint120 hypeBurned
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        bytes32 data = tokenData[tokenId];
        seed = uint64(uint256(data) >> 192);
        materialId = uint16(uint256(data) >> 176);
        majorId = uint8(uint256(data) >> 168);
        minorId = uint8(uint256(data) >> 160);
        punchCount = uint8(uint256(data) >> 152);
        hypeBurned = uint120(uint256(data));
    }
    
    /**
     * @notice Get material name by ID (ultra-compressed)
     */
    function getMaterialName(uint16 id) public pure returns (string memory) {
        string[24] memory names = [
            "Copper", "Iron", "Tin", "Lead", "Zinc", "Brass",
            "Bronze", "Steel", "Nickel", "Cobalt", "Titanium", "Aluminum", 
            "Silver", "Electrum", "Meteoric Iron", "Damascus Steel", "White Gold", "Rose Gold",
            "Platinum", "Palladium", "Rhodium", "Gold", "Mithril", "Adamantine"
        ];
        return id < 24 ? names[id] : "Unknown";
    }
    
    /**
     * @notice Get material tier by ID
     */
    function getMaterialTier(uint16 id) public pure returns (string memory) {
        if (id < 6) return "Common";
        if (id < 12) return "Uncommon";
        if (id < 18) return "Rare";
        if (id < 21) return "Ultra Rare";
        if (id < 24) return "Mythic";
        return "Unknown";
    }
    
    /**
     * @notice Generate basic tokenURI (minimal SVG for size constraints)
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        // Unpack token data
        (uint64 seed, uint16 materialId, uint8 majorId, uint8 minorId, uint8 punchCount, uint120 hypeBurned) = this.getTokenData(tokenId);
        
        // Get material data
        string memory materialName = getMaterialName(materialId);
        string memory tierName = getMaterialTier(materialId);
        
        // Generate minimal SVG
        string memory svg = string(abi.encodePacked(
            '<svg width="400" height="600" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">',
            '<rect x="50" y="100" width="300" height="400" rx="20" fill="#', _getColorHex(materialId), '" stroke="#000" stroke-width="2"/>',
            '<circle cx="200" cy="200" r="', _toString(20 + (majorId % 30)), '" fill="none" stroke="#000" stroke-width="2"/>',
            '<rect x="', _toString(150 + (minorId * 20)), '" y="400" width="20" height="40" fill="#000"/>',
            _renderPunches(seed, punchCount),
            '</svg>'
        ));
        
        // Create JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name":"Omamori #', _toString(tokenId), '",',
            '"description":"Ancient talismans for modern traders.",',
            '"image":"data:image/svg+xml;base64,', _base64Encode(bytes(svg)), '",',
            '"attributes":[',
                '{"trait_type":"Material","value":"', materialName, '"},',
                '{"trait_type":"Rarity","value":"', tierName, '"},',
                '{"trait_type":"HYPE Burned","value":', _toString(hypeBurned), '}',
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(json))
        ));
    }
    
    function _getColorHex(uint16 materialId) internal pure returns (string memory) {
        string[24] memory colors = [
            "b87333", "708090", "c0c0c0", "36454f", "b5b5bd", "b5a642",
            "cd7f32", "71797e", "727472", "0047ab", "878681", "a8a8a8",
            "c0c0c0", "daa520", "4a4a4a", "36454f", "f5f5dc", "e8b4b8",
            "e5e4e2", "cec0b6", "c9c0bb", "d4af37", "e6e8fa", "1c1c1c"
        ];
        return materialId < 24 ? colors[materialId] : "808080";
    }
    
    function _renderPunches(uint64 seed, uint8 count) internal pure returns (string memory) {
        if (count == 0) return "";
        
        string memory result = "";
        for (uint8 i = 0; i < count && i < 5; i++) { // Max 5 punches for size
            uint256 x = 80 + ((seed >> (i * 8)) % 240);
            uint256 y = 150 + ((seed >> (i * 8 + 4)) % 300);
            result = string(abi.encodePacked(
                result,
                '<circle cx="', _toString(x), '" cy="', _toString(y), '" r="8" fill="#000" opacity="0.5"/>'
            ));
        }
        return result;
    }
    
    /**
     * @notice EIP-2981 royalty info
     */
    function royaltyInfo(uint256, uint256 salePrice) external view override returns (address, uint256) {
        uint256 royaltyAmount = (salePrice * royaltyBasisPoints) / 10000;
        return (royaltyRecipient, royaltyAmount);
    }
    
    /**
     * @notice EIP-165 interface support
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, IERC165) returns (bool) {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
    
    // === MINIMAL UTILITY FUNCTIONS ===
    
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
