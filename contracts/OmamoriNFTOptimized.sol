// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title OmamoriNFTOptimized
 * @notice Optimized single-contract Omamori NFT with compressed materials and 5% royalties
 * @dev Gas-optimized version for HyperEVM big blocks deployment
 * @author Hyper Faith Team
 */
contract OmamoriNFTOptimized is ERC721, Ownable, IERC2981 {
    
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
     * @notice Get material name by ID (compressed lookup)
     */
    function getMaterialName(uint16 id) public pure returns (string memory) {
        if (id == 0) return "Copper";
        if (id == 1) return "Iron";
        if (id == 2) return "Tin";
        if (id == 3) return "Lead";
        if (id == 4) return "Zinc";
        if (id == 5) return "Brass";
        if (id == 6) return "Bronze";
        if (id == 7) return "Steel";
        if (id == 8) return "Nickel";
        if (id == 9) return "Cobalt";
        if (id == 10) return "Titanium";
        if (id == 11) return "Aluminum";
        if (id == 12) return "Silver";
        if (id == 13) return "Electrum";
        if (id == 14) return "Meteoric Iron";
        if (id == 15) return "Damascus Steel";
        if (id == 16) return "White Gold";
        if (id == 17) return "Rose Gold";
        if (id == 18) return "Platinum";
        if (id == 19) return "Palladium";
        if (id == 20) return "Rhodium";
        if (id == 21) return "Gold";
        if (id == 22) return "Mithril";
        if (id == 23) return "Adamantine";
        return "Unknown";
    }
    
    /**
     * @notice Get material tier by ID (compressed lookup)
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
     * @notice Get material colors by ID (compressed lookup)
     */
    function getMaterialColors(uint16 id) public pure returns (string memory bg, string memory stroke) {
        if (id == 0) return ("#b87333", "#8b4513"); // Copper
        if (id == 1) return ("#708090", "#2f4f4f"); // Iron
        if (id == 2) return ("#c0c0c0", "#696969"); // Tin
        if (id == 3) return ("#36454f", "#1c1c1c"); // Lead
        if (id == 4) return ("#b5b5bd", "#71797e"); // Zinc
        if (id == 5) return ("#b5a642", "#9e8b3a"); // Brass
        if (id == 6) return ("#cd7f32", "#8b4513"); // Bronze
        if (id == 7) return ("#71797e", "#36454f"); // Steel
        if (id == 8) return ("#727472", "#36454f"); // Nickel
        if (id == 9) return ("#0047ab", "#002d6b"); // Cobalt
        if (id == 10) return ("#878681", "#54524f"); // Titanium
        if (id == 11) return ("#a8a8a8", "#696969"); // Aluminum
        if (id == 12) return ("#c0c0c0", "#a9a9a9"); // Silver
        if (id == 13) return ("#daa520", "#b8860b"); // Electrum
        if (id == 14) return ("#4a4a4a", "#2f2f2f"); // Meteoric Iron
        if (id == 15) return ("#36454f", "#1c1c1c"); // Damascus Steel
        if (id == 16) return ("#f5f5dc", "#e6e6fa"); // White Gold
        if (id == 17) return ("#e8b4b8", "#cd919e"); // Rose Gold
        if (id == 18) return ("#e5e4e2", "#d3d3d3"); // Platinum
        if (id == 19) return ("#cec0b6", "#a0522d"); // Palladium
        if (id == 20) return ("#c9c0bb", "#a9a9a9"); // Rhodium
        if (id == 21) return ("#d4af37", "#b8860b"); // Gold
        if (id == 22) return ("#e6e8fa", "#c0c0c0"); // Mithril
        if (id == 23) return ("#1c1c1c", "#000000"); // Adamantine
        return ("#808080", "#404040"); // Default
    }
    
    /**
     * @notice Generate complete tokenURI with embedded SVG art
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        // Unpack token data
        (uint64 seed, uint16 materialId, uint8 majorId, uint8 minorId, uint8 punchCount, uint120 hypeBurned) = this.getTokenData(tokenId);
        
        // Get material data
        string memory materialName = getMaterialName(materialId);
        string memory tierName = getMaterialTier(materialId);
        (string memory bg, string memory stroke) = getMaterialColors(materialId);
        
        // Generate simplified SVG (optimized for gas)
        string memory svg = _generateOptimizedSVG(majorId, minorId, punchCount, seed, bg, stroke);
        
        // Create JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name":"Omamori #', _toString(tokenId), '",',
            '"description":"Ancient talismans for modern traders. Fully on-chain generative art.",',
            '"image":"data:image/svg+xml;base64,', _base64Encode(bytes(svg)), '",',
            '"attributes":[',
                '{"trait_type":"Material","value":"', materialName, '"},',
                '{"trait_type":"Rarity","value":"', tierName, '"},',
                '{"trait_type":"Major ID","value":', _toString(majorId), '},',
                '{"trait_type":"Minor ID","value":', _toString(minorId), '},',
                '{"trait_type":"Punches","value":', _toString(punchCount), '},',
                '{"trait_type":"HYPE Burned","value":', _toString(hypeBurned), '}',
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(json))
        ));
    }
    
    /**
     * @notice Generate optimized SVG (simplified for gas efficiency)
     */
    function _generateOptimizedSVG(
        uint8 majorId,
        uint8 minorId,
        uint8 punchCount,
        uint64 seed,
        string memory bg,
        string memory stroke
    ) internal pure returns (string memory) {
        
        // Simplified glyph rendering
        string memory majorGlyph = _renderSimpleMajor(majorId);
        string memory minorGlyph = _renderSimpleMinor(minorId);
        
        // Simplified punch rendering
        string memory punches = _renderSimplePunches(seed, punchCount);
        
        return string(abi.encodePacked(
            '<svg width="1000" height="1400" viewBox="0 0 1000 1400" xmlns="http://www.w3.org/2000/svg">',
            '<rect x="100" y="200" width="800" height="1000" rx="40" fill="', bg, '" stroke="', stroke, '" stroke-width="4"/>',
            '<g stroke="', stroke, '" fill="', stroke, '">',
                majorGlyph,
                minorGlyph,
            '</g>',
            punches,
            '</svg>'
        ));
    }
    
    /**
     * @notice Render simplified major glyph
     */
    function _renderSimpleMajor(uint8 majorId) internal pure returns (string memory) {
        if (majorId == 0) return '<rect x="280" y="400" width="40" height="120" stroke-width="4"/>';
        if (majorId == 1) return '<line x1="250" y1="500" x2="350" y2="450" stroke-width="4"/>';
        if (majorId == 2) return '<polyline points="250,450 300,500 350,450" fill="none" stroke-width="4"/>';
        if (majorId == 3) return '<circle cx="300" cy="470" r="30" fill="none" stroke-width="4"/>';
        if (majorId == 4) return '<circle cx="300" cy="470" r="50" fill="none" stroke-width="4"/>';
        if (majorId == 5) return '<rect x="250" y="420" width="100" height="100" fill="none" stroke-width="4"/>';
        if (majorId == 6) return '<polygon points="300,420 350,520 250,520" fill="none" stroke-width="4"/>';
        if (majorId == 7) return '<polygon points="250,420 350,420 300,520" fill="none" stroke-width="4"/>';
        if (majorId == 8) return '<circle cx="280" cy="450" r="5"/><circle cx="320" cy="450" r="5"/>';
        if (majorId == 9) return '<line x1="260" y1="440" x2="340" y2="520" stroke-width="4"/>';
        if (majorId == 10) return '<rect x="270" y="440" width="60" height="40" stroke-width="4"/>';
        if (majorId == 11) return '<polygon points="300,440 340,480 300,520 260,480" fill="none" stroke-width="4"/>';
        return '<circle cx="300" cy="470" r="20" stroke-width="4"/>';
    }
    
    /**
     * @notice Render simplified minor glyph
     */
    function _renderSimpleMinor(uint8 minorId) internal pure returns (string memory) {
        if (minorId == 0) return '<rect x="720" y="1000" width="30" height="60" stroke-width="3"/>';
        if (minorId == 1) return '<circle cx="735" cy="1030" r="20" fill="none" stroke-width="3"/>';
        if (minorId == 2) return '<line x1="710" y1="1020" x2="760" y2="1020" stroke-width="3"/>';
        return '<polygon points="735,1010 750,1040 720,1040" fill="none" stroke-width="3"/>';
    }
    
    /**
     * @notice Render simplified punches
     */
    function _renderSimplePunches(uint64 seed, uint8 count) internal pure returns (string memory) {
        if (count == 0) return "";
        
        string memory result = "";
        uint256 seedOffset = seed;
        
        for (uint8 i = 0; i < count && i < 10; i++) { // Cap at 10 for gas
            uint256 x = 200 + (seedOffset % 600);
            uint256 y = 400 + ((seedOffset >> 8) % 600);
            
            result = string(abi.encodePacked(
                result,
                '<rect x="', _toString(x), '" y="', _toString(y), '" width="30" height="60" rx="15" fill="#000" opacity="0.6"/>'
            ));
            
            seedOffset = uint256(keccak256(abi.encodePacked(seedOffset, i)));
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
    
    // === UTILITY FUNCTIONS ===
    
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
