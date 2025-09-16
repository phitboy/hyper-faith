// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OmamoriNFTBasic
 * @notice Ultra-minimal ERC-721 contract for Omamori tablets
 * @dev Basic version for HyperEVM deployment with native HYPE burning
 * @author Hyper Faith Team
 */
contract OmamoriNFTBasic is ERC721, Ownable {
    
    /// @notice Burn address for HYPE (assistance fund)
    address public constant BURN_ADDRESS = 0xfefeFEFeFEFEFEFEFeFefefefefeFEfEfefefEfe;
    
    /// @notice Minimum HYPE burn amount (0.01 HYPE in wei)
    uint256 public constant MIN_BURN = 10000000000000000; // 0.01 * 1e18
    
    /// @notice Current token ID counter
    uint256 private _tokenIdCounter = 1;
    
    /// @notice Token data storage (simplified)
    mapping(uint256 => uint256) public tokenSeeds;
    mapping(uint256 => uint256) public tokenBurns;
    
    /// @notice Events
    event HypeBurned(address indexed burner, uint256 indexed tokenId, uint256 amount);
    
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
        
        // Generate deterministic seed
        uint256 seed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            tokenId,
            msg.value
        )));
        
        // Store data
        tokenSeeds[tokenId] = seed;
        tokenBurns[tokenId] = msg.value;
        
        // Mint NFT
        _mint(msg.sender, tokenId);
        
        emit HypeBurned(msg.sender, tokenId, msg.value);
    }
    
    /**
     * @notice Generate basic tokenURI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        uint256 seed = tokenSeeds[tokenId];
        uint256 burned = tokenBurns[tokenId];
        
        // Extract attributes from seed
        uint8 materialId = uint8(seed % 24);
        uint8 punchCount = uint8((seed >> 8) % 26);
        
        // Material names (simplified)
        string[24] memory materials = [
            "Wood", "Cloth", "Paper", "Clay", "Limestone", "Slate",
            "Basalt", "Granite", "Marble", "Bronze", "Obsidian", "Silver",
            "Jade", "Crystal", "Onyx", "Amber", "Amethyst", "Opal",
            "Emerald", "Sapphire", "Ruby", "Lapis Lazuli", "Gold", "Meteorite"
        ];
        
        // Create JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name":"Omamori #', _toString(tokenId), '",',
            '"description":"Ancient talismans for modern traders.",',
            '"attributes":[',
                '{"trait_type":"Material","value":"', materials[materialId], '"},',
                '{"trait_type":"Punches","value":', _toString(punchCount), '},',
                '{"trait_type":"HYPE Burned","value":', _toString(burned), '}',
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(json))
        ));
    }
    
    /**
     * @notice Get token attributes
     */
    function getTokenData(uint256 tokenId) external view returns (
        uint256 seed,
        uint256 burned,
        uint8 materialId,
        uint8 punchCount
    ) {
        _requireOwned(tokenId);
        seed = tokenSeeds[tokenId];
        burned = tokenBurns[tokenId];
        materialId = uint8(seed % 24);
        punchCount = uint8((seed >> 8) % 26);
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
    
    /**
     * @notice Simple Base64 encoding
     */
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
