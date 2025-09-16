// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IMaterials.sol";

/**
 * @title MaterialRegistryFactory
 * @notice Factory pattern for deploying MaterialRegistry with post-deployment initialization
 * @dev Splits deployment and initialization to fit within HyperEVM 2M gas block limit
 * @author Hyper Faith Team
 */
contract MaterialRegistryFactory is IMaterials {
    /// @notice Total weight across all materials (exactly 1 billion)
    uint256 public constant TOTAL_WEIGHT = 1_000_000_000;
    
    /// @notice Number of materials in the palette
    uint256 public constant MATERIAL_COUNT = 24;

    /// @notice Whether the registry has been initialized
    bool public initialized;
    
    /// @notice Owner who can initialize the registry
    address public owner;

    /// @notice Efficient storage for material data
    mapping(uint16 => uint256) private weights;
    mapping(uint16 => bytes32) private materialNames;
    mapping(uint16 => bytes32) private tierNames;
    mapping(uint16 => bytes32) private bgColors;
    mapping(uint16 => bytes32) private strokeColors;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyInitialized() {
        require(initialized, "Not initialized");
        _;
    }

    /**
     * @notice Deploy empty registry - initialization happens post-deployment
     * @param _owner Address that can initialize the registry
     */
    constructor(address _owner) {
        owner = _owner;
    }

    /**
     * @notice Initialize materials in batches to stay within gas limits
     * @param startId Starting material ID
     * @param endId Ending material ID (exclusive)
     */
    function initializeBatch(uint16 startId, uint16 endId) external onlyOwner {
        require(!initialized, "Already initialized");
        require(startId < endId && endId <= MATERIAL_COUNT, "Invalid range");
        
        for (uint16 i = startId; i < endId; i++) {
            _initializeMaterial(i);
        }
    }

    /**
     * @notice Finalize initialization after all batches are complete
     */
    function finalizeInitialization() external onlyOwner {
        require(!initialized, "Already initialized");
        
        // Verify all materials are set
        uint256 totalWeight = 0;
        for (uint16 i = 0; i < MATERIAL_COUNT; i++) {
            require(weights[i] > 0, "Material not initialized");
            totalWeight += weights[i];
        }
        require(totalWeight == TOTAL_WEIGHT, "Incorrect total weight");
        
        initialized = true;
    }

    /**
     * @inheritdoc IMaterials
     */
    function viewMaterial(uint16 id) external view onlyInitialized returns (MaterialView memory) {
        require(id < MATERIAL_COUNT, "Invalid material ID");
        
        return MaterialView({
            name: _bytes32ToString(materialNames[id]),
            tierName: _bytes32ToString(tierNames[id]),
            bg: _bytes32ToString(bgColors[id]),
            stroke: _bytes32ToString(strokeColors[id])
        });
    }

    /**
     * @inheritdoc IMaterials
     */
    function weight(uint16 id) external view onlyInitialized returns (uint256) {
        require(id < MATERIAL_COUNT, "Invalid material ID");
        return weights[id];
    }

    /**
     * @inheritdoc IMaterials
     */
    function totalWeight() external pure returns (uint256) {
        return TOTAL_WEIGHT;
    }

    /**
     * @notice Initialize a specific material
     * @param id Material ID to initialize
     */
    function _initializeMaterial(uint16 id) private {
        if (id == 0) {
            _setMaterial(id, "Wood", "Common", "#b78c55", "#6b4e2e", 300_000_900);
        } else if (id == 1) {
            _setMaterial(id, "Cloth", "Common", "#d9cbb2", "#7a6f60", 100_000_000);
        } else if (id == 2) {
            _setMaterial(id, "Paper", "Common", "#efe6d3", "#8b8373", 100_000_000);
        } else if (id == 3) {
            _setMaterial(id, "Clay", "Common", "#b0643a", "#6a3d26", 50_000_000);
        } else if (id == 4) {
            _setMaterial(id, "Limestone", "Common", "#cfc8b7", "#6f6a5c", 50_000_000);
        } else if (id == 5) {
            _setMaterial(id, "Slate", "Uncommon", "#4b4f59", "#b8bdc9", 100_000_000);
        } else if (id == 6) {
            _setMaterial(id, "Basalt", "Uncommon", "#3e3b3a", "#b3ada9", 80_000_000);
        } else if (id == 7) {
            _setMaterial(id, "Granite", "Uncommon", "#8b8e95", "#2e3138", 80_000_000);
        } else if (id == 8) {
            _setMaterial(id, "Marble", "Uncommon", "#e6e6ea", "#6e6e78", 40_000_000);
        } else if (id == 9) {
            _setMaterial(id, "Bronze", "Uncommon", "#8c6e3d", "#f1c277", 30_000_000);
        } else if (id == 10) {
            _setMaterial(id, "Obsidian", "Uncommon", "#111216", "#8f8f99", 20_000_000);
        } else if (id == 11) {
            _setMaterial(id, "Silver", "Rare", "#c0c0c0", "#5b5b5b", 15_000_000);
        } else if (id == 12) {
            _setMaterial(id, "Jade", "Rare", "#2f6e5b", "#a7e0cc", 10_000_000);
        } else if (id == 13) {
            _setMaterial(id, "Crystal", "Rare", "#e8f2ff", "#7aa0c8", 10_000_000);
        } else if (id == 14) {
            _setMaterial(id, "Onyx", "Rare", "#1a1a1a", "#9c9c9c", 7_000_000);
        } else if (id == 15) {
            _setMaterial(id, "Amber", "Rare", "#c37a3a", "#ffd08a", 7_000_000);
        } else if (id == 16) {
            _setMaterial(id, "Amethyst", "Ultra Rare", "#5d3b8a", "#c8b1ff", 400_000);
        } else if (id == 17) {
            _setMaterial(id, "Opal", "Ultra Rare", "#d9ecff", "#9fd5ff", 200_000);
        } else if (id == 18) {
            _setMaterial(id, "Emerald", "Ultra Rare", "#1f7a44", "#9af0bf", 150_000);
        } else if (id == 19) {
            _setMaterial(id, "Sapphire", "Ultra Rare", "#143a8a", "#88b0ff", 120_000);
        } else if (id == 20) {
            _setMaterial(id, "Ruby", "Ultra Rare", "#8a1423", "#ff98a6", 80_000);
        } else if (id == 21) {
            _setMaterial(id, "Lapis Lazuli", "Ultra Rare", "#1b3b8a", "#c0d0ff", 49_000);
        } else if (id == 22) {
            _setMaterial(id, "Gold", "Mythic", "#d4af37", "#5a4b10", 50);
        } else if (id == 23) {
            _setMaterial(id, "Meteorite", "Mythic", "#5a5752", "#d7d3cc", 50);
        }
    }

    /**
     * @notice Set material data using efficient storage
     */
    function _setMaterial(
        uint16 id,
        string memory name,
        string memory tier,
        string memory bg,
        string memory stroke,
        uint256 materialWeight
    ) private {
        materialNames[id] = _stringToBytes32(name);
        tierNames[id] = _stringToBytes32(tier);
        bgColors[id] = _stringToBytes32(bg);
        strokeColors[id] = _stringToBytes32(stroke);
        weights[id] = materialWeight;
    }

    /**
     * @notice Convert string to bytes32 for efficient storage
     */
    function _stringToBytes32(string memory str) private pure returns (bytes32) {
        bytes memory strBytes = bytes(str);
        require(strBytes.length <= 32, "String too long");
        
        bytes32 result;
        assembly {
            result := mload(add(strBytes, 32))
        }
        return result;
    }

    /**
     * @notice Convert bytes32 back to string
     */
    function _bytes32ToString(bytes32 data) private pure returns (string memory) {
        uint256 length = 0;
        for (uint256 i = 0; i < 32; i++) {
            if (data[i] != 0) {
                length++;
            } else {
                break;
            }
        }
        
        bytes memory result = new bytes(length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = data[i];
        }
        
        return string(result);
    }
}
