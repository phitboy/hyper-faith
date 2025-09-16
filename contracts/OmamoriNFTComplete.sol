// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title OmamoriNFTComplete
 * @notice Complete single-contract Omamori NFT with embedded materials, inline rendering, and 5% royalties
 * @dev All-in-one solution with no external dependencies - designed for HyperEVM big blocks (30M gas)
 * @author Hyper Faith Team
 */
contract OmamoriNFTComplete is ERC721, Ownable, IERC2981 {
    
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
    event RoyaltyConfigured(address recipient, uint96 basisPoints);
    
    /// @notice Material data structure
    struct Material {
        string name;
        string tierName;
        string bg;
        string stroke;
        uint256 weight;
    }
    
    /// @notice Embedded material data (24 materials)
    Material[24] public materials;
    uint256 public constant TOTAL_WEIGHT = 1_000_000_000;
    
    constructor(address _initialOwner, address _royaltyRecipient) 
        ERC721("Hyperliquid Omamori", "OMAMORI") 
        Ownable(_initialOwner) 
    {
        // Set 5% royalties
        royaltyRecipient = _royaltyRecipient;
        royaltyBasisPoints = 500; // 5%
        emit RoyaltyConfigured(_royaltyRecipient, 500);
        
        // Initialize embedded materials
        _initializeMaterials();
    }
    
    /**
     * @notice Initialize all 24 materials inline
     */
    function _initializeMaterials() private {
        // Common (50% total - 6 materials)
        materials[0] = Material("Copper", "Common", "#b87333", "#8b4513", 83333333);
        materials[1] = Material("Iron", "Common", "#708090", "#2f4f4f", 83333333);
        materials[2] = Material("Tin", "Common", "#c0c0c0", "#696969", 83333333);
        materials[3] = Material("Lead", "Common", "#36454f", "#1c1c1c", 83333333);
        materials[4] = Material("Zinc", "Common", "#b5b5bd", "#71797e", 83333333);
        materials[5] = Material("Brass", "Common", "#b5a642", "#9e8b3a", 83333334); // +1 for rounding
        
        // Uncommon (25% total - 6 materials)
        materials[6] = Material("Bronze", "Uncommon", "#cd7f32", "#8b4513", 41666666);
        materials[7] = Material("Steel", "Uncommon", "#71797e", "#36454f", 41666666);
        materials[8] = Material("Nickel", "Uncommon", "#727472", "#36454f", 41666666);
        materials[9] = Material("Cobalt", "Uncommon", "#0047ab", "#002d6b", 41666666);
        materials[10] = Material("Titanium", "Uncommon", "#878681", "#54524f", 41666666);
        materials[11] = Material("Aluminum", "Uncommon", "#a8a8a8", "#696969", 41666670); // +4 for rounding
        
        // Rare (15% total - 6 materials)
        materials[12] = Material("Silver", "Rare", "#c0c0c0", "#a9a9a9", 25000000);
        materials[13] = Material("Electrum", "Rare", "#daa520", "#b8860b", 25000000);
        materials[14] = Material("Meteoric Iron", "Rare", "#4a4a4a", "#2f2f2f", 25000000);
        materials[15] = Material("Damascus Steel", "Rare", "#36454f", "#1c1c1c", 25000000);
        materials[16] = Material("White Gold", "Rare", "#f5f5dc", "#e6e6fa", 25000000);
        materials[17] = Material("Rose Gold", "Rare", "#e8b4b8", "#cd919e", 25000000);
        
        // Ultra Rare (7.5% total - 3 materials)
        materials[18] = Material("Platinum", "Ultra Rare", "#e5e4e2", "#d3d3d3", 25000000);
        materials[19] = Material("Palladium", "Ultra Rare", "#cec0b6", "#a0522d", 25000000);
        materials[20] = Material("Rhodium", "Ultra Rare", "#c9c0bb", "#a9a9a9", 25000000);
        
        // Mythic (2.5% total - 3 materials)
        materials[21] = Material("Gold", "Mythic", "#d4af37", "#b8860b", 8333333);
        materials[22] = Material("Mithril", "Mythic", "#e6e8fa", "#c0c0c0", 8333333);
        materials[23] = Material("Adamantine", "Mythic", "#1c1c1c", "#000000", 8333334); // +1 for rounding
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
        uint120 hypeBurned = uint120(msg.value); // Stored as metadata only
        
        // Pack data efficiently into single storage slot
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
        uint256 roll = seed % 10000; // Roll between 0-9999
        
        // Fixed rarity distribution (matches frontend expectations)
        if (roll < 5000) return uint16(seed % 6); // Common (50%) - materials 0-5
        if (roll < 7500) return uint16(6 + (seed % 6)); // Uncommon (25%) - materials 6-11
        if (roll < 9000) return uint16(12 + (seed % 6)); // Rare (15%) - materials 12-17
        if (roll < 9750) return uint16(18 + (seed % 3)); // Ultra Rare (7.5%) - materials 18-20
        return uint16(21 + (seed % 3)); // Mythic (2.5%) - materials 21-23
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
     * @notice Generate complete tokenURI with embedded SVG art
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        // Unpack token data
        (uint64 seed, uint16 materialId, uint8 majorId, uint8 minorId, uint8 punchCount, uint120 hypeBurned) = this.getTokenData(tokenId);
        
        // Get material
        Material memory material = materials[materialId];
        
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
     * @notice Generate complete SVG art (inline rendering)
     */
    function _generateSVG(
        uint8 majorId,
        uint8 minorId,
        uint16 materialId,
        uint8 punchCount,
        uint64 seed,
        Material memory material
    ) internal pure returns (string memory) {
        
        // Generate glyphs inline
        string memory majorGlyph = _renderMajor(majorId);
        string memory minorGlyph = _renderMinor(majorId, minorId);
        
        // Generate punches inline
        string memory punches = _renderPunches(seed, punchCount);
        
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
     * @notice Render Major glyph inline (condensed from OmamoriGlyphs library)
     */
    function _renderMajor(uint8 majorId) internal pure returns (string memory) {
        if (majorId == 0) {
            // Liquidity — three pillars
            return string(abi.encodePacked(
                '<line x1="260" y1="360" x2="260" y2="520" stroke-width="6"/>',
                '<line x1="300" y1="360" x2="300" y2="520" stroke-width="6"/>',
                '<line x1="340" y1="360" x2="340" y2="520" stroke-width="6"/>'
            ));
        } else if (majorId == 1) {
            // Leverage — lever + fulcrum
            return string(abi.encodePacked(
                '<line x1="230" y1="540" x2="360" y2="410" stroke-width="6"/>',
                '<circle cx="285" cy="540" r="6" fill="currentColor"/>'
            ));
        } else if (majorId == 2) {
            // Volatility — zigzag bolt
            return '<polyline points="230,420 280,470 255,495 320,560 360,520" fill="none" stroke-width="6"/>';
        } else if (majorId == 3) {
            // Narrative — spiral-ish scroll
            return string(abi.encodePacked(
                '<circle cx="300" cy="470" r="38" fill="none" stroke-width="6"/>',
                '<circle cx="300" cy="480" r="16" fill="none" stroke-width="6"/>'
            ));
        } else if (majorId == 4) {
            // The Macro — world axis
            return string(abi.encodePacked(
                '<circle cx="300" cy="470" r="70" fill="none" stroke-width="6"/>',
                '<line x1="300" y1="400" x2="300" y2="540" stroke-width="6"/>'
            ));
        } else if (majorId == 5) {
            // Discipline — frame
            return '<rect x="230" y="390" width="140" height="140" rx="4" ry="4" fill="none" stroke-width="6"/>';
        } else if (majorId == 6) {
            // FOMO — up triangle
            return '<polygon points="300,380 390,560 210,560" fill="none" stroke-width="6"/>';
        } else if (majorId == 7) {
            // FUD — down triangle
            return '<polygon points="210,380 390,380 300,560" fill="none" stroke-width="6"/>';
        } else if (majorId == 8) {
            // RNG — braille cell (2x3)
            return string(abi.encodePacked(
                '<circle cx="270" cy="430" r="7" fill="currentColor"/>',
                '<circle cx="330" cy="430" r="7" fill="currentColor"/>',
                '<circle cx="270" cy="470" r="7" fill="currentColor"/>',
                '<circle cx="330" cy="470" r="7" fill="currentColor"/>',
                '<circle cx="270" cy="510" r="7" fill="currentColor"/>',
                '<circle cx="330" cy="510" r="7" fill="currentColor"/>'
            ));
        } else if (majorId == 9) {
            // Max Pain — X cross
            return string(abi.encodePacked(
                '<line x1="240" y1="410" x2="360" y2="530" stroke-width="6"/>',
                '<line x1="360" y1="410" x2="240" y2="530" stroke-width="6"/>'
            ));
        } else if (majorId == 10) {
            // The Chat — signal bars + ping
            return string(abi.encodePacked(
                '<circle cx="300" cy="400" r="6" fill="currentColor"/>',
                '<line x1="250" y1="460" x2="350" y2="460" stroke-width="8"/>',
                '<line x1="250" y1="500" x2="350" y2="500" stroke-width="6"/>'
            ));
        } else if (majorId == 11) {
            // Ego — lozenge eye + pupil
            return string(abi.encodePacked(
                '<polygon points="300,410 360,470 300,530 240,470" fill="none" stroke-width="6"/>',
                '<circle cx="300" cy="470" r="8" fill="currentColor"/>'
            ));
        }
        
        return ""; // Fallback for invalid majorId
    }
    
    /**
     * @notice Render Minor glyph inline (condensed selection from OmamoriGlyphs library)
     */
    function _renderMinor(uint8 majorId, uint8 minorId) internal pure returns (string memory) {
        // Simplified minor rendering - key examples for each major
        if (majorId == 0) { // Liquidity
            if (minorId == 0) return '<rect x="740" y="1020" width="40" height="80" fill="none" stroke-width="4"/>'; // Fills
            if (minorId == 1) return '<circle cx="780" cy="1060" r="25" fill="none" stroke-width="4"/>'; // Market-Maker
            if (minorId == 2) return '<line x1="740" y1="1040" x2="820" y2="1040" stroke-width="4"/>'; // Spread
            return '<polyline points="740,1080 760,1020 780,1080 800,1020 820,1080" fill="none" stroke-width="4"/>'; // Volume
        } else if (majorId == 1) { // Leverage
            if (minorId == 0) return '<polygon points="780,1020 820,1080 740,1080" fill="none" stroke-width="4"/>'; // Long
            if (minorId == 1) return '<polygon points="780,1080 740,1020 820,1020" fill="none" stroke-width="4"/>'; // Short
            if (minorId == 2) return '<rect x="760" y="1030" width="40" height="40" fill="none" stroke-width="4"/>'; // Spot
            return '<circle cx="780" cy="1050" r="20" fill="none" stroke-width="4"/>'; // Perp
        } else if (majorId == 2) { // Volatility
            if (minorId == 0) return '<polyline points="740,1050 760,1020 780,1080 800,1020 820,1050" fill="none" stroke-width="4"/>'; // IV
            if (minorId == 1) return '<line x1="740" y1="1050" x2="820" y2="1050" stroke-width="6"/>'; // RV
            if (minorId == 2) return '<polyline points="740,1080 780,1020 820,1080" fill="none" stroke-width="4"/>'; // Skew
            return '<circle cx="780" cy="1050" r="15" fill="none" stroke-width="4"/>'; // Smile
        }
        
        // Default minor for other majors
        return '<circle cx="780" cy="1050" r="10" fill="none" stroke-width="3"/>';
    }
    
    /**
     * @notice Render punch holes inline (simplified from PunchLayout library)
     */
    function _renderPunches(uint64 seed, uint8 count) internal pure returns (string memory) {
        if (count == 0) return "";
        
        string memory result = "";
        uint256 seedOffset = seed;
        
        // Generate punch holes with simple distribution
        for (uint8 i = 0; i < count && i < 15; i++) { // Cap at 15 for gas efficiency
            uint256 x = 200 + (seedOffset % 600); // x: 200-800
            uint256 y = 400 + ((seedOffset >> 8) % 600); // y: 400-1000
            
            result = string(abi.encodePacked(
                result,
                '<rect x="', _toString(x), '" y="', _toString(y), '" width="40" height="90" rx="20" ry="45" fill="#000" opacity="0.8"/>'
            ));
            
            seedOffset = uint256(keccak256(abi.encodePacked(seedOffset, i))); // New seed for next punch
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