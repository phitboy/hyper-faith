// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IMaterials.sol";
import "./OmamoriRender.sol";

/**
 * @title OmamoriNFT
 * @notice Main ERC-721 contract for Omamori tablets with HYPE burning mechanism
 * @dev Supports dual burn modes: ERC-20 HYPE token or native HYPE
 * @author Hyper Faith Team
 */
contract OmamoriNFT is ERC721, Ownable {
    
    /// @notice Burn modes for HYPE
    enum BurnMode { ERC20, NATIVE }
    
    /// @notice Current burn mode
    BurnMode public burnMode;
    
    /// @notice HYPE ERC-20 token address (used in ERC20 mode)
    IERC20 public hypeToken;
    
    /// @notice Renderer contract for tokenURI generation
    OmamoriRender public renderer;
    
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
    
    /// @notice Mapping from token ID to token data
    mapping(uint256 => TokenData) public tokenData;
    
    /// @notice Emitted when an Omamori is minted
    event OmamoriMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint8 majorId,
        uint8 minorId,
        uint16 materialId,
        uint8 punchCount,
        uint128 hypeBurned,
        uint64 seed
    );
    
    /// @notice Emitted when burn mode is changed
    event BurnModeChanged(BurnMode oldMode, BurnMode newMode);
    
    /// @notice Emitted when HYPE token address is updated
    event HypeTokenUpdated(address oldToken, address newToken);
    
    /**
     * @notice Initialize the Omamori NFT contract
     * @param _hypeToken Address of HYPE ERC-20 token (for ERC20 burn mode)
     * @param _renderer Address of the renderer contract
     * @param _materials Address of the materials registry
     * @param _initialOwner Initial owner of the contract
     */
    constructor(
        address _hypeToken,
        address _renderer,
        address _materials,
        address _initialOwner
    ) ERC721("Hyperliquid Omamori", "OMAMORI") Ownable(_initialOwner) {
        hypeToken = IERC20(_hypeToken);
        renderer = OmamoriRender(_renderer);
        materials = IMaterials(_materials);
        burnMode = BurnMode.ERC20; // Default to ERC-20 mode
    }
    
    /**
     * @notice Mint an Omamori NFT by burning HYPE
     * @param majorId Major glyph ID (0-11)
     * @param minorId Minor glyph ID (0-3)
     * @param amountToBurn Amount of HYPE to burn (in wei)
     * @return tokenId The minted token ID
     */
    function mint(uint8 majorId, uint8 minorId, uint256 amountToBurn) external payable returns (uint256) {
        require(majorId < 12, "OmamoriNFT: Invalid major ID");
        require(minorId < 4, "OmamoriNFT: Invalid minor ID");
        require(amountToBurn >= MIN_BURN, "OmamoriNFT: Insufficient HYPE burn");
        
        // Handle HYPE burning based on mode
        if (burnMode == BurnMode.ERC20) {
            require(msg.value == 0, "OmamoriNFT: No ETH required in ERC20 mode");
            require(address(hypeToken) != address(0), "OmamoriNFT: HYPE token not set");
            
            // Transfer HYPE from user to burn address
            bool success = hypeToken.transferFrom(msg.sender, BURN_ADDRESS, amountToBurn);
            require(success, "OmamoriNFT: HYPE transfer failed");
        } else {
            // Native HYPE mode
            require(msg.value >= amountToBurn, "OmamoriNFT: Insufficient native HYPE");
            require(msg.value >= MIN_BURN, "OmamoriNFT: Below minimum burn");
            
            // Forward native HYPE to burn address
            (bool success, ) = BURN_ADDRESS.call{value: amountToBurn}("");
            require(success, "OmamoriNFT: Native HYPE transfer failed");
            
            // Refund excess if any
            if (msg.value > amountToBurn) {
                (bool refundSuccess, ) = msg.sender.call{value: msg.value - amountToBurn}("");
                require(refundSuccess, "OmamoriNFT: Refund failed");
            }
        }
        
        // Generate deterministic randomness
        uint256 tokenId = _tokenIdCounter++;
        uint64 seed = uint64(uint256(keccak256(abi.encodePacked(
            block.prevrandao,
            msg.sender,
            tokenId,
            block.timestamp
        ))));
        
        // Roll for material using weighted distribution
        uint16 materialId = _rollMaterial(seed);
        
        // Generate punch count (0-25)
        uint8 punchCount = uint8(uint256(keccak256(abi.encodePacked(seed, "punches"))) % 26);
        
        // Store token data
        tokenData[tokenId] = TokenData({
            majorId: majorId,
            minorId: minorId,
            materialId: materialId,
            punchCount: punchCount,
            seed: seed,
            hypeBurned: uint128(amountToBurn)
        });
        
        // Mint NFT
        _safeMint(msg.sender, tokenId);
        
        // Emit event
        emit OmamoriMinted(
            tokenId,
            msg.sender,
            majorId,
            minorId,
            materialId,
            punchCount,
            uint128(amountToBurn),
            seed
        );
        
        return tokenId;
    }
    
    /**
     * @notice Get token URI with complete metadata and embedded SVG
     * @param tokenId Token ID to get URI for
     * @return Base64 encoded JSON metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        TokenData memory data = tokenData[tokenId];
        
        return renderer.tokenURIView(
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
     * @notice Roll for material using weighted distribution
     * @param seed Random seed for deterministic selection
     * @return materialId Selected material ID (0-23)
     */
    function _rollMaterial(uint64 seed) internal view returns (uint16) {
        uint256 totalWeight = materials.totalWeight();
        uint256 randomValue = uint256(keccak256(abi.encodePacked(seed, "material"))) % totalWeight;
        
        uint256 cumulativeWeight = 0;
        for (uint16 i = 0; i < 24; i++) {
            cumulativeWeight += materials.weight(i);
            if (randomValue < cumulativeWeight) {
                return i;
            }
        }
        
        // Fallback (should never reach here if weights are correct)
        return 0;
    }
    
    /**
     * @notice Set burn mode (owner only)
     * @param _burnMode New burn mode
     */
    function setBurnMode(BurnMode _burnMode) external onlyOwner {
        BurnMode oldMode = burnMode;
        burnMode = _burnMode;
        emit BurnModeChanged(oldMode, _burnMode);
    }
    
    /**
     * @notice Set HYPE token address (owner only)
     * @param _hypeToken New HYPE token address
     */
    function setHypeToken(address _hypeToken) external onlyOwner {
        address oldToken = address(hypeToken);
        hypeToken = IERC20(_hypeToken);
        emit HypeTokenUpdated(oldToken, _hypeToken);
    }
    
    /**
     * @notice Update renderer contract (owner only)
     * @param _renderer New renderer address
     */
    function setRenderer(address _renderer) external onlyOwner {
        renderer = OmamoriRender(_renderer);
    }
    
    /**
     * @notice Update materials registry (owner only)
     * @param _materials New materials address
     */
    function setMaterials(address _materials) external onlyOwner {
        materials = IMaterials(_materials);
    }
    
    /**
     * @notice Get total number of tokens minted
     * @return Total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }
    
    /**
     * @notice Check if token exists
     * @param tokenId Token ID to check
     * @return True if token exists
     */
    function exists(uint256 tokenId) external view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    /**
     * @notice Get token data for a given token ID
     * @param tokenId Token ID to get data for
     * @return Token data struct
     */
    function getTokenData(uint256 tokenId) external view returns (TokenData memory) {
        _requireOwned(tokenId);
        return tokenData[tokenId];
    }
    
    /**
     * @notice Emergency withdraw function (owner only)
     * @dev Only for recovering accidentally sent tokens/ETH
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool success, ) = owner().call{value: balance}("");
            require(success, "OmamoriNFT: Withdrawal failed");
        }
    }
    
    /**
     * @notice Recover ERC20 tokens accidentally sent to contract (owner only)
     * @param token Token address to recover
     * @param amount Amount to recover
     */
    function recoverERC20(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}
