// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/GlyphRenderer.sol";
import "../contracts/PunchRenderer.sol";
import "../contracts/SVGAssembler.sol";
import "../contracts/OmamoriNFTMulti.sol";

/**
 * @title DeployMultiContract
 * @notice Deploy complete multi-contract Omamori system to HyperEVM
 * @dev Sequential deployment with proper address linking
 */
contract DeployMultiContract is Script {
    
    function run() external {
        // Get deployment parameters
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        address initialOwner = vm.envAddress("INITIAL_OWNER");
        
        // Parse private key
        uint256 deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyStr)));
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=== DEPLOYING MULTI-CONTRACT OMAMORI SYSTEM ===");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Initial Owner:", initialOwner);
        console.log("");
        
        // Step 1: Deploy GlyphRenderer
        console.log("1. Deploying GlyphRenderer...");
        GlyphRenderer glyphRenderer = new GlyphRenderer();
        console.log("   GlyphRenderer deployed at:", address(glyphRenderer));
        console.log("");
        
        // Step 2: Deploy PunchRenderer
        console.log("2. Deploying PunchRenderer...");
        PunchRenderer punchRenderer = new PunchRenderer();
        console.log("   PunchRenderer deployed at:", address(punchRenderer));
        console.log("");
        
        // Step 3: Deploy SVGAssembler
        console.log("3. Deploying SVGAssembler...");
        SVGAssembler svgAssembler = new SVGAssembler(
            address(glyphRenderer),
            address(punchRenderer)
        );
        console.log("   SVGAssembler deployed at:", address(svgAssembler));
        console.log("");
        
        // Step 4: Deploy OmamoriNFT
        console.log("4. Deploying OmamoriNFT...");
        OmamoriNFT omamoriNFT = new OmamoriNFT(initialOwner);
        console.log("   OmamoriNFT deployed at:", address(omamoriNFT));
        console.log("");
        
        // Step 5: Connect the system
        console.log("5. Connecting system components...");
        
        // Set renderers in NFT contract
        omamoriNFT.setRenderers(
            address(glyphRenderer),
            address(punchRenderer),
            address(svgAssembler)
        );
        console.log("   Renderers set in OmamoriNFT");
        
        // Transfer ownership if needed
        if (initialOwner != vm.addr(deployerPrivateKey)) {
            omamoriNFT.transferOwnership(initialOwner);
            console.log("   Ownership transferred to:", initialOwner);
        }
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("MaterialRegistry (already deployed): 0xA5D308DE0Be64df79C6715418070a090195A5657");
        console.log("GlyphRenderer:", address(glyphRenderer));
        console.log("PunchRenderer:", address(punchRenderer));
        console.log("SVGAssembler:", address(svgAssembler));
        console.log("OmamoriNFT:", address(omamoriNFT));
        console.log("");
        console.log("System is ready for minting!");
        console.log("Minimum HYPE burn: 0.01 HYPE");
        console.log("");
        
        // Test basic functionality
        console.log("=== TESTING SYSTEM ===");
        
        // Test glyph rendering
        string memory majorGlyph = glyphRenderer.renderMajor(0);
        console.log("Major glyph test (length):", bytes(majorGlyph).length);
        
        // Test punch rendering
        string memory punches = punchRenderer.renderPunches(12345, 5);
        console.log("Punch test (length):", bytes(punches).length);
        
        console.log("All tests passed!");
    }
}
