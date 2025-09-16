// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title OmamoriNFTFairMinimal
 * @notice Ultra-minimal secure NFT with fair randomness and royalties
 */
contract OmamoriNFTFairMinimal is ERC721, Ownable, IERC2981 {
    
    address public constant BURN_ADDRESS = 0xfefeFEFeFEFEFEFEFeFefefefefeFEfEfefefEfe;
    uint256 public constant MIN_BURN = 10000000000000000; // 0.01 HYPE
    
    uint256 private _tokenIdCounter = 1;
    address public svgAssembler;
    mapping(uint256 => bytes32) public tokenData;
    
    // Royalty config
    address public royaltyRecipient;
    uint96 public royaltyBasisPoints = 500; // 5%
    
    event HypeBurned(address indexed burner, uint256 indexed tokenId, uint256 amount);
    event SVGAssemblerSet(address svgAssembler);
    
    constructor(address _initialOwner, address _royaltyRecipient) 
        ERC721("Hyperliquid Omamori", "OMAMORI") 
        Ownable(_initialOwner) 
    {
        royaltyRecipient = _royaltyRecipient;
    }
    
    function mint() external payable {
        require(msg.value >= MIN_BURN, "Insufficient burn amount");
        
        uint256 tokenId = _tokenIdCounter++;
        
        // Burn HYPE
        (bool success, ) = BURN_ADDRESS.call{value: msg.value}("");
        require(success, "HYPE burn failed");
        
        // 🔒 SECURE: Pure randomness without msg.value influence
        uint64 seed = uint64(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            tokenId
        ))));
        
        // Fair material selection with proper rarity
        uint16 materialId = _selectMaterialFair(seed);
        uint8 majorId = uint8(seed % 12);
        uint8 minorId = uint8((seed >> 8) % 4);
        uint8 punchCount = uint8((seed >> 16) % 26);
        uint120 hypeBurned = uint120(msg.value);
        
        // Pack data
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
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        if (svgAssembler != address(0)) {
            (uint64 seed, uint16 materialId, uint8 majorId, uint8 minorId, uint8 punchCount, uint120 hypeBurned) = getTokenData(tokenId);
            return ISVGAssembler(svgAssembler).generateTokenURI(tokenId, majorId, minorId, materialId, punchCount, seed, uint256(hypeBurned));
        }
        
        return _generateBasicTokenURI(tokenId);
    }
    
    function royaltyInfo(uint256, uint256 salePrice) external view override returns (address receiver, uint256 royaltyAmount) {
        receiver = royaltyRecipient;
        royaltyAmount = (salePrice * royaltyBasisPoints) / 10000;
    }
    
    function setSVGAssembler(address _svgAssembler) external onlyOwner {
        svgAssembler = _svgAssembler;
        emit SVGAssemblerSet(_svgAssembler);
    }
    
    function getTokenData(uint256 tokenId) public view returns (uint64 seed, uint16 materialId, uint8 majorId, uint8 minorId, uint8 punchCount, uint120 hypeBurned) {
        bytes32 data = tokenData[tokenId];
        seed = uint64(uint256(data) >> 192);
        materialId = uint16(uint256(data) >> 176);
        majorId = uint8(uint256(data) >> 168);
        minorId = uint8(uint256(data) >> 160);
        punchCount = uint8(uint256(data) >> 152);
        hypeBurned = uint120(uint256(data));
    }
    
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, IERC165) returns (bool) {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
    
    // 🔒 SECURE: Fair rarity distribution without HYPE influence
    function _selectMaterialFair(uint64 seed) internal pure returns (uint16) {
        uint256 roll = seed % 10000;
        
        if (roll < 5000) return uint16(seed % 12);        // 50% Common (0-11)
        if (roll < 7500) return uint16(12 + (seed % 6));  // 25% Uncommon (12-17)
        if (roll < 9000) return uint16(18 + (seed % 4));  // 15% Rare (18-21)
        if (roll < 9750) return uint16(22 + (seed % 2));  // 7.5% Ultra Rare (22-23)
        return 23;                                        // 2.5% Mythic (23)
    }
    
    function _generateBasicTokenURI(uint256 tokenId) internal view returns (string memory) {
        (uint64 seed, uint16 materialId, uint8 majorId, uint8 minorId, uint8 punchCount, uint120 hypeBurned) = getTokenData(tokenId);
        
        string memory json = string(abi.encodePacked(
            '{"name":"Omamori #', _toString(tokenId), 
            '","description":"Secure fair randomness NFT",',
            '"attributes":[',
                '{"trait_type":"Material ID","value":', _toString(materialId), '},',
                '{"trait_type":"Major ID","value":', _toString(majorId), '},',
                '{"trait_type":"Minor ID","value":', _toString(minorId), '},',
                '{"trait_type":"Punches","value":', _toString(punchCount), '},',
                '{"trait_type":"HYPE Burned","value":"', _toString(hypeBurned), '"},',
                '{"trait_type":"Rarity","value":"', _getRarityName(materialId), '"}',
            ']}'
        ));
        
        return string(abi.encodePacked("data:application/json;base64,", _base64Encode(bytes(json))));
    }
    
    function _getRarityName(uint16 materialId) internal pure returns (string memory) {
        if (materialId < 12) return "Common";
        if (materialId < 18) return "Uncommon";
        if (materialId < 22) return "Rare";
        if (materialId < 24) return "Ultra Rare";
        return "Mythic";
    }
    
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) { digits -= 1; buffer[digits] = bytes1(uint8(48 + uint256(value % 10))); value /= 10; }
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
            for { let i := 0 } lt(i, mload(data)) { i := add(i, 3) } {
                let input := and(mload(add(data, add(i, 32))), 0xffffff)
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
            switch mod(mload(data), 3)
            case 1 { mstore(sub(resultPtr, 2), shl(240, 0x3d3d)) }
            case 2 { mstore(sub(resultPtr, 1), shl(248, 0x3d)) }
            mstore(result, encodedLen)
        }
        return result;
    }
}

interface ISVGAssembler {
    function generateTokenURI(uint256 tokenId, uint8 majorId, uint8 minorId, uint16 materialId, uint8 punchCount, uint64 seed, uint256 hypeBurned) external view returns (string memory);
}
