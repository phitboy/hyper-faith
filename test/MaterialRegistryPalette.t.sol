// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/MaterialRegistryPalette.sol";
import "../interfaces/IMaterials.sol";

/**
 * @title MaterialRegistryPaletteTest
 * @notice Comprehensive tests for material registry functionality
 * @dev Tests weight distribution, material access, and edge cases
 */
contract MaterialRegistryPaletteTest is Test {
    MaterialRegistryPalette public registry;
    
    /// @notice Expected total weight (1 billion)
    uint256 constant EXPECTED_TOTAL_WEIGHT = 1_000_000_000;
    
    /// @notice Number of materials
    uint256 constant MATERIAL_COUNT = 24;

    function setUp() public {
        registry = new MaterialRegistryPalette();
    }

    /**
     * @notice Test that total weight equals exactly 1 billion
     */
    function test_TotalWeight() public view {
        assertEq(registry.totalWeight(), EXPECTED_TOTAL_WEIGHT, "Total weight must be exactly 1e9");
    }

    /**
     * @notice Test that all individual weights sum to total weight
     */
    function test_WeightSum() public view {
        uint256 sum = 0;
        for (uint16 i = 0; i < MATERIAL_COUNT; i++) {
            sum += registry.weight(i);
        }
        assertEq(sum, EXPECTED_TOTAL_WEIGHT, "Sum of individual weights must equal total weight");
    }

    /**
     * @notice Test material access for all valid IDs
     */
    function test_MaterialAccess() public view {
        for (uint16 i = 0; i < MATERIAL_COUNT; i++) {
            IMaterials.MaterialView memory material = registry.viewMaterial(i);
            
            // Verify material has valid data
            assertTrue(bytes(material.name).length > 0, "Material name must not be empty");
            assertTrue(bytes(material.tierName).length > 0, "Tier name must not be empty");
            assertTrue(bytes(material.bg).length > 0, "Background color must not be empty");
            assertTrue(bytes(material.stroke).length > 0, "Stroke color must not be empty");
            
            // Verify colors start with #
            assertEq(bytes(material.bg)[0], "#", "Background color must start with #");
            assertEq(bytes(material.stroke)[0], "#", "Stroke color must start with #");
            
            // Verify weight is non-zero
            assertTrue(registry.weight(i) > 0, "Weight must be greater than 0");
        }
    }

    /**
     * @notice Test specific material properties for key materials
     */
    function test_SpecificMaterials() public view {
        // Test Wood (ID 0) - most common
        IMaterials.MaterialView memory wood = registry.viewMaterial(0);
        assertEq(wood.name, "Wood", "Wood name incorrect");
        assertEq(wood.tierName, "Common", "Wood tier incorrect");
        assertEq(wood.bg, "#b78c55", "Wood background color incorrect");
        assertEq(wood.stroke, "#6b4e2e", "Wood stroke color incorrect");
        assertEq(registry.weight(0), 300_000_900, "Wood weight incorrect");

        // Test Gold (ID 22) - mythic
        IMaterials.MaterialView memory gold = registry.viewMaterial(22);
        assertEq(gold.name, "Gold", "Gold name incorrect");
        assertEq(gold.tierName, "Mythic", "Gold tier incorrect");
        assertEq(gold.bg, "#d4af37", "Gold background color incorrect");
        assertEq(gold.stroke, "#5a4b10", "Gold stroke color incorrect");
        assertEq(registry.weight(22), 50, "Gold weight incorrect");

        // Test Meteorite (ID 23) - mythic
        IMaterials.MaterialView memory meteorite = registry.viewMaterial(23);
        assertEq(meteorite.name, "Meteorite", "Meteorite name incorrect");
        assertEq(meteorite.tierName, "Mythic", "Meteorite tier incorrect");
        assertEq(meteorite.bg, "#5a5752", "Meteorite background color incorrect");
        assertEq(meteorite.stroke, "#d7d3cc", "Meteorite stroke color incorrect");
        assertEq(registry.weight(23), 50, "Meteorite weight incorrect");
    }

    /**
     * @notice Test tier weight distributions
     */
    function test_TierWeights() public view {
        uint256 commonWeight = 0;
        uint256 uncommonWeight = 0;
        uint256 rareWeight = 0;
        uint256 ultraRareWeight = 0;
        uint256 mythicWeight = 0;

        for (uint16 i = 0; i < MATERIAL_COUNT; i++) {
            IMaterials.MaterialView memory material = registry.viewMaterial(i);
            uint256 weight = registry.weight(i);
            
            if (keccak256(bytes(material.tierName)) == keccak256(bytes("Common"))) {
                commonWeight += weight;
            } else if (keccak256(bytes(material.tierName)) == keccak256(bytes("Uncommon"))) {
                uncommonWeight += weight;
            } else if (keccak256(bytes(material.tierName)) == keccak256(bytes("Rare"))) {
                rareWeight += weight;
            } else if (keccak256(bytes(material.tierName)) == keccak256(bytes("Ultra Rare"))) {
                ultraRareWeight += weight;
            } else if (keccak256(bytes(material.tierName)) == keccak256(bytes("Mythic"))) {
                mythicWeight += weight;
            }
        }

        // Verify tier weights match specification (Wood has +900 to reach exact 1e9)
        assertEq(commonWeight, 600_000_900, "Common tier weight incorrect");
        assertEq(uncommonWeight, 350_000_000, "Uncommon tier weight incorrect");
        assertEq(rareWeight, 49_000_000, "Rare tier weight incorrect");
        assertEq(ultraRareWeight, 999_000, "Ultra Rare tier weight incorrect");
        assertEq(mythicWeight, 100, "Mythic tier weight incorrect");
    }

    /**
     * @notice Test weights array function
     */
    function test_WeightsArray() public view {
        uint256[] memory allWeights = registry.getAllWeights();
        assertEq(allWeights.length, MATERIAL_COUNT, "Weights array length incorrect");
        
        // Verify each weight matches individual weight() calls
        for (uint16 i = 0; i < MATERIAL_COUNT; i++) {
            assertEq(allWeights[i], registry.weight(i), "Weight array mismatch");
        }
    }

    /**
     * @notice Test invalid material ID reverts
     */
    function test_InvalidMaterialId() public {
        // Test viewMaterial with invalid ID
        vm.expectRevert("MaterialRegistryPalette: Invalid material ID");
        registry.viewMaterial(24);

        vm.expectRevert("MaterialRegistryPalette: Invalid material ID");
        registry.viewMaterial(100);

        // Test weight with invalid ID
        vm.expectRevert("MaterialRegistryPalette: Invalid material ID");
        registry.weight(24);

        vm.expectRevert("MaterialRegistryPalette: Invalid material ID");
        registry.weight(100);
    }

    /**
     * @notice Test material distribution simulation
     * @dev Simulates 10,000 material selections to verify distribution
     */
    function test_MaterialDistribution() public view {
        uint256 iterations = 10_000;
        uint256[] memory counts = new uint256[](MATERIAL_COUNT);
        
        // Simulate weighted random selection
        for (uint256 i = 0; i < iterations; i++) {
            uint256 randomValue = uint256(keccak256(abi.encodePacked(i))) % EXPECTED_TOTAL_WEIGHT;
            uint256 selectedMaterial = _selectMaterialByWeight(randomValue);
            counts[selectedMaterial]++;
        }
        
        // Verify distribution is roughly proportional to weights
        // Allow for statistical variance in small sample
        for (uint16 i = 0; i < MATERIAL_COUNT; i++) {
            uint256 expectedCount = (registry.weight(i) * iterations) / EXPECTED_TOTAL_WEIGHT;
            uint256 actualCount = counts[i];
            
            // For materials with very low weights, use more lenient testing
            if (expectedCount <= 1) {
                // For ultra-rare materials, just verify they can potentially be selected
                // Skip strict distribution testing for materials with <0.1% probability
                continue;
            }
            
            // Allow larger variance for rare materials, smaller for common ones
            uint256 tolerance = expectedCount >= 100 ? expectedCount / 4 : expectedCount;
            
            assertTrue(
                actualCount >= expectedCount - tolerance && actualCount <= expectedCount + tolerance,
                string(abi.encodePacked("Material ", vm.toString(i), " distribution out of range"))
            );
        }
    }

    /**
     * @notice Helper function to select material by weight (mimics contract logic)
     * @param randomValue Random value from 0 to totalWeight-1
     * @return Selected material ID
     */
    function _selectMaterialByWeight(uint256 randomValue) private view returns (uint256) {
        uint256 cumulativeWeight = 0;
        
        for (uint16 i = 0; i < MATERIAL_COUNT; i++) {
            cumulativeWeight += registry.weight(i);
            if (randomValue < cumulativeWeight) {
                return i;
            }
        }
        
        // Should never reach here if weights sum correctly
        revert("Weight selection failed");
    }
}
