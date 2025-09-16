// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/OmamoriNFTWithRoyalties.sol";

contract DeployRoyaltyNFT is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        address initialOwner = vm.envAddress("INITIAL_OWNER");
        uint256 deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyStr)));
        
        // Royalty recipient address
        address royaltyRecipient = 0xe0BCe28D5B5c50F44F9BB93dfcE9D5A601F5605D;
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=== DEPLOYING OMAMORI NFT WITH ROYALTIES ===");
        console.log("Initial owner:", initialOwner);
        console.log("Royalty recipient:", royaltyRecipient);
        console.log("Royalty percentage: 5%");
        console.log("");
        
        OmamoriNFTWithRoyalties omamoriNFT = new OmamoriNFTWithRoyalties(
            initialOwner,
            royaltyRecipient
        );
        
        console.log("OmamoriNFTWithRoyalties deployed at:", address(omamoriNFT));
        
        // Verify royalty configuration
        console.log("");
        console.log("=== ROYALTY VERIFICATION ===");
        console.log("Configured recipient:", omamoriNFT.royaltyRecipient());
        console.log("Configured basis points:", omamoriNFT.royaltyBasisPoints());
        
        // Test royalty calculation
        (address receiver, uint256 royaltyAmount) = omamoriNFT.royaltyInfo(1, 1 ether);
        console.log("For 1 ETH sale:");
        console.log("  Royalty goes to:", receiver);
        console.log("  Royalty amount:", royaltyAmount / 1e15, "milli-ETH");
        
        // Verify interface support
        bool supportsRoyalties = omamoriNFT.supportsInterface(type(IERC2981).interfaceId);
        console.log("EIP-2981 support:", supportsRoyalties);
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("Contract Address:", address(omamoriNFT));
        console.log("Owner:", initialOwner);
        console.log("Royalty Recipient:", royaltyRecipient);
        console.log("Royalty Rate: 5%");
        console.log("");
        console.log("Next steps:");
        console.log("1. Connect to SVG rendering system");
        console.log("2. Test minting functionality");
        console.log("3. Verify marketplace royalty detection");
        console.log("");
        console.log("READY FOR MARKETPLACE INTEGRATION!");
    }
}
