// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IMaterials.sol";

/**
 * @title MaterialRegistryPaletteOptimized
 * @notice Gas-optimized on-chain registry of 24 materials with exact weights and visual properties
 * @dev Optimized for HyperEVM 2M gas block limit using efficient string storage
 * @author Hyper Faith Team
 */
contract MaterialRegistryPaletteOptimized is IMaterials {
    /// @notice Total weight across all materials (exactly 1 billion)
    uint256 public constant TOTAL_WEIGHT = 1_000_000_000;
    
    /// @notice Number of materials in the palette
    uint256 public constant MATERIAL_COUNT = 24;

    /// @notice Efficient storage for material data
    mapping(uint16 => uint256) private weights;
    mapping(uint16 => bytes32) private materialNames;
    mapping(uint16 => bytes32) private tierNames;
    mapping(uint16 => bytes32) private bgColors;
    mapping(uint16 => bytes32) private strokeColors;

    /**
     * @notice Initialize the material palette with exact specifications
     * @dev Sets up all 24 materials with precise weights and hex colors using efficient storage
     */
    constructor() {
        _initializeMaterials();
    }

    /**
     * @inheritdoc IMaterials
     */
    function viewMaterial(uint16 id) external view returns (MaterialView memory) {
        require(id < MATERIAL_COUNT, "MaterialRegistryPalette: Invalid material ID");
        
        return MaterialView({
            name: _bytes32ToString(materialNames[id]),
            tierName: _bytes32ToString(tierNames[id]),
            bg: _bytes32ToString(bgColors[id]),
            stroke: _bytes32ToString(strokeColors[id])
        });
    }

    /**
     * @inheritdoc IMaterials
     */
    function weight(uint16 id) external view returns (uint256) {
        require(id < MATERIAL_COUNT, "MaterialRegistryPalette: Invalid material ID");
        return weights[id];
    }

    /**
     * @inheritdoc IMaterials
     */
    function totalWeight() external pure returns (uint256) {
        return TOTAL_WEIGHT;
    }

    /**
     * @notice Get all weights as array for testing/verification
     * @return Array of all 24 material weights
     * @dev Useful for verifying weight distribution in tests
     */
    function getAllWeights() external view returns (uint256[] memory) {
        uint256[] memory allWeights = new uint256[](MATERIAL_COUNT);
        for (uint16 i = 0; i < MATERIAL_COUNT; i++) {
            allWeights[i] = weights[i];
        }
        return allWeights;
    }

    /**
     * @notice Initialize all 24 materials with exact specifications
     * @dev Private function called in constructor using gas-optimized storage
     */
    function _initializeMaterials() private {
        // Common Tier (600,000,000 total weight)
        _setMaterial(0, "Wood", "Common", "#b78c55", "#6b4e2e", 300_000_900);
        _setMaterial(1, "Cloth", "Common", "#d9cbb2", "#7a6f60", 100_000_000);
        _setMaterial(2, "Paper", "Common", "#efe6d3", "#8b8373", 100_000_000);
        _setMaterial(3, "Clay", "Common", "#b0643a", "#6a3d26", 50_000_000);
        _setMaterial(4, "Limestone", "Common", "#cfc8b7", "#6f6a5c", 50_000_000);

        // Uncommon Tier (350,000,000 total weight)
        _setMaterial(5, "Slate", "Uncommon", "#4b4f59", "#b8bdc9", 100_000_000);
        _setMaterial(6, "Basalt", "Uncommon", "#3e3b3a", "#b3ada9", 80_000_000);
        _setMaterial(7, "Granite", "Uncommon", "#8b8e95", "#2e3138", 80_000_000);
        _setMaterial(8, "Marble", "Uncommon", "#e6e6ea", "#6e6e78", 40_000_000);
        _setMaterial(9, "Bronze", "Uncommon", "#8c6e3d", "#f1c277", 30_000_000);
        _setMaterial(10, "Obsidian", "Uncommon", "#111216", "#8f8f99", 20_000_000);

        // Rare Tier (49,000,000 total weight)
        _setMaterial(11, "Silver", "Rare", "#c0c0c0", "#5b5b5b", 15_000_000);
        _setMaterial(12, "Jade", "Rare", "#2f6e5b", "#a7e0cc", 10_000_000);
        _setMaterial(13, "Crystal", "Rare", "#e8f2ff", "#7aa0c8", 10_000_000);
        _setMaterial(14, "Onyx", "Rare", "#1a1a1a", "#9c9c9c", 7_000_000);
        _setMaterial(15, "Amber", "Rare", "#c37a3a", "#ffd08a", 7_000_000);

        // Ultra Rare Tier (999,000 total weight)
        _setMaterial(16, "Amethyst", "Ultra Rare", "#5d3b8a", "#c8b1ff", 400_000);
        _setMaterial(17, "Opal", "Ultra Rare", "#d9ecff", "#9fd5ff", 200_000);
        _setMaterial(18, "Emerald", "Ultra Rare", "#1f7a44", "#9af0bf", 150_000);
        _setMaterial(19, "Sapphire", "Ultra Rare", "#143a8a", "#88b0ff", 120_000);
        _setMaterial(20, "Ruby", "Ultra Rare", "#8a1423", "#ff98a6", 80_000);
        _setMaterial(21, "Lapis Lazuli", "Ultra Rare", "#1b3b8a", "#c0d0ff", 49_000);

        // Mythic Tier (100 total weight)
        _setMaterial(22, "Gold", "Mythic", "#d4af37", "#5a4b10", 50);
        _setMaterial(23, "Meteorite", "Mythic", "#5a5752", "#d7d3cc", 50);
    }

    /**
     * @notice Set material data using efficient storage
     * @param id Material ID
     * @param name Material name
     * @param tier Tier name
     * @param bg Background color
     * @param stroke Stroke color
     * @param materialWeight Weight value
     */
    function _setMaterial(
        uint16 id,
        string memory name,
        string memory tier,
        string memory bg,
        string memory stroke,
        uint256 materialWeight
    ) private {
        materialNames[id] = _stringToBytes32(name);
        tierNames[id] = _stringToBytes32(tier);
        bgColors[id] = _stringToBytes32(bg);
        strokeColors[id] = _stringToBytes32(stroke);
        weights[id] = materialWeight;
    }

    /**
     * @notice Convert string to bytes32 for efficient storage
     * @param str String to convert (max 32 bytes)
     * @return bytes32 representation
     */
    function _stringToBytes32(string memory str) private pure returns (bytes32) {
        bytes memory strBytes = bytes(str);
        require(strBytes.length <= 32, "String too long");
        
        bytes32 result;
        assembly {
            result := mload(add(strBytes, 32))
        }
        return result;
    }

    /**
     * @notice Convert bytes32 back to string
     * @param data bytes32 data to convert
     * @return String representation
     */
    function _bytes32ToString(bytes32 data) private pure returns (string memory) {
        uint256 length = 0;
        for (uint256 i = 0; i < 32; i++) {
            if (data[i] != 0) {
                length++;
            } else {
                break;
            }
        }
        
        bytes memory result = new bytes(length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = data[i];
        }
        
        return string(result);
    }
}
