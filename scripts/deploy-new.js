const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying New Omamori NFT Contract...\n");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");
    
    // Configuration
    const initialOwner = deployer.address; // Can be changed later
    const royaltyRecipient = deployer.address; // Can be changed later
    const baseTokenURI = "https://your-metadata-service.com/metadata/"; // Will be updated
    
    console.log("Configuration:");
    console.log("- Initial Owner:", initialOwner);
    console.log("- Royalty Recipient:", royaltyRecipient);
    console.log("- Base Token URI:", baseTokenURI);
    console.log();
    
    // Deploy contract
    const OmamoriNFT = await ethers.getContractFactory("OmamoriNFT");
    const omamoriNFT = await OmamoriNFT.deploy(
        initialOwner,
        royaltyRecipient,
        baseTokenURI
    );
    
    await omamoriNFT.deployed();
    
    console.log("✅ Contract deployed successfully!");
    console.log("📍 Contract Address:", omamoriNFT.address);
    console.log("🔗 Transaction Hash:", omamoriNFT.deployTransaction.hash);
    console.log();
    
    // Verify deployment
    console.log("🔍 Verifying deployment...");
    const name = await omamoriNFT.name();
    const symbol = await omamoriNFT.symbol();
    const owner = await omamoriNFT.owner();
    const minBurn = await omamoriNFT.MIN_BURN();
    
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Owner:", owner);
    console.log("- Min Burn:", ethers.utils.formatEther(minBurn), "HYPE");
    console.log();
    
    console.log("🎉 Deployment Complete!");
    console.log();
    console.log("📋 Next Steps:");
    console.log("1. Set up metadata service");
    console.log("2. Update baseTokenURI with: omamoriNFT.setBaseURI()");
    console.log("3. Test minting functionality");
    console.log("4. Update frontend contract address");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
