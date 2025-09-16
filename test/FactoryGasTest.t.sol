// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/MaterialRegistryFactory.sol";

contract FactoryGasTest is Test {
    
    function test_FactoryDeploymentGas() public {
        console.log("=== Factory Pattern Gas Test ===");
        
        // Test factory deployment
        uint256 gasBefore = gasleft();
        MaterialRegistryFactory factory = new MaterialRegistryFactory(address(this));
        uint256 deploymentGas = gasBefore - gasleft();
        
        console.log("Factory deployment gas:", deploymentGas);
        console.log("Fits in 2M gas limit:", deploymentGas < 2_000_000);
        
        // Test batch initialization
        gasBefore = gasleft();
        factory.initializeBatch(0, 5); // First 5 materials
        uint256 batch1Gas = gasBefore - gasleft();
        
        gasBefore = gasleft();
        factory.initializeBatch(5, 10); // Next 5 materials
        uint256 batch2Gas = gasBefore - gasleft();
        
        gasBefore = gasleft();
        factory.initializeBatch(10, 15); // Next 5 materials
        uint256 batch3Gas = gasBefore - gasleft();
        
        gasBefore = gasleft();
        factory.initializeBatch(15, 20); // Next 5 materials
        uint256 batch4Gas = gasBefore - gasleft();
        
        gasBefore = gasleft();
        factory.initializeBatch(20, 24); // Last 4 materials
        uint256 batch5Gas = gasBefore - gasleft();
        
        console.log("Batch 1 gas (materials 0-4):", batch1Gas);
        console.log("Batch 2 gas (materials 5-9):", batch2Gas);
        console.log("Batch 3 gas (materials 10-14):", batch3Gas);
        console.log("Batch 4 gas (materials 15-19):", batch4Gas);
        console.log("Batch 5 gas (materials 20-23):", batch5Gas);
        
        // Finalize initialization
        gasBefore = gasleft();
        factory.finalizeInitialization();
        uint256 finalizeGas = gasBefore - gasleft();
        
        console.log("Finalization gas:", finalizeGas);
        
        uint256 totalInitGas = batch1Gas + batch2Gas + batch3Gas + batch4Gas + batch5Gas + finalizeGas;
        console.log("Total initialization gas:", totalInitGas);
        console.log("Total system gas:", deploymentGas + totalInitGas);
        
        // Test functionality
        require(factory.initialized(), "Factory not initialized");
        require(factory.totalWeight() == 1_000_000_000, "Incorrect total weight");
        
        IMaterials.MaterialView memory material = factory.viewMaterial(0);
        console.log("Material 0 name:", material.name);
        require(keccak256(bytes(material.name)) == keccak256(bytes("Wood")), "Incorrect material name");
        
        console.log("Factory pattern works correctly!");
    }
}
