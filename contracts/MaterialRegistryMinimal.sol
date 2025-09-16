// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IMaterials.sol";

/**
 * @title MaterialRegistryMinimal
 * @notice Minimal deployment version - empty constructor, post-deployment initialization
 * @dev Designed to fit within HyperEVM 2M gas block limit
 * @author Hyper Faith Team
 */
contract MaterialRegistryMinimal is IMaterials {
    /// @notice Total weight across all materials (exactly 1 billion)
    uint256 public constant TOTAL_WEIGHT = 1_000_000_000;
    
    /// @notice Number of materials in the palette
    uint256 public constant MATERIAL_COUNT = 24;

    /// @notice Whether the registry has been initialized
    bool public initialized;
    
    /// @notice Owner who can initialize the registry
    address public owner;

    /// @notice Simple storage for material data
    mapping(uint16 => uint256) public weights;
    mapping(uint16 => string) public materialNames;
    mapping(uint16 => string) public tierNames;
    mapping(uint16 => string) public bgColors;
    mapping(uint16 => string) public strokeColors;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyInitialized() {
        require(initialized, "Not initialized");
        _;
    }

    /**
     * @notice Deploy empty registry - minimal constructor
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Set a single material (owner only)
     */
    function setMaterial(
        uint16 id,
        string calldata name,
        string calldata tier,
        string calldata bg,
        string calldata stroke,
        uint256 weight
    ) external onlyOwner {
        require(!initialized, "Already initialized");
        require(id < MATERIAL_COUNT, "Invalid ID");
        
        materialNames[id] = name;
        tierNames[id] = tier;
        bgColors[id] = bg;
        strokeColors[id] = stroke;
        weights[id] = weight;
    }

    /**
     * @notice Finalize initialization
     */
    function finalize() external onlyOwner {
        require(!initialized, "Already initialized");
        
        // Verify all materials are set
        uint256 totalWeight = 0;
        for (uint16 i = 0; i < MATERIAL_COUNT; i++) {
            require(weights[i] > 0, "Material not set");
            totalWeight += weights[i];
        }
        require(totalWeight == TOTAL_WEIGHT, "Incorrect total weight");
        
        initialized = true;
    }

    /**
     * @inheritdoc IMaterials
     */
    function viewMaterial(uint16 id) external view onlyInitialized returns (MaterialView memory) {
        require(id < MATERIAL_COUNT, "Invalid material ID");
        
        return MaterialView({
            name: materialNames[id],
            tierName: tierNames[id],
            bg: bgColors[id],
            stroke: strokeColors[id]
        });
    }

    /**
     * @inheritdoc IMaterials
     */
    function weight(uint16 id) external view onlyInitialized returns (uint256) {
        require(id < MATERIAL_COUNT, "Invalid material ID");
        return weights[id];
    }

    /**
     * @inheritdoc IMaterials
     */
    function totalWeight() external pure returns (uint256) {
        return TOTAL_WEIGHT;
    }
}
