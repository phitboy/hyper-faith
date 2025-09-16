// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IMaterials.sol";

/**
 * @title OmamoriNFT
 * @notice Core ERC-721 contract for Omamori tablets with HYPE burning and renderer integration
 * @dev Multi-contract architecture with external rendering system
 * @author Hyper Faith Team
 */
contract OmamoriNFT is ERC721, Ownable {
    
    /// @notice Deployed MaterialRegistry contract
    IMaterials public constant MATERIALS = IMaterials(0xA5D308DE0Be64df79C6715418070a090195A5657);
    
    /// @notice Burn address for HYPE (assistance fund)
    address public constant BURN_ADDRESS = 0xfefeFEFeFEFEFEFEFeFefefefefeFEfEfefefEfe;
    
    /// @notice Minimum HYPE burn amount (0.01 HYPE in wei)
    uint256 public constant MIN_BURN = 10000000000000000; // 0.01 * 1e18
    
    /// @notice Current token ID counter
    uint256 private _tokenIdCounter = 1;
    
    /// @notice Rendering system contracts
    address public glyphRenderer;
    address public punchRenderer;
    address public svgAssembler;
    
    /// @notice Token data storage
    struct TokenData {
        uint8 majorId;      // 0-11
        uint8 minorId;      // 0-3  
        uint16 materialId;  // 0-23
        uint8 punchCount;   // 0-25
        uint64 seed;        // Random seed
        uint128 hypeBurned; // Amount of HYPE burned
    }
    
    /// @notice Token data mapping
    mapping(uint256 => TokenData) public tokenData;
    
    /// @notice Events
    event HypeBurned(address indexed burner, uint256 indexed tokenId, uint256 amount);
    event RenderersUpdated(address glyphRenderer, address punchRenderer, address svgAssembler);
    
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
        uint64 seed = uint64(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            tokenId,
            msg.value
        ))));
        
        // Select material using deployed registry
        uint16 materialId = _selectMaterial(seed);
        
        // Generate other attributes
        uint8 majorId = uint8(seed % 12);
        uint8 minorId = uint8((seed >> 8) % 4);
        uint8 punchCount = uint8((seed >> 16) % 26); // 0-25
        
        // Store token data
        tokenData[tokenId] = TokenData({
            majorId: majorId,
            minorId: minorId,
            materialId: materialId,
            punchCount: punchCount,
            seed: seed,
            hypeBurned: uint128(msg.value)
        });
        
        // Mint NFT
        _mint(msg.sender, tokenId);
        
        emit HypeBurned(msg.sender, tokenId, msg.value);
    }
    
    /**
     * @notice Generate tokenURI with rendering system integration
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        // If rendering system is not set up, return basic metadata
        if (svgAssembler == address(0)) {
            return _generateBasicTokenURI(tokenId);
        }
        
        // Use rendering system for complete SVG art
        TokenData memory data = tokenData[tokenId];
        
        // Call SVG assembler which orchestrates the full rendering
        return ISVGAssembler(svgAssembler).generateTokenURI(
            tokenId,
            data.majorId,
            data.minorId,
            data.materialId,
            data.punchCount,
            data.seed,
            data.hypeBurned
        );
    }
    
    /**
     * @notice Generate basic tokenURI for development phase (no SVG art)
     */
    function _generateBasicTokenURI(uint256 tokenId) internal view returns (string memory) {
        TokenData memory data = tokenData[tokenId];
        IMaterials.MaterialView memory material = MATERIALS.viewMaterial(data.materialId);
        
        // Create basic JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name":"Omamori #', _toString(tokenId), '",',
            '"description":"Ancient talismans for modern traders. Rendering system pending deployment.",',
            '"attributes":[',
                '{"trait_type":"Material","value":"', material.name, '"},',
                '{"trait_type":"Rarity","value":"', material.tierName, '"},',
                '{"trait_type":"Major ID","value":', _toString(data.majorId), '},',
                '{"trait_type":"Minor ID","value":', _toString(data.minorId), '},',
                '{"trait_type":"Punches","value":', _toString(data.punchCount), '},',
                '{"trait_type":"HYPE Burned","value":', _toString(data.hypeBurned), '}',
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(json))
        ));
    }
    
    /**
     * @notice Set rendering system contracts (owner only)
     */
    function setRenderers(
        address _glyphRenderer,
        address _punchRenderer, 
        address _svgAssembler
    ) external onlyOwner {
        glyphRenderer = _glyphRenderer;
        punchRenderer = _punchRenderer;
        svgAssembler = _svgAssembler;
        
        emit RenderersUpdated(_glyphRenderer, _punchRenderer, _svgAssembler);
    }
    
    /**
     * @notice Get token data for external rendering
     */
    function getTokenData(uint256 tokenId) external view returns (TokenData memory) {
        _requireOwned(tokenId);
        return tokenData[tokenId];
    }
    
    /**
     * @notice Select material using deployed registry weighted selection
     */
    function _selectMaterial(uint64 seed) internal view returns (uint16) {
        uint256 totalWeight = MATERIALS.totalWeight();
        uint256 randomValue = uint256(seed) % totalWeight;
        
        uint256 cumulativeWeight = 0;
        for (uint16 i = 0; i < 24; i++) {
            cumulativeWeight += MATERIALS.weight(i);
            if (randomValue < cumulativeWeight) {
                return i;
            }
        }
        
        return 23; // Fallback to last material
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
     * @notice Base64 encoding
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

/**
 * @title ISVGAssembler
 * @notice Interface for SVG assembler contract
 */
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