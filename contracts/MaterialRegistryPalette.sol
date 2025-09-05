// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IMaterials.sol";

/**
 * @title MaterialRegistryPalette
 * @notice On-chain registry of 24 materials with exact weights and visual properties
 * @dev Implements weighted distribution system totaling exactly 1,000,000,000 for fair randomness
 * @author Hyper Faith Team
 */
contract MaterialRegistryPalette is IMaterials {
    /// @notice Total weight across all materials (exactly 1 billion)
    uint256 public constant TOTAL_WEIGHT = 1_000_000_000;
    
    /// @notice Number of materials in the palette
    uint256 public constant MATERIAL_COUNT = 24;

    /// @notice Material data storage
    mapping(uint16 => MaterialView) private materials;
    mapping(uint16 => uint256) private weights;

    /**
     * @notice Initialize the material palette with exact specifications
     * @dev Sets up all 24 materials with precise weights and hex colors
     */
    constructor() {
        _initializeMaterials();
    }

    /**
     * @inheritdoc IMaterials
     */
    function viewMaterial(uint16 id) external view returns (MaterialView memory) {
        require(id < MATERIAL_COUNT, "MaterialRegistryPalette: Invalid material ID");
        return materials[id];
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
     * @dev Private function called in constructor to set up the complete palette
     */
    function _initializeMaterials() private {
        // Common Tier (600,000,000 total weight)
        materials[0] = MaterialView("Wood", "Common", "#b78c55", "#6b4e2e");
        weights[0] = 300_000_900; // Adjusted to hit exact 1e9 total

        materials[1] = MaterialView("Cloth", "Common", "#d9cbb2", "#7a6f60");
        weights[1] = 100_000_000;

        materials[2] = MaterialView("Paper", "Common", "#efe6d3", "#8b8373");
        weights[2] = 100_000_000;

        materials[3] = MaterialView("Clay", "Common", "#b0643a", "#6a3d26");
        weights[3] = 50_000_000;

        materials[4] = MaterialView("Limestone", "Common", "#cfc8b7", "#6f6a5c");
        weights[4] = 50_000_000;

        // Uncommon Tier (350,000,000 total weight)
        materials[5] = MaterialView("Slate", "Uncommon", "#4b4f59", "#b8bdc9");
        weights[5] = 100_000_000;

        materials[6] = MaterialView("Basalt", "Uncommon", "#3e3b3a", "#b3ada9");
        weights[6] = 80_000_000;

        materials[7] = MaterialView("Granite", "Uncommon", "#8b8e95", "#2e3138");
        weights[7] = 80_000_000;

        materials[8] = MaterialView("Marble", "Uncommon", "#e6e6ea", "#6e6e78");
        weights[8] = 40_000_000;

        materials[9] = MaterialView("Bronze", "Uncommon", "#8c6e3d", "#f1c277");
        weights[9] = 30_000_000;

        materials[10] = MaterialView("Obsidian", "Uncommon", "#111216", "#8f8f99");
        weights[10] = 20_000_000;

        // Rare Tier (49,000,000 total weight)
        materials[11] = MaterialView("Silver", "Rare", "#c0c0c0", "#5b5b5b");
        weights[11] = 15_000_000;

        materials[12] = MaterialView("Jade", "Rare", "#2f6e5b", "#a7e0cc");
        weights[12] = 10_000_000;

        materials[13] = MaterialView("Crystal", "Rare", "#e8f2ff", "#7aa0c8");
        weights[13] = 10_000_000;

        materials[14] = MaterialView("Onyx", "Rare", "#1a1a1a", "#9c9c9c");
        weights[14] = 7_000_000;

        materials[15] = MaterialView("Amber", "Rare", "#c37a3a", "#ffd08a");
        weights[15] = 7_000_000;

        // Ultra Rare Tier (999,000 total weight)
        materials[16] = MaterialView("Amethyst", "Ultra Rare", "#5d3b8a", "#c8b1ff");
        weights[16] = 400_000;

        materials[17] = MaterialView("Opal", "Ultra Rare", "#d9ecff", "#9fd5ff");
        weights[17] = 200_000;

        materials[18] = MaterialView("Emerald", "Ultra Rare", "#1f7a44", "#9af0bf");
        weights[18] = 150_000;

        materials[19] = MaterialView("Sapphire", "Ultra Rare", "#143a8a", "#88b0ff");
        weights[19] = 120_000;

        materials[20] = MaterialView("Ruby", "Ultra Rare", "#8a1423", "#ff98a6");
        weights[20] = 80_000;

        materials[21] = MaterialView("Lapis Lazuli", "Ultra Rare", "#1b3b8a", "#c0d0ff");
        weights[21] = 49_000;

        // Mythic Tier (100 total weight)
        materials[22] = MaterialView("Gold", "Mythic", "#d4af37", "#5a4b10");
        weights[22] = 50;

        materials[23] = MaterialView("Meteorite", "Mythic", "#5a5752", "#d7d3cc");
        weights[23] = 50;
    }
}
