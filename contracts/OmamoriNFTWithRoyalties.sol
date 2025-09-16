// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title OmamoriNFTWithRoyalties
 * @notice ERC-721 contract for Omamori tablets with EIP-2981 royalty support
 * @dev Includes 5% creator royalties and full rendering system integration
 * @author Hyper Faith Team
 */
contract OmamoriNFTWithRoyalties is ERC721, Ownable, IERC2981 {
    
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
    
    /// @notice Royalty configuration
    address public royaltyRecipient;
    uint96 public royaltyBasisPoints; // 500 = 5%
    
    /// @notice Events
    event HypeBurned(address indexed burner, uint256 indexed tokenId, uint256 amount);
    event SVGAssemblerSet(address svgAssembler);
    event RoyaltyConfigured(address recipient, uint96 basisPoints);
    
    constructor(address _initialOwner, address _royaltyRecipient) 
        ERC721("Hyperliquid Omamori", "OMAMORI") 
        Ownable(_initialOwner) 
    {
        // Set 5% royalties to specified address
        royaltyRecipient = _royaltyRecipient;
        royaltyBasisPoints = 500; // 5%
        emit RoyaltyConfigured(_royaltyRecipient, 500);
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
     * @notice Generate tokenURI with rendering system integration
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
     * @notice EIP-2981 royalty info
     * @param tokenId Token ID (unused, same royalty for all tokens)
     * @param salePrice Sale price to calculate royalty from
     * @return receiver Address to receive royalties
     * @return royaltyAmount Amount of royalty to pay
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice) 
        external 
        view 
        override 
        returns (address receiver, uint256 royaltyAmount) 
    {
        receiver = royaltyRecipient;
        royaltyAmount = (salePrice * royaltyBasisPoints) / 10000;
    }
    
    /**
     * @notice Set royalty configuration (owner only)
     * @param recipient Address to receive royalties
     * @param basisPoints Royalty percentage in basis points (500 = 5%)
     */
    function setRoyalty(address recipient, uint96 basisPoints) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        require(basisPoints <= 1000, "Royalty too high"); // Max 10%
        
        royaltyRecipient = recipient;
        royaltyBasisPoints = basisPoints;
        
        emit RoyaltyConfigured(recipient, basisPoints);
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
     * @notice Check if contract supports interface
     */
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        virtual 
        override(ERC721, IERC165) 
        returns (bool) 
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
    
    /**
     * @notice Generate basic tokenURI for development phase
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
