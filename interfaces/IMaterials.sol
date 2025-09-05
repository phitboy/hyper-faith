// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IMaterials
 * @notice Interface for accessing material palette data with weights and visual properties
 * @dev Provides access to 24 materials across 5 tiers with exact weight distribution totaling 1e9
 */
interface IMaterials {
    /**
     * @notice Material view data structure containing all visual and metadata properties
     * @param name Human-readable material name (e.g., "Wood", "Gold")
     * @param tierName Rarity tier name (e.g., "Common", "Mythic")
     * @param bg Background color as hex string (e.g., "#b78c55")
     * @param stroke Stroke/outline color as hex string (e.g., "#6b4e2e")
     */
    struct MaterialView {
        string name;
        string tierName;
        string bg;
        string stroke;
    }

    /**
     * @notice Get complete material data for rendering and metadata
     * @param id Material ID (0-23)
     * @return MaterialView struct with name, tier, and colors
     * @dev Reverts if id >= 24
     */
    function viewMaterial(uint16 id) external view returns (MaterialView memory);

    /**
     * @notice Get weight for a specific material ID
     * @param id Material ID (0-23)
     * @return Weight value for weighted random selection
     * @dev Reverts if id >= 24
     */
    function weight(uint16 id) external view returns (uint256);

    /**
     * @notice Get total weight across all materials
     * @return Total weight (exactly 1,000,000,000)
     * @dev Used for weighted random selection calculations
     */
    function totalWeight() external view returns (uint256);
}
