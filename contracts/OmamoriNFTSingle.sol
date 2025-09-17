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
     * @notice Get material name by ID (matching website data)
     */
    function getMaterialName(uint16 id) public pure returns (string memory) {
        string[24] memory names = [
            "Wood", "Cloth", "Paper", "Clay", "Limestone", "Slate",
            "Basalt", "Granite", "Marble", "Bronze", "Obsidian", "Silver",
            "Jade", "Crystal", "Onyx", "Amber", "Amethyst", "Opal",
            "Emerald", "Sapphire", "Ruby", "Lapis", "Gold", "Meteorite"
        ];
        return id < 24 ? names[id] : "Unknown";
    }
    
    /**
     * @notice Get material tier by ID
     */
    function getMaterialTier(uint16 id) public pure returns (string memory) {
        if (id < 5) return "Common";
        if (id < 11) return "Uncommon";
        if (id < 16) return "Rare";
        if (id < 22) return "Ultra Rare";
        if (id < 24) return "Mythic";
        return "Unknown";
    }
    
    /**
     * @notice Get major arcanum name by ID (matching website data)
     */
    function getMajorName(uint8 id) public pure returns (string memory) {
        string[12] memory names = [
            "Liquidity", "Leverage", "Volatility", "Narrative", "The Macro", "Discipline",
            "FOMO", "FUD", "RNG", "Max Pain", "The Chat", "Ego"
        ];
        return id < 12 ? names[id] : "Unknown";
    }
    
    /**
     * @notice Get minor aspect name by major and minor ID (matching website data)
     */
    function getMinorName(uint8 majorId, uint8 minorId) public pure returns (string memory) {
        if (majorId >= 12 || minorId >= 4) return "Unknown";
        
        if (majorId == 0) { // Liquidity
            string[4] memory minors = ["Fills", "Market-Maker", "Spread", "Volume"];
            return minors[minorId];
        } else if (majorId == 1) { // Leverage
            string[4] memory minors = ["Margin", "Liqd", "Max Long", "Max Short"];
            return minors[minorId];
        } else if (majorId == 2) { // Volatility
            string[4] memory minors = ["Pump", "Dump", "Chop", "Pattern"];
            return minors[minorId];
        } else if (majorId == 3) { // Narrative
            string[4] memory minors = ["Insider", "Hype", "News", "Cope"];
            return minors[minorId];
        } else if (majorId == 4) { // The Macro
            string[4] memory minors = ["Regulator", "Bear", "Bull", "Black Swan"];
            return minors[minorId];
        } else if (majorId == 5) { // Discipline
            string[4] memory minors = ["Take Profit", "Size", "Strategy", "Sideline"];
            return minors[minorId];
        } else if (majorId == 6) { // FOMO
            string[4] memory minors = ["BTFD", "Top Signal", "Market Price", "Conviction"];
            return minors[minorId];
        } else if (majorId == 7) { // FUD
            string[4] memory minors = ["Shills", "PsyOps", "Rugs", "Scam"];
            return minors[minorId];
        } else if (majorId == 8) { // RNG
            string[4] memory minors = ["Mints", "Order Routing", "Uptime", "Prediction"];
            return minors[minorId];
        } else if (majorId == 9) { // Max Pain
            string[4] memory minors = ["Too Early", "Too Late", "Too Little", "Too Much"];
            return minors[minorId];
        } else if (majorId == 10) { // The Chat
            string[4] memory minors = ["Alpha", "Slop", "In", "Out"];
            return minors[minorId];
        } else { // Ego (majorId == 11)
            string[4] memory minors = ["Touch Grass", "Hyperliquid", "Family", "Needs"];
            return minors[minorId];
        }
    }
    
    /**
     * @notice Generate complete tokenURI with beautiful 1000x1400 SVG art
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        // Unpack token data
        (uint64 seed, uint16 materialId, uint8 majorId, uint8 minorId, uint8 punchCount, uint120 hypeBurned) = this.getTokenData(tokenId);
        
        // Get material data
        string memory materialName = getMaterialName(materialId);
        string memory tierName = getMaterialTier(materialId);
        
        // Get major and minor names
        string memory majorName = getMajorName(majorId);
        string memory minorName = getMinorName(majorId, minorId);
        
        // Generate complete 1000x1400 SVG art
        string memory svg = _generateCompleteOmamoriSVG(majorId, minorId, materialId, punchCount, seed);
        
        // Create JSON metadata with frontend-compatible attribute names
        string memory json = string(abi.encodePacked(
            '{"name":"Omamori #', _toString(tokenId), '",',
            '"description":"Ancient talismans for modern traders. Fully on-chain generative art.",',
            '"image":"data:image/svg+xml;base64,', _base64Encode(bytes(svg)), '",',
            '"attributes":[',
                '{"trait_type":"Material","value":"', materialName, '"},',
                '{"trait_type":"Rarity Tier","value":"', tierName, '"},',
                '{"trait_type":"Major","value":"', majorName, '"},',
                '{"trait_type":"Minor","value":"', minorName, '"},',
                '{"trait_type":"Major ID","value":', _toString(majorId), '},',
                '{"trait_type":"Minor ID","value":', _toString(minorId), '},',
                '{"trait_type":"Punch Count","value":', _toString(punchCount), '},',
                '{"trait_type":"Seed","value":"0x', _toHexString(seed), '"},',
                '{"trait_type":"HYPE Burned","value":', _toString(hypeBurned), '}',
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(json))
        ));
    }
    
    /**
     * @notice Generate complete 1000x1400 Omamori tablet SVG
     */
    function _generateCompleteOmamoriSVG(
        uint8 majorId,
        uint8 minorId,
        uint16 materialId,
        uint8 punchCount,
        uint64 seed
    ) internal pure returns (string memory) {
        
        // Get material colors
        (string memory bgColor, string memory strokeColor) = _getMaterialColors(materialId);
        
        // Generate major and minor glyphs
        string memory majorGlyph = _renderMajorGlyph(majorId, strokeColor);
        string memory minorGlyph = _renderMinorGlyph(majorId, minorId, strokeColor);
        
        // Generate punch layout
        string memory punches = _renderPunchLayout(seed, punchCount);
        
        // Assemble complete SVG
        return string(abi.encodePacked(
            '<svg width="1000" height="1400" viewBox="0 0 1000 1400" xmlns="http://www.w3.org/2000/svg">',
            '<defs>',
                '<linearGradient id="materialGrad" x1="0%" y1="0%" x2="100%" y2="100%">',
                    '<stop offset="0%" style="stop-color:', bgColor, ';stop-opacity:1"/>',
                    '<stop offset="100%" style="stop-color:', strokeColor, ';stop-opacity:1"/>',
                '</linearGradient>',
            '</defs>',
            
            // Background tablet shape
            '<rect x="100" y="150" width="800" height="1100" rx="40" ry="40" ',
                'fill="url(#materialGrad)" stroke="#000" stroke-width="4"/>',
            
            // Material texture overlay
            '<rect x="120" y="170" width="760" height="1060" rx="30" ry="30" ',
                'fill="', bgColor, '" opacity="0.3"/>',
            
            // Glyph layer (with material color)
            '<g stroke="', strokeColor, '" fill="', strokeColor, '">',
                majorGlyph,
                minorGlyph,
            '</g>',
            
            // Punch holes layer
            punches,
            
            // Border highlight
            '<rect x="100" y="150" width="800" height="1100" rx="40" ry="40" ',
                'fill="none" stroke="', strokeColor, '" stroke-width="2" opacity="0.8"/>',
            
            '</svg>'
        ));
    }
    
    /**
     * @notice Get material colors based on ID and tier
     */
    function _getMaterialColors(uint16 materialId) internal pure returns (string memory bg, string memory stroke) {
        string[24] memory bgColors = [
            "#b87333", "#708090", "#c0c0c0", "#36454f", "#b5b5bd", "#b5a642",
            "#cd7f32", "#71797e", "#727472", "#0047ab", "#878681", "#a8a8a8",
            "#c0c0c0", "#daa520", "#4a4a4a", "#36454f", "#f5f5dc", "#e8b4b8",
            "#e5e4e2", "#cec0b6", "#c9c0bb", "#d4af37", "#e6e8fa", "#1c1c1c"
        ];
        
        string[24] memory strokeColors = [
            "#8b4513", "#2f4f4f", "#696969", "#000000", "#808080", "#9acd32",
            "#a0522d", "#2f4f4f", "#556b2f", "#191970", "#2f4f4f", "#696969",
            "#708090", "#b8860b", "#2f2f2f", "#000000", "#daa520", "#cd5c5c",
            "#d3d3d3", "#a0522d", "#8b7355", "#b8860b", "#9370db", "#000000"
        ];
        
        bg = materialId < 24 ? bgColors[materialId] : "#808080";
        stroke = materialId < 24 ? strokeColors[materialId] : "#000000";
    }
    
    /**
     * @notice Render major glyph (matching website arcanum)
     */
    function _renderMajorGlyph(uint8 majorId, string memory color) internal pure returns (string memory) {
        if (majorId == 0) { // Liquidity - flowing water pattern
            return string(abi.encodePacked(
                '<g transform="translate(300,400)">',
                '<path d="M-40,-60 L-40,-40 L40,-40 L40,-20 L-40,-20 L-40,0 L40,0 L40,20 L-40,20 L-40,40 L40,40 L40,60" fill="none" stroke="', color, '" stroke-width="6"/>',
                '<circle cx="0" cy="0" r="8" fill="', color, '"/>',
                '</g>'
            ));
        } else if (majorId == 1) { // Leverage - pyramid/triangle
            return string(abi.encodePacked(
                '<g transform="translate(300,400)">',
                '<path d="M0,-60 L-50,60 L50,60 Z" fill="none" stroke="', color, '" stroke-width="6"/>',
                '<rect x="-20" y="-20" width="40" height="40" fill="', color, '" opacity="0.5"/>',
                '<path d="M0,-60 L0,60" stroke="', color, '" stroke-width="4"/>',
                '</g>'
            ));
        } else if (majorId == 2) { // Volatility - wave pattern
            return string(abi.encodePacked(
                '<g transform="translate(300,400)">',
                '<path d="M-60,0 Q-30,-40 0,0 Q30,40 60,0" fill="none" stroke="', color, '" stroke-width="6"/>',
                '<path d="M-60,20 Q-30,-20 0,20 Q30,60 60,20" fill="none" stroke="', color, '" stroke-width="4"/>',
                '<circle cx="0" cy="0" r="12" fill="', color, '"/>',
                '</g>'
            ));
        } else if (majorId == 3) { // Narrative - diamond pattern
            return string(abi.encodePacked(
                '<g transform="translate(300,400)">',
                '<path d="M0,-50 L35,-25 L0,0 L-35,-25 Z" fill="none" stroke="', color, '" stroke-width="4"/>',
                '<path d="M0,0 L35,25 L0,50 L-35,25 Z" fill="', color, '" opacity="0.3"/>',
                '<circle cx="0" cy="0" r="8" fill="', color, '"/>',
                '</g>'
            ));
        } else if (majorId == 4) { // The Macro - large encompassing shape
            return string(abi.encodePacked(
                '<g transform="translate(300,400)">',
                '<path d="M-60,-40 L0,-60 L60,-40 L60,40 L0,60 L-60,40 Z" fill="none" stroke="', color, '" stroke-width="6"/>',
                '<rect x="-30" y="-30" width="60" height="60" fill="', color, '" opacity="0.2"/>',
                '</g>'
            ));
        } else if (majorId == 5) { // Discipline - structured lines
            return string(abi.encodePacked(
                '<g transform="translate(300,400)">',
                '<rect x="-50" y="-30" width="100" height="8" fill="', color, '"/>',
                '<rect x="-6" y="-50" width="12" height="100" fill="', color, '"/>',
                '<path d="M-50,0 L50,0 M0,-50 L0,50" stroke="', color, '" stroke-width="4"/>',
                '</g>'
            ));
        } else if (majorId == 6) { // FOMO - urgent arrows
            return string(abi.encodePacked(
                '<g transform="translate(300,400)">',
                '<path d="M-40,-40 L0,-60 L40,-40 L20,-40 L20,40 L-20,40 L-20,-40 Z" fill="', color, '" opacity="0.7"/>',
                '<path d="M0,-60 L0,60" stroke="', color, '" stroke-width="6"/>',
                '</g>'
            ));
        } else if (majorId == 7) { // FUD - cloud/storm pattern
            return string(abi.encodePacked(
                '<g transform="translate(300,400)">',
                '<ellipse cx="-20" cy="-30" rx="25" ry="15" fill="', color, '" opacity="0.4"/>',
                '<ellipse cx="20" cy="-30" rx="25" ry="15" fill="', color, '" opacity="0.4"/>',
                '<ellipse cx="0" cy="-15" rx="30" ry="20" fill="', color, '" opacity="0.6"/>',
                '<path d="M-10,10 L-5,30 M0,10 L0,35 M10,10 L15,30" stroke="', color, '" stroke-width="3"/>',
                '</g>'
            ));
        } else if (majorId == 8) { // RNG - question marks/randomness
            return string(abi.encodePacked(
                '<g transform="translate(300,400)">',
                '<circle cx="0" cy="0" r="40" fill="none" stroke="', color, '" stroke-width="4" stroke-dasharray="10,5"/>',
                '<text x="0" y="10" text-anchor="middle" font-size="40" fill="', color, '">?</text>',
                '<circle cx="-25" cy="-25" r="5" fill="', color, '"/>',
                '<circle cx="25" cy="25" r="5" fill="', color, '"/>',
                '</g>'
            ));
        } else if (majorId == 9) { // Max Pain - X pattern
            return string(abi.encodePacked(
                '<g transform="translate(300,400)">',
                '<path d="M-40,-40 L40,40 M40,-40 L-40,40" stroke="', color, '" stroke-width="8"/>',
                '<circle cx="0" cy="0" r="20" fill="', color, '" opacity="0.3"/>',
                '<path d="M-20,-20 L20,20 M20,-20 L-20,20" stroke="', color, '" stroke-width="4"/>',
                '</g>'
            ));
        } else if (majorId == 10) { // The Chat - dots/ellipsis
            return string(abi.encodePacked(
                '<g transform="translate(300,400)">',
                '<circle cx="-30" cy="0" r="8" fill="', color, '"/>',
                '<circle cx="0" cy="0" r="8" fill="', color, '"/>',
                '<circle cx="30" cy="0" r="8" fill="', color, '"/>',
                '<rect x="-50" y="-30" width="100" height="60" fill="none" stroke="', color, '" stroke-width="3" rx="10"/>',
                '</g>'
            ));
        } else { // Ego (majorId == 11) - house/self symbol
            return string(abi.encodePacked(
                '<g transform="translate(300,400)">',
                '<path d="M0,-50 L-40,0 L-20,0 L-20,40 L20,40 L20,0 L40,0 Z" fill="', color, '" opacity="0.6"/>',
                '<rect x="-20" y="0" width="40" height="40" fill="', color, '"/>',
                '<path d="M0,-50 L-40,0 L40,0 Z" fill="none" stroke="', color, '" stroke-width="4"/>',
                '</g>'
            ));
        }
    }
    
    /**
     * @notice Render minor glyph (positioned in bottom right)
     */
    function _renderMinorGlyph(uint8 /* majorId */, uint8 minorId, string memory color) internal pure returns (string memory) {
        // Position in bottom right area
        string memory transform = 'transform="translate(750,1050)"';
        
        if (minorId == 0) { // Bullish
            return string(abi.encodePacked(
                '<g ', transform, '>',
                '<path d="M-20,20 L0,-20 L20,20" fill="', color, '"/>',
                '</g>'
            ));
        } else if (minorId == 1) { // Bearish
            return string(abi.encodePacked(
                '<g ', transform, '>',
                '<path d="M-20,-20 L0,20 L20,-20" fill="', color, '"/>',
                '</g>'
            ));
        } else if (minorId == 2) { // Neutral
            return string(abi.encodePacked(
                '<g ', transform, '>',
                '<rect x="-20" y="-5" width="40" height="10" fill="', color, '"/>',
                '</g>'
            ));
        } else { // Uncertain (minorId == 3)
            return string(abi.encodePacked(
                '<g ', transform, '>',
                '<circle cx="0" cy="0" r="15" fill="none" stroke="', color, '" stroke-width="3" stroke-dasharray="5,5"/>',
                '</g>'
            ));
        }
    }
    
    /**
     * @notice Render punch layout with collision detection
     */
    function _renderPunchLayout(uint64 seed, uint8 punchCount) internal pure returns (string memory) {
        if (punchCount == 0) return "";
        
        // Diamond slot positions (25 slots)
        uint16[25] memory slotX = [500,460,540,420,500,580,380,460,540,620,340,420,500,580,660,380,460,540,620,420,500,580,460,540,500];
        uint16[25] memory slotY = [420,470,470,520,520,520,570,570,570,570,620,620,620,620,620,670,670,670,670,720,720,720,770,770,820];
        
        string memory result = "";
        uint8 actualCount = punchCount > 25 ? 25 : punchCount;
        
        for (uint8 i = 0; i < actualCount; i++) {
            uint8 slotIndex = uint8((seed >> (i * 2)) % 25);
            uint16 x = slotX[slotIndex];
            uint16 y = slotY[slotIndex];
            
            // Add small jitter (safe arithmetic)
            uint16 jitterX = uint16((seed >> (i * 3)) % 21);
            uint16 jitterY = uint16((seed >> (i * 3 + 8)) % 21);
            x = jitterX >= 10 ? x + jitterX - 10 : x - (10 - jitterX);
            y = jitterY >= 10 ? y + jitterY - 10 : y - (10 - jitterY);
            
            result = string(abi.encodePacked(
                result,
                '<circle cx="', _toString(x), '" cy="', _toString(y), '" r="12" fill="#000" opacity="0.8"/>'
            ));
        }
        
        return result;
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
    
    function _toHexString(uint64 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 length = 0;
        while (temp != 0) {
            length++;
            temp >>= 4;
        }
        
        bytes memory buffer = new bytes(length);
        bytes memory alphabet = "0123456789abcdef";
        while (value != 0) {
            length -= 1;
            buffer[length] = alphabet[value & 0xf];
            value >>= 4;
        }
        return string(buffer);
    }
    
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        string memory result = new string(encodedLen);
        
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            let dataPtr := add(data, 32)
            let endPtr := add(dataPtr, mload(data))
            
            for {} lt(dataPtr, endPtr) {} {
                let input := 0
                
                // Read up to 3 bytes
                if lt(dataPtr, endPtr) {
                    input := shl(16, byte(0, mload(dataPtr)))
                    dataPtr := add(dataPtr, 1)
                }
                if lt(dataPtr, endPtr) {
                    input := or(input, shl(8, byte(0, mload(dataPtr))))
                    dataPtr := add(dataPtr, 1)
                }
                if lt(dataPtr, endPtr) {
                    input := or(input, byte(0, mload(dataPtr)))
                    dataPtr := add(dataPtr, 1)
                }
                
                // Encode 4 characters
                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(input, 0x3F))))
                resultPtr := add(resultPtr, 1)
            }
            
            // Add padding
            switch mod(mload(data), 3)
            case 1 {
                mstore8(sub(resultPtr, 2), 0x3d) // =
                mstore8(sub(resultPtr, 1), 0x3d) // =
            }
            case 2 {
                mstore8(sub(resultPtr, 1), 0x3d) // =
            }
            
            // Set correct string length
            mstore(result, encodedLen)
        }
        
        return result;
    }
}