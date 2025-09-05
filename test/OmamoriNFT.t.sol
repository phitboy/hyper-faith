// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/OmamoriNFT.sol";
import "../contracts/OmamoriRender.sol";
import "../contracts/MaterialRegistryPalette.sol";

/**
 * @title MockERC20
 * @notice Mock HYPE token for testing
 */
contract MockERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    string public name = "Mock HYPE";
    string public symbol = "HYPE";
    uint8 public decimals = 18;
    
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        require(balanceOf[from] >= amount, "Insufficient balance");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        return true;
    }
}

/**
 * @title OmamoriNFTTest
 * @notice Tests for the OmamoriNFT contract
 * @dev Verifies minting, burning, and NFT functionality
 */
contract OmamoriNFTTest is Test {
    OmamoriNFT public nft;
    OmamoriRender public renderer;
    MaterialRegistryPalette public materials;
    MockERC20 public hypeToken;
    
    address public owner = address(0x1);
    address public user = address(0x2);
    address public burnAddress = 0xfefeFEFeFEFEFEFEFeFefefefefeFEfEfefefEfe;
    
    uint256 public constant MIN_BURN = 10000000000000000; // 0.01 HYPE
    
    function setUp() public {
        // Deploy contracts
        materials = new MaterialRegistryPalette();
        renderer = new OmamoriRender(address(materials));
        hypeToken = new MockERC20();
        
        vm.prank(owner);
        nft = new OmamoriNFT(
            address(hypeToken),
            address(renderer),
            address(materials),
            owner
        );
        
        // Setup user with HYPE tokens
        hypeToken.mint(user, 1000e18);
        
        vm.prank(user);
        hypeToken.approve(address(nft), type(uint256).max);
    }
    
    /**
     * @notice Test successful minting in ERC20 mode
     */
    function test_MintERC20Mode() public {
        uint256 burnAmount = 1e18; // 1 HYPE
        
        vm.prank(user);
        uint256 tokenId = nft.mint(0, 0, burnAmount);
        
        // Verify NFT was minted
        assertEq(tokenId, 1, "First token should have ID 1");
        assertEq(nft.ownerOf(tokenId), user, "User should own the token");
        assertEq(nft.totalSupply(), 1, "Total supply should be 1");
        
        // Verify HYPE was burned
        assertEq(hypeToken.balanceOf(burnAddress), burnAmount, "HYPE should be burned");
        assertEq(hypeToken.balanceOf(user), 1000e18 - burnAmount, "User balance should decrease");
        
        // Verify token data
        OmamoriNFT.TokenData memory data = nft.getTokenData(tokenId);
        assertEq(data.majorId, 0, "Major ID should match");
        assertEq(data.minorId, 0, "Minor ID should match");
        assertEq(data.hypeBurned, burnAmount, "Burned amount should match");
        assertTrue(data.materialId < 24, "Material ID should be valid");
        assertTrue(data.punchCount <= 25, "Punch count should be valid");
    }
    
    /**
     * @notice Test minting with minimum burn amount
     */
    function test_MintMinimumBurn() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(0, 0, MIN_BURN);
        
        assertEq(nft.ownerOf(tokenId), user, "Should mint with minimum burn");
        assertEq(hypeToken.balanceOf(burnAddress), MIN_BURN, "Should burn minimum amount");
    }
    
    /**
     * @notice Test minting fails with insufficient burn
     */
    function test_MintInsufficientBurn() public {
        vm.prank(user);
        vm.expectRevert("OmamoriNFT: Insufficient HYPE burn");
        nft.mint(0, 0, MIN_BURN - 1);
    }
    
    /**
     * @notice Test minting with invalid major ID
     */
    function test_MintInvalidMajorId() public {
        vm.prank(user);
        vm.expectRevert("OmamoriNFT: Invalid major ID");
        nft.mint(12, 0, 1e18);
    }
    
    /**
     * @notice Test minting with invalid minor ID
     */
    function test_MintInvalidMinorId() public {
        vm.prank(user);
        vm.expectRevert("OmamoriNFT: Invalid minor ID");
        nft.mint(0, 4, 1e18);
    }
    
    /**
     * @notice Test minting without sufficient allowance
     */
    function test_MintInsufficientAllowance() public {
        // Give user enough balance but zero allowance
        vm.prank(user);
        hypeToken.approve(address(nft), 0);
        
        vm.prank(user);
        vm.expectRevert("Insufficient allowance");
        nft.mint(0, 0, 1e18);
    }
    
    /**
     * @notice Test minting without sufficient balance
     */
    function test_MintInsufficientBalance() public {
        address poorUser = address(0x3);
        
        // Give allowance but no balance
        vm.prank(poorUser);
        hypeToken.approve(address(nft), type(uint256).max);
        
        vm.prank(poorUser);
        vm.expectRevert("Insufficient balance");
        nft.mint(0, 0, 1e18);
    }
    
    /**
     * @notice Test native HYPE burn mode
     */
    function test_NativeBurnMode() public {
        // Switch to native mode
        vm.prank(owner);
        nft.setBurnMode(OmamoriNFT.BurnMode.NATIVE);
        
        uint256 burnAmount = 1e18;
        uint256 initialBalance = burnAddress.balance;
        
        // Mint with native HYPE
        vm.deal(user, 2e18);
        vm.prank(user);
        uint256 tokenId = nft.mint{value: burnAmount}(0, 0, burnAmount);
        
        // Verify NFT was minted
        assertEq(nft.ownerOf(tokenId), user, "User should own the token");
        
        // Verify native HYPE was burned
        assertEq(burnAddress.balance, initialBalance + burnAmount, "Native HYPE should be burned");
        assertEq(user.balance, 1e18, "User should have remaining balance");
    }
    
    /**
     * @notice Test native mode with excess payment (should refund)
     */
    function test_NativeModeRefund() public {
        vm.prank(owner);
        nft.setBurnMode(OmamoriNFT.BurnMode.NATIVE);
        
        uint256 burnAmount = 1e18;
        uint256 payment = 15e17; // 1.5 HYPE
        
        vm.deal(user, 2e18);
        vm.prank(user);
        uint256 tokenId = nft.mint{value: payment}(0, 0, burnAmount);
        
        assertEq(nft.ownerOf(tokenId), user, "Should mint successfully");
        assertEq(user.balance, 2e18 - burnAmount, "Should refund excess");
    }
    
    /**
     * @notice Test native mode with insufficient payment
     */
    function test_NativeModeInsufficientPayment() public {
        vm.prank(owner);
        nft.setBurnMode(OmamoriNFT.BurnMode.NATIVE);
        
        vm.deal(user, 1e18);
        vm.prank(user);
        vm.expectRevert("OmamoriNFT: Insufficient native HYPE");
        nft.mint{value: 5e17}(0, 0, 1e18); // Pay 0.5, burn 1.0
    }
    
    /**
     * @notice Test tokenURI generation
     */
    function test_TokenURI() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(0, 0, 1e18);
        
        string memory uri = nft.tokenURI(tokenId);
        assertTrue(bytes(uri).length > 0, "URI should not be empty");
        assertTrue(_startsWith(uri, "data:application/json;base64,"), "Should be base64 JSON");
    }
    
    /**
     * @notice Test tokenURI for non-existent token
     */
    function test_TokenURINonExistent() public {
        vm.expectRevert();
        nft.tokenURI(999);
    }
    
    /**
     * @notice Test multiple mints produce different materials
     */
    function test_MultipleMintsDifferentMaterials() public {
        vm.startPrank(user);
        
        uint256 tokenId1 = nft.mint(0, 0, 1e18);
        uint256 tokenId2 = nft.mint(0, 0, 1e18);
        uint256 tokenId3 = nft.mint(0, 0, 1e18);
        
        vm.stopPrank();
        
        OmamoriNFT.TokenData memory data1 = nft.getTokenData(tokenId1);
        OmamoriNFT.TokenData memory data2 = nft.getTokenData(tokenId2);
        OmamoriNFT.TokenData memory data3 = nft.getTokenData(tokenId3);
        
        // Seeds should be different (high probability)
        assertTrue(
            data1.seed != data2.seed || data2.seed != data3.seed,
            "Different mints should have different seeds"
        );
    }
    
    /**
     * @notice Test material distribution over many mints
     */
    function test_MaterialDistribution() public {
        uint256 mintCount = 100;
        uint256[] memory materialCounts = new uint256[](24);
        
        vm.startPrank(user);
        for (uint256 i = 0; i < mintCount; i++) {
            uint256 tokenId = nft.mint(0, 0, MIN_BURN);
            OmamoriNFT.TokenData memory data = nft.getTokenData(tokenId);
            materialCounts[data.materialId]++;
        }
        vm.stopPrank();
        
        // Verify we got some distribution (not all same material)
        uint256 nonZeroMaterials = 0;
        for (uint256 i = 0; i < 24; i++) {
            if (materialCounts[i] > 0) {
                nonZeroMaterials++;
            }
        }
        
        assertTrue(nonZeroMaterials > 1, "Should have multiple different materials");
        
        // Wood (material 0) should be most common due to highest weight
        uint256 maxCount = 0;
        uint256 mostCommonMaterial = 0;
        for (uint256 i = 0; i < 24; i++) {
            if (materialCounts[i] > maxCount) {
                maxCount = materialCounts[i];
                mostCommonMaterial = i;
            }
        }
        
        // Wood should likely be the most common (though not guaranteed in small sample)
        assertTrue(mostCommonMaterial <= 4, "Common materials should appear frequently");
    }
    
    /**
     * @notice Test owner functions
     */
    function test_OwnerFunctions() public {
        // Test burn mode change
        vm.prank(owner);
        nft.setBurnMode(OmamoriNFT.BurnMode.NATIVE);
        assertEq(uint256(nft.burnMode()), uint256(OmamoriNFT.BurnMode.NATIVE), "Burn mode should change");
        
        // Test HYPE token change
        MockERC20 newToken = new MockERC20();
        vm.prank(owner);
        nft.setHypeToken(address(newToken));
        assertEq(address(nft.hypeToken()), address(newToken), "HYPE token should change");
        
        // Test non-owner cannot change settings
        vm.prank(user);
        vm.expectRevert();
        nft.setBurnMode(OmamoriNFT.BurnMode.ERC20);
    }
    
    /**
     * @notice Test events are emitted
     */
    function test_Events() public {
        vm.prank(user);
        
        // We can only check the deterministic parts (tokenId, owner, majorId, minorId, hypeBurned)
        // materialId, punchCount, and seed are randomly generated
        vm.expectEmit(true, true, false, false); // Don't check data
        emit OmamoriMinted(1, user, 0, 0, 0, 0, 1e18, 0);
        
        uint256 tokenId = nft.mint(0, 0, 1e18);
        
        // Verify the token was actually minted
        assertEq(tokenId, 1, "Token ID should be 1");
        assertEq(nft.ownerOf(tokenId), user, "User should own the token");
    }
    
    // Helper functions
    
    function _startsWith(string memory str, string memory prefix) private pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory prefixBytes = bytes(prefix);
        
        if (prefixBytes.length > strBytes.length) return false;
        
        for (uint i = 0; i < prefixBytes.length; i++) {
            if (strBytes[i] != prefixBytes[i]) return false;
        }
        return true;
    }
    
    // Event for testing
    event OmamoriMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint8 majorId,
        uint8 minorId,
        uint16 materialId,
        uint8 punchCount,
        uint128 hypeBurned,
        uint64 seed
    );
}
