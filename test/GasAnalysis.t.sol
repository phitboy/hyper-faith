// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/MaterialRegistryPalette.sol";

/**
 * @title GasAnalysisTest
 * @notice Test contract to analyze gas costs for material initialization
 */
contract GasAnalysisTest is Test {
    
    function test_MaterialInitializationGasCosts() public {
        // Test different numbers of materials to calculate per-material cost
        
        // Deploy with 1 material (baseline)
        uint256 gasBefore1 = gasleft();
        TestMaterialRegistry1 registry1 = new TestMaterialRegistry1();
        uint256 gasUsed1 = gasBefore1 - gasleft();
        
        // Deploy with 5 materials
        uint256 gasBefore5 = gasleft();
        TestMaterialRegistry5 registry5 = new TestMaterialRegistry5();
        uint256 gasUsed5 = gasBefore5 - gasleft();
        
        // Deploy with 10 materials
        uint256 gasBefore10 = gasleft();
        TestMaterialRegistry10 registry10 = new TestMaterialRegistry10();
        uint256 gasUsed10 = gasBefore10 - gasleft();
        
        console.log("Gas for 1 material:", gasUsed1);
        console.log("Gas for 5 materials:", gasUsed5);
        console.log("Gas for 10 materials:", gasUsed10);
        
        // Calculate per-material gas cost
        uint256 perMaterialCost = (gasUsed5 - gasUsed1) / 4;
        console.log("Estimated gas per material:", perMaterialCost);
        
        // Calculate how many materials fit in 2M gas
        uint256 baseGas = gasUsed1;
        uint256 availableGas = 2_000_000 - baseGas;
        uint256 maxMaterials = availableGas / perMaterialCost;
        
        console.log("Base contract gas:", baseGas);
        console.log("Available gas for materials:", availableGas);
        console.log("Max materials in 2M gas:", maxMaterials);
        
        // Verify registries work
        require(registry1.totalWeight() == 1_000_000_000, "Registry1 weight incorrect");
        require(registry5.totalWeight() == 1_000_000_000, "Registry5 weight incorrect");
        require(registry10.totalWeight() == 1_000_000_000, "Registry10 weight incorrect");
    }
}

contract TestMaterialRegistry1 {
    uint256 public constant TOTAL_WEIGHT = 1_000_000_000;
    mapping(uint16 => string) private materialNames;
    mapping(uint16 => uint256) private weights;
    
    constructor() {
        materialNames[0] = "Wood";
        weights[0] = 1_000_000_000;
    }
    
    function totalWeight() external pure returns (uint256) {
        return TOTAL_WEIGHT;
    }
}

contract TestMaterialRegistry5 {
    uint256 public constant TOTAL_WEIGHT = 1_000_000_000;
    mapping(uint16 => string) private materialNames;
    mapping(uint16 => uint256) private weights;
    
    constructor() {
        materialNames[0] = "Wood";
        weights[0] = 300_000_000;
        materialNames[1] = "Cloth";
        weights[1] = 200_000_000;
        materialNames[2] = "Paper";
        weights[2] = 200_000_000;
        materialNames[3] = "Clay";
        weights[3] = 150_000_000;
        materialNames[4] = "Limestone";
        weights[4] = 150_000_000;
    }
    
    function totalWeight() external pure returns (uint256) {
        return TOTAL_WEIGHT;
    }
}

contract TestMaterialRegistry10 {
    uint256 public constant TOTAL_WEIGHT = 1_000_000_000;
    mapping(uint16 => string) private materialNames;
    mapping(uint16 => uint256) private weights;
    
    constructor() {
        materialNames[0] = "Wood";
        weights[0] = 300_000_000;
        materialNames[1] = "Cloth";
        weights[1] = 100_000_000;
        materialNames[2] = "Paper";
        weights[2] = 100_000_000;
        materialNames[3] = "Clay";
        weights[3] = 100_000_000;
        materialNames[4] = "Limestone";
        weights[4] = 100_000_000;
        materialNames[5] = "Slate";
        weights[5] = 100_000_000;
        materialNames[6] = "Basalt";
        weights[6] = 80_000_000;
        materialNames[7] = "Granite";
        weights[7] = 80_000_000;
        materialNames[8] = "Marble";
        weights[8] = 80_000_000;
        materialNames[9] = "Bronze";
        weights[9] = 60_000_000;
    }
    
    function totalWeight() external pure returns (uint256) {
        return TOTAL_WEIGHT;
    }
}
