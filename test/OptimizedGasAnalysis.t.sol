// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/MaterialRegistryPalette.sol";
import "../contracts/MaterialRegistryPaletteOptimized.sol";

/**
 * @title OptimizedGasAnalysisTest
 * @notice Compare gas usage between original and optimized MaterialRegistryPalette
 */
contract OptimizedGasAnalysisTest is Test {
    
    function test_CompareGasUsage() public {
        console.log("=== Gas Usage Comparison ===");
        
        // Test original contract
        uint256 gasBefore = gasleft();
        MaterialRegistryPalette original = new MaterialRegistryPalette();
        uint256 originalGas = gasBefore - gasleft();
        
        // Test optimized contract
        gasBefore = gasleft();
        MaterialRegistryPaletteOptimized optimized = new MaterialRegistryPaletteOptimized();
        uint256 optimizedGas = gasBefore - gasleft();
        
        console.log("Original contract gas:", originalGas);
        console.log("Optimized contract gas:", optimizedGas);
        console.log("Gas savings:", originalGas - optimizedGas);
        console.log("Savings percentage:", ((originalGas - optimizedGas) * 100) / originalGas);
        
        // Verify both contracts work correctly
        require(original.totalWeight() == 1_000_000_000, "Original total weight incorrect");
        require(optimized.totalWeight() == 1_000_000_000, "Optimized total weight incorrect");
        
        // Test material access
        IMaterials.MaterialView memory originalMaterial = original.viewMaterial(0);
        IMaterials.MaterialView memory optimizedMaterial = optimized.viewMaterial(0);
        
        console.log("Original material 0 name:", originalMaterial.name);
        console.log("Optimized material 0 name:", optimizedMaterial.name);
        
        // Verify they return the same data
        require(
            keccak256(bytes(originalMaterial.name)) == keccak256(bytes(optimizedMaterial.name)),
            "Material names don't match"
        );
        require(
            keccak256(bytes(originalMaterial.tierName)) == keccak256(bytes(optimizedMaterial.tierName)),
            "Tier names don't match"
        );
        require(
            keccak256(bytes(originalMaterial.bg)) == keccak256(bytes(optimizedMaterial.bg)),
            "Background colors don't match"
        );
        require(
            keccak256(bytes(originalMaterial.stroke)) == keccak256(bytes(optimizedMaterial.stroke)),
            "Stroke colors don't match"
        );
        
        // Test weights
        require(original.weight(0) == optimized.weight(0), "Weights don't match");
        
        console.log("All functionality tests passed");
        console.log("Optimized contract fits in 2M gas:", optimizedGas < 2_000_000);
    }
    
    function test_AllMaterialsOptimized() public {
        MaterialRegistryPaletteOptimized optimized = new MaterialRegistryPaletteOptimized();
        
        console.log("=== Testing All 24 Materials ===");
        
        uint256 totalWeight = 0;
        for (uint16 i = 0; i < 24; i++) {
            IMaterials.MaterialView memory material = optimized.viewMaterial(i);
            uint256 weight = optimized.weight(i);
            totalWeight += weight;
            
            console.log("Material", i, material.name, weight);
            
            // Verify no empty strings
            require(bytes(material.name).length > 0, "Empty material name");
            require(bytes(material.tierName).length > 0, "Empty tier name");
            require(bytes(material.bg).length > 0, "Empty bg color");
            require(bytes(material.stroke).length > 0, "Empty stroke color");
        }
        
        console.log("Total weight:", totalWeight);
        require(totalWeight == 1_000_000_000, "Total weight incorrect");
        
        console.log("All 24 materials working correctly");
    }
}
