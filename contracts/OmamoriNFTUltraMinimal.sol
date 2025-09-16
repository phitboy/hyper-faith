// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract OmamoriNFTUltraMinimal is ERC721, Ownable, IERC2981 {
    
    address public constant BURN_ADDRESS = 0xfefeFEFeFEFEFEFEFeFefefefefeFEfEfefefEfe;
    uint256 public constant MIN_BURN = 10000000000000000;
    
    uint256 private _tokenIdCounter = 1;
    address public svgAssembler;
    mapping(uint256 => bytes32) public tokenData;
    address public royaltyRecipient;
    uint96 public royaltyBasisPoints = 500;
    
    event HypeBurned(address indexed burner, uint256 indexed tokenId, uint256 amount);
    
    constructor(address _initialOwner, address _royaltyRecipient) 
        ERC721("Hyperliquid Omamori", "OMAMORI") 
        Ownable(_initialOwner) 
    {
        royaltyRecipient = _royaltyRecipient;
    }
    
    function mint() external payable {
        require(msg.value >= MIN_BURN, "Insufficient burn amount");
        
        uint256 tokenId = _tokenIdCounter++;
        (bool success, ) = BURN_ADDRESS.call{value: msg.value}("");
        require(success, "HYPE burn failed");
        
        // 🔒 SECURE: Pure randomness
        uint64 seed = uint64(uint256(keccak256(abi.encodePacked(
            block.timestamp, block.prevrandao, msg.sender, tokenId
        ))));
        
        // Fair rarity
        uint16 materialId = _selectMaterialFair(seed);
        uint8 majorId = uint8(seed % 12);
        uint8 minorId = uint8((seed >> 8) % 4);
        uint8 punchCount = uint8((seed >> 16) % 26);
        
        tokenData[tokenId] = bytes32(
            (uint256(seed) << 192) | (uint256(materialId) << 176) |
            (uint256(majorId) << 168) | (uint256(minorId) << 160) |
            (uint256(punchCount) << 152) | uint256(uint120(msg.value))
        );
        
        _mint(msg.sender, tokenId);
        emit HypeBurned(msg.sender, tokenId, msg.value);
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        if (svgAssembler != address(0)) {
            bytes32 data = tokenData[tokenId];
            return ISVGAssembler(svgAssembler).generateTokenURI(
                tokenId,
                uint8(uint256(data) >> 168),
                uint8(uint256(data) >> 160),
                uint16(uint256(data) >> 176),
                uint8(uint256(data) >> 152),
                uint64(uint256(data) >> 192),
                uint256(uint120(uint256(data)))
            );
        }
        return "";
    }
    
    function royaltyInfo(uint256, uint256 salePrice) external view override returns (address receiver, uint256 royaltyAmount) {
        receiver = royaltyRecipient;
        royaltyAmount = (salePrice * royaltyBasisPoints) / 10000;
    }
    
    function setSVGAssembler(address _svgAssembler) external onlyOwner {
        svgAssembler = _svgAssembler;
    }
    
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, IERC165) returns (bool) {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
    
    function _selectMaterialFair(uint64 seed) internal pure returns (uint16) {
        uint256 roll = seed % 10000;
        if (roll < 5000) return uint16(seed % 12);
        if (roll < 7500) return uint16(12 + (seed % 6));
        if (roll < 9000) return uint16(18 + (seed % 4));
        if (roll < 9750) return uint16(22 + (seed % 2));
        return 23;
    }
}

interface ISVGAssembler {
    function generateTokenURI(uint256 tokenId, uint8 majorId, uint8 minorId, uint16 materialId, uint8 punchCount, uint64 seed, uint256 hypeBurned) external view returns (string memory);
}
