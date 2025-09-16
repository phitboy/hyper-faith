// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IMaterials.sol";

/**
 * @title OmamoriNFTMinimal
 * @notice Gas-optimized ERC-721 contract for Omamori tablets with HYPE burning
 * @dev Simplified version for HyperEVM deployment with basic metadata
 * @author Hyper Faith Team
 */
contract OmamoriNFTMinimal is ERC721, Ownable {
    
    /// @notice Burn modes for HYPE
    enum BurnMode { ERC20, NATIVE }
    
    /// @notice Current burn mode
    BurnMode public burnMode;
    
    /// @notice HYPE ERC-20 token address (used in ERC20 mode)
    IERC20 public hypeToken;
    
    /// @notice Materials registry
    IMaterials public materials;
    
    /// @notice Burn address for HYPE (assistance fund)
    address public constant BURN_ADDRESS = 0xfefeFEFeFEFEFEFEFeFefefefefeFEfEfefefEfe;
    
    /// @notice Minimum HYPE burn amount (0.01 HYPE in wei)
    uint256 public constant MIN_BURN = 10000000000000000; // 0.01 * 1e18
    
    /// @notice Current token ID counter
    uint256 private _tokenIdCounter = 1;
    
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
    event BurnModeChanged(BurnMode newMode);
    
    constructor(
        address _hypeToken,
        address _materials,
        address _initialOwner
    ) ERC721("Hyperliquid Omamori", "OMAMORI") Ownable(_initialOwner) {
        hypeToken = IERC20(_hypeToken);
        materials = IMaterials(_materials);
        burnMode = BurnMode.ERC20; // Default to ERC-20 mode
    }
    
    /**
     * @notice Mint an Omamori NFT by burning HYPE
     * @param burnAmount Amount of HYPE to burn (must be >= MIN_BURN)
     */
    function mint(uint256 burnAmount) external payable {
        require(burnAmount >= MIN_BURN, "Insufficient burn amount");
        
        uint256 tokenId = _tokenIdCounter++;
        
        // Handle HYPE burning based on mode
        if (burnMode == BurnMode.ERC20) {
            require(msg.value == 0, "No native HYPE in ERC20 mode");
            require(address(hypeToken) != address(0), "HYPE token not set");
            hypeToken.transferFrom(msg.sender, BURN_ADDRESS, burnAmount);
        } else {
            require(msg.value == burnAmount, "Incorrect native HYPE amount");
            (bool success, ) = BURN_ADDRESS.call{value: burnAmount}("");
            require(success, "Native HYPE burn failed");
        }
        
        // Generate deterministic randomness
        uint64 seed = uint64(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            tokenId,
            burnAmount
        ))));
        
        // Select material based on weighted randomness
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
            hypeBurned: uint128(burnAmount)
        });
        
        // Mint NFT
        _mint(msg.sender, tokenId);
        
        emit HypeBurned(msg.sender, tokenId, burnAmount);
    }
    
    /**
     * @notice Generate tokenURI with basic metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        TokenData memory data = tokenData[tokenId];
        IMaterials.MaterialView memory material = materials.viewMaterial(data.materialId);
        
        // Create simple JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name":"Omamori #', _toString(tokenId), '",',
            '"description":"Ancient talismans for modern traders. Simplified on-chain NFT.",',
            '"attributes":[',
                '{"trait_type":"Material","value":"', material.name, '"},',
                '{"trait_type":"Rarity","value":"', material.tierName, '"},',
                '{"trait_type":"Punches","value":', _toString(data.punchCount), '},',
                '{"trait_type":"Major ID","value":', _toString(data.majorId), '},',
                '{"trait_type":"Minor ID","value":', _toString(data.minorId), '},',
                '{"trait_type":"HYPE Burned","value":', _toString(data.hypeBurned), '}',
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(json))
        ));
    }
    
    /**
     * @notice Select material based on weighted randomness
     */
    function _selectMaterial(uint64 seed) internal view returns (uint16) {
        uint256 totalWeight = materials.totalWeight();
        uint256 randomValue = uint256(seed) % totalWeight;
        
        uint256 cumulativeWeight = 0;
        for (uint16 i = 0; i < 24; i++) {
            cumulativeWeight += materials.weight(i);
            if (randomValue < cumulativeWeight) {
                return i;
            }
        }
        
        return 23; // Fallback to last material
    }
    
    /**
     * @notice Set burn mode (owner only)
     */
    function setBurnMode(BurnMode _mode) external onlyOwner {
        burnMode = _mode;
        emit BurnModeChanged(_mode);
    }
    
    /**
     * @notice Set HYPE token address (owner only)
     */
    function setHypeToken(address _hypeToken) external onlyOwner {
        hypeToken = IERC20(_hypeToken);
    }
    
    /**
     * @notice Emergency token recovery (owner only)
     */
    function recoverERC20(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
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
