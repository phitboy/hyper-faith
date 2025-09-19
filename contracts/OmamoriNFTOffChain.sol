// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title OmamoriNFTOffChain
 * @notice Minimal Omamori NFT with IPFS-hosted high-quality art
 * @dev Stores essential data on-chain, renders beautiful art off-chain
 */
contract OmamoriNFTOffChain is ERC721, Ownable, IERC2981 {
    
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
     * @notice Mint an Omamori NFT by burning native HYPE with user-selected arcanum
     * @param majorId The major arcanum ID (0-11)
     * @param minorId The minor aspect ID (0-3)
     */
    function mint(uint8 majorId, uint8 minorId) external payable {
        require(msg.value >= MIN_BURN, "Insufficient burn amount");
        require(majorId < 12, "Invalid major ID");
        require(minorId < 4, "Invalid minor ID");
        
        uint256 tokenId = _tokenIdCounter++;
        
        // Generate deterministic seed from block data and user input
        uint64 seed = uint64(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            tokenId,
            majorId,
            minorId
        ))));
        
        // Select material and punch count based on seed
        uint16 materialId = _selectMaterialSecure(seed);
        uint8 punchCount = uint8((seed >> 32) % 26); // 0-25 punches
        
        // Pack token data efficiently
        bytes32 packedData = bytes32(
            (uint256(seed) << 192) |           // 64 bits: seed
            (uint256(materialId) << 176) |     // 16 bits: material ID
            (uint256(majorId) << 168) |        // 8 bits: major arcanum
            (uint256(minorId) << 160) |        // 8 bits: minor aspect
            (uint256(punchCount) << 152) |     // 8 bits: punch count
            uint256(uint120(msg.value))        // 120 bits: HYPE burned
        );
        
        tokenData[tokenId] = packedData;
        
        // Burn HYPE by sending to burn address
        (bool success, ) = BURN_ADDRESS.call{value: msg.value}("");
        require(success, "HYPE burn failed");
        
        // Mint NFT to user
        _safeMint(msg.sender, tokenId);
        
        emit HypeBurned(msg.sender, tokenId, msg.value);
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
        bytes32 data = tokenData[tokenId];
        seed = uint64(uint256(data) >> 192);
        materialId = uint16(uint256(data) >> 176);
        majorId = uint8(uint256(data) >> 168);
        minorId = uint8(uint256(data) >> 160);
        punchCount = uint8(uint256(data) >> 152);
        hypeBurned = uint120(uint256(data));
    }
    
    /**
     * @notice Secure material selection with proper rarity distribution
     */
    function _selectMaterialSecure(uint64 seed) internal pure returns (uint16) {
        uint256 roll = seed % 10000;
        
        // Rarity distribution matching website
        if (roll < 2083) return uint16(seed % 5);        // Common (20.83%)
        if (roll < 4583) return uint16(5 + (seed % 6));  // Uncommon (25%)
        if (roll < 6583) return uint16(11 + (seed % 5)); // Rare (20%)
        if (roll < 8083) return uint16(16 + (seed % 6)); // Ultra Rare (15%)
        return uint16(22 + (seed % 2));                  // Mythic (19.17%)
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
     * @notice Generate tokenURI with IPFS-hosted high-quality art
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
        
        // Create JSON metadata pointing to IPFS-hosted high-quality art
        string memory json = string(abi.encodePacked(
            '{"name":"Omamori #', _toString(tokenId), '",',
            '"description":"Ancient talismans for modern traders. High-quality off-chain generative art powered by Supabase Edge Functions.",',
            '"image":"https://impoplixuoggwnzgvqvx.supabase.co/functions/v1/render/', _toString(tokenId), '",',
            '"external_url":"https://hyper.faith/omamori/', _toString(tokenId), '",',
            '"attributes":[',
                '{"trait_type":"Material","value":"', materialName, '"},',
                '{"trait_type":"Rarity Tier","value":"', tierName, '"},',
                '{"trait_type":"Major Arcanum","value":"', majorName, '"},',
                '{"trait_type":"Minor Arcanum","value":"', minorName, '"},',
                '{"trait_type":"Major ID","value":', _toString(majorId), '},',
                '{"trait_type":"Minor ID","value":', _toString(minorId), '},',
                '{"trait_type":"Punch Count","value":', _toString(punchCount), '},',
                '{"trait_type":"Seed","value":"0x', _toHexString(seed), '"},',
                '{"trait_type":"HYPE Burned","value":"', _formatHypeBurned(hypeBurned), '"}',
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(json))
        ));
    }
    
    /**
     * @notice Format HYPE burned amount for display (wei to HYPE)
     */
    function _formatHypeBurned(uint120 weiAmount) internal pure returns (string memory) {
        // Convert wei to HYPE (18 decimals)
        uint256 hypeAmount = uint256(weiAmount) / 1e18;
        uint256 remainder = (uint256(weiAmount) % 1e18) / 1e14; // 4 decimal places
        
        if (remainder == 0) {
            return string(abi.encodePacked(_toString(hypeAmount), ".0000"));
        } else {
            return string(abi.encodePacked(_toString(hypeAmount), ".", _padDecimals(remainder)));
        }
    }
    
    /**
     * @notice Pad decimal places for HYPE formatting
     */
    function _padDecimals(uint256 decimals) internal pure returns (string memory) {
        if (decimals < 10) return string(abi.encodePacked("000", _toString(decimals)));
        if (decimals < 100) return string(abi.encodePacked("00", _toString(decimals)));
        if (decimals < 1000) return string(abi.encodePacked("0", _toString(decimals)));
        return _toString(decimals);
    }

    /**
     * @notice EIP-2981 royalty info
     */
    function royaltyInfo(uint256, uint256 salePrice) external view returns (address, uint256) {
        uint256 royaltyAmount = (salePrice * royaltyBasisPoints) / 10000;
        return (royaltyRecipient, royaltyAmount);
    }
    
    /**
     * @notice EIP-165 interface support
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, IERC165) returns (bool) {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
    
    // Utility functions
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
        string memory result = new string(encodedLen + 32);

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            let dataPtr := add(data, 32)
            let dataLen := mload(data)
            
            for { let i := 0 } lt(i, dataLen) {} {
                i := add(i, 3)
                let input := and(mload(add(dataPtr, sub(i, 3))), 0xffffff)
                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(input, 0x3F))), 0xFF))
                out := shl(224, out)
                mstore(resultPtr, out)
                resultPtr := add(resultPtr, 4)
            }
            switch mod(dataLen, 3)
            case 1 { mstore(sub(resultPtr, 2), shl(240, 0x3d3d)) }
            case 2 { mstore(sub(resultPtr, 1), shl(248, 0x3d)) }
            mstore(result, encodedLen)
        }
        return result;
    }
}
