// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OmamoriNFTCore
 * @notice Ultra-minimal ERC-721 contract for Omamori tablets
 * @dev Core functionality only - rendering system connected post-deployment
 */
contract OmamoriNFTCore is ERC721, Ownable {
    
    /// @notice Burn address for HYPE
    address public constant BURN_ADDRESS = 0xfefeFEFeFEFEFEFEFeFefefefefeFEfEfefefEfe;
    
    /// @notice Minimum HYPE burn amount (0.01 HYPE)
    uint256 public constant MIN_BURN = 10000000000000000;
    
    /// @notice Current token ID counter
    uint256 private _tokenIdCounter = 1;
    
    /// @notice SVG assembler for tokenURI generation
    address public svgAssembler;
    
    /// @notice Token data storage
    mapping(uint256 => bytes32) public tokenData;
    
    /// @notice Events
    event HypeBurned(address indexed burner, uint256 indexed tokenId, uint256 amount);
    event SVGAssemblerSet(address svgAssembler);
    
    constructor(address _initialOwner) 
        ERC721("Hyperliquid Omamori", "OMAMORI") 
        Ownable(_initialOwner) 
    {}
    
    /**
     * @notice Mint an Omamori NFT by burning native HYPE
     */
    function mint() external payable {
        require(msg.value >= MIN_BURN, "Insufficient burn amount");
        
        uint256 tokenId = _tokenIdCounter++;
        
        // Burn native HYPE
        (bool success, ) = BURN_ADDRESS.call{value: msg.value}("");
        require(success, "HYPE burn failed");
        
        // Generate deterministic seed and pack data
        uint64 seed = uint64(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            tokenId,
            msg.value
        ))));
        
        // Pack all data into single bytes32
        // Format: seed(64) | materialId(16) | majorId(8) | minorId(8) | punchCount(8) | hypeBurned(120)
        uint16 materialId = uint16(_selectMaterial(seed));
        uint8 majorId = uint8(seed % 12);
        uint8 minorId = uint8((seed >> 8) % 4);
        uint8 punchCount = uint8((seed >> 16) % 26);
        uint120 hypeBurned = uint120(msg.value);
        
        bytes32 packedData = bytes32(
            (uint256(seed) << 192) |
            (uint256(materialId) << 176) |
            (uint256(majorId) << 168) |
            (uint256(minorId) << 160) |
            (uint256(punchCount) << 152) |
            uint256(hypeBurned)
        );
        
        tokenData[tokenId] = packedData;
        
        // Mint NFT
        _mint(msg.sender, tokenId);
        
        emit HypeBurned(msg.sender, tokenId, msg.value);
    }
    
    /**
     * @notice Generate tokenURI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        if (svgAssembler == address(0)) {
            return _generateBasicTokenURI(tokenId);
        }
        
        // Unpack data and call assembler
        bytes32 data = tokenData[tokenId];
        uint64 seed = uint64(uint256(data) >> 192);
        uint16 materialId = uint16(uint256(data) >> 176);
        uint8 majorId = uint8(uint256(data) >> 168);
        uint8 minorId = uint8(uint256(data) >> 160);
        uint8 punchCount = uint8(uint256(data) >> 152);
        uint120 hypeBurned = uint120(uint256(data));
        
        return ISVGAssembler(svgAssembler).generateTokenURI(
            tokenId, majorId, minorId, materialId, punchCount, seed, hypeBurned
        );
    }
    
    /**
     * @notice Set SVG assembler contract (owner only)
     */
    function setSVGAssembler(address _svgAssembler) external onlyOwner {
        svgAssembler = _svgAssembler;
        emit SVGAssemblerSet(_svgAssembler);
    }
    
    /**
     * @notice Get unpacked token data
     */
    function getTokenData(uint256 tokenId) external view returns (
        uint64 seed, uint16 materialId, uint8 majorId, uint8 minorId, uint8 punchCount, uint120 hypeBurned
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
     * @notice Generate basic tokenURI
     */
    function _generateBasicTokenURI(uint256 tokenId) internal pure returns (string memory) {
        return string(abi.encodePacked(
            "data:application/json;base64,",
            "eyJuYW1lIjoiT21hbW9yaSAj", _toString(tokenId), 
            "IiwiZGVzY3JpcHRpb24iOiJBbmNpZW50IHRhbGlzbWFucyBmb3IgbW9kZXJuIHRyYWRlcnMuIn0="
        ));
    }
    
    /**
     * @notice Select material using simple weighted selection
     */
    function _selectMaterial(uint64 seed) internal pure returns (uint16) {
        // Simplified material selection - can be enhanced later
        return uint16(seed % 24);
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
}

interface ISVGAssembler {
    function generateTokenURI(
        uint256 tokenId,
        uint8 majorId,
        uint8 minorId,
        uint16 materialId,
        uint8 punchCount,
        uint64 seed,
        uint256 hypeBurned
    ) external view returns (string memory);
}
