// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title OmamoriNFT
 * @notice Clean, minimal Omamori NFT with off-chain rendering
 * @dev Stores essential mint data, points to off-chain metadata service
 */
contract OmamoriNFT is ERC721, Ownable, IERC2981 {
    
    /// @notice Burn address for HYPE
    address public constant BURN_ADDRESS = 0xfefeFEFeFEFEFEFEFeFefefefefeFEfEfefefEfe;
    
    /// @notice Minimum HYPE burn amount (0.01 HYPE)
    uint256 public constant MIN_BURN = 10000000000000000;
    
    /// @notice Current token ID counter
    uint256 private _tokenIdCounter = 1;
    
    /// @notice Base URI for metadata service
    string private _baseTokenURI;
    
    /// @notice Token data structure
    struct TokenData {
        uint8 majorId;      // User selected major arcanum (0-11)
        uint8 minorId;      // User selected minor aspect (0-3)
        uint16 materialId;  // Randomly determined material (0-23)
        uint8 punchCount;   // Randomly determined punch count (0-25)
        uint64 seed;        // Deterministic randomness seed
        uint120 hypeBurned; // Amount of HYPE burned (wei)
    }
    
    /// @notice Token data storage
    mapping(uint256 => TokenData) public tokens;
    
    /// @notice Royalty configuration
    address public royaltyRecipient;
    uint96 public royaltyBasisPoints; // 500 = 5%
    
    /// @notice Events
    event HypeBurned(address indexed burner, uint256 indexed tokenId, uint256 amount);
    
    constructor(
        address _initialOwner,
        address _royaltyRecipient,
        string memory _baseTokenURI
    ) 
        ERC721("Hyperliquid Omamori", "OMAMORI") 
        Ownable(_initialOwner) 
    {
        royaltyRecipient = _royaltyRecipient;
        royaltyBasisPoints = 500; // 5%
        _baseTokenURI = _baseTokenURI;
    }
    
    /**
     * @notice Mint an Omamori NFT by burning HYPE with user-selected arcanum
     * @param majorId The major arcanum ID (0-11)
     * @param minorId The minor aspect ID (0-3)
     * @return tokenId The ID of the newly minted token
     */
    function mint(uint8 majorId, uint8 minorId) external payable returns (uint256) {
        require(msg.value >= MIN_BURN, "Insufficient HYPE burn amount");
        require(majorId < 12, "Invalid major arcanum ID");
        require(minorId < 4, "Invalid minor aspect ID");
        
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
        uint16 materialId = _selectMaterial(seed);
        uint8 punchCount = uint8((seed >> 32) % 26); // 0-25 punches
        
        // Store token data
        tokens[tokenId] = TokenData({
            majorId: majorId,
            minorId: minorId,
            materialId: materialId,
            punchCount: punchCount,
            seed: seed,
            hypeBurned: uint120(msg.value)
        });
        
        // Burn HYPE by sending to burn address
        (bool success, ) = BURN_ADDRESS.call{value: msg.value}("");
        require(success, "HYPE burn failed");
        
        // Mint NFT to user
        _safeMint(msg.sender, tokenId);
        
        emit HypeBurned(msg.sender, tokenId, msg.value);
        
        return tokenId;
    }
    
    /**
     * @notice Get token data for a given token ID
     * @param tokenId The token ID to query
     * @return Token data struct
     */
    function getTokenData(uint256 tokenId) external view returns (TokenData memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokens[tokenId];
    }
    
    /**
     * @notice Generate token URI pointing to off-chain metadata service
     * @param tokenId The token ID to generate URI for
     * @return The complete token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return string(abi.encodePacked(_baseTokenURI, _toString(tokenId)));
    }
    
    /**
     * @notice Secure material selection with proper rarity distribution
     * @dev Matches the frontend material selection logic exactly
     */
    function _selectMaterial(uint64 seed) internal pure returns (uint16) {
        uint256 roll = seed % 10000;
        
        // Rarity distribution matching website expectations
        if (roll < 5000) return uint16(seed % 5);        // Common (50%): Wood, Cloth, Paper, Clay, Limestone
        if (roll < 7500) return uint16(5 + (seed % 6));  // Uncommon (25%): Slate, Basalt, Granite, Marble, Bronze, Obsidian
        if (roll < 9000) return uint16(11 + (seed % 5)); // Rare (15%): Silver, Jade, Crystal, Onyx, Amber
        if (roll < 9750) return uint16(16 + (seed % 6)); // Ultra Rare (7.5%): Amethyst, Opal, Emerald, Sapphire, Ruby, Lapis
        return uint16(22 + (seed % 2));                  // Mythic (2.5%): Gold, Meteorite
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
    
    // Owner functions
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }
    
    function setRoyaltyRecipient(address newRecipient) external onlyOwner {
        royaltyRecipient = newRecipient;
    }
    
    function setRoyaltyBasisPoints(uint96 newBasisPoints) external onlyOwner {
        require(newBasisPoints <= 1000, "Royalty too high"); // Max 10%
        royaltyBasisPoints = newBasisPoints;
    }
    
    // Utility function
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
