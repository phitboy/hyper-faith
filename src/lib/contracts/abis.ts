/**
 * Contract ABIs for Omamori NFT system
 * These are the essential functions we need for the frontend
 */

export const OmamoriNFTSecureABI = [
  // Read functions
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getTokenData",
    outputs: [
      { name: "seed", type: "uint64" },
      { name: "materialId", type: "uint16" },
      { name: "majorId", type: "uint8" },
      { name: "minorId", type: "uint8" },
      { name: "punchCount", type: "uint8" },
      { name: "hypeBurned", type: "uint120" }
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "royaltyRecipient",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "royaltyBasisPoints",
    outputs: [{ name: "", type: "uint96" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "", type: "uint256" },
      { name: "salePrice", type: "uint256" }
    ],
    name: "royaltyInfo",
    outputs: [
      { name: "receiver", type: "address" },
      { name: "royaltyAmount", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [
      { name: "majorId", type: "uint8" },
      { name: "minorId", type: "uint8" }
    ],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  // Events
  {
    inputs: [
      { indexed: true, name: "burner", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: false, name: "amount", type: "uint256" }
    ],
    name: "HypeBurned",
    type: "event",
    anonymous: false,
  },
] as const

export const OmamoriNFTWithRoyaltiesABI = [
  // Read functions
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }, { name: "index", type: "uint256" }],
    name: "tokenOfOwnerByIndex",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getTokenData",
    outputs: [
      { name: "seed", type: "uint64" },
      { name: "materialId", type: "uint16" },
      { name: "majorId", type: "uint8" },
      { name: "minorId", type: "uint8" },
      { name: "punchCount", type: "uint8" },
      { name: "hypeBurned", type: "uint120" }
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [
      { name: "majorId", type: "uint8" },
      { name: "minorId", type: "uint8" }
    ],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" }
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "burner", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: false, name: "amount", type: "uint256" }
    ],
    name: "HypeBurned",
    type: "event",
  },
] as const

export const OmamoriNFTSingleABI = [
  // Read functions
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getTokenData",
    outputs: [
      { name: "seed", type: "uint64" },
      { name: "materialId", type: "uint16" },
      { name: "majorId", type: "uint8" },
      { name: "minorId", type: "uint8" },
      { name: "punchCount", type: "uint8" },
      { name: "hypeBurned", type: "uint120" }
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "id", type: "uint16" }],
    name: "getMaterialName",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ name: "id", type: "uint16" }],
    name: "getMaterialTier",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "royaltyRecipient",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "royaltyBasisPoints",
    outputs: [{ name: "", type: "uint96" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "", type: "uint256" },
      { name: "salePrice", type: "uint256" }
    ],
    name: "royaltyInfo",
    outputs: [
      { name: "receiver", type: "address" },
      { name: "royaltyAmount", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [
      { name: "majorId", type: "uint8" },
      { name: "minorId", type: "uint8" }
    ],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  // Events
  {
    inputs: [
      { indexed: true, name: "burner", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: false, name: "amount", type: "uint256" }
    ],
    name: "HypeBurned",
    type: "event",
    anonymous: false,
  },
] as const

// OmamoriNFTOffChain uses the same ABI as OmamoriNFTSingle
export const OmamoriNFTOffChainABI = OmamoriNFTSingleABI

export const MaterialRegistryABI = [
  {
    inputs: [{ name: "id", type: "uint16" }],
    name: "viewMaterial",
    outputs: [
      {
        components: [
          { name: "name", type: "string" },
          { name: "tierName", type: "string" },
          { name: "bg", type: "string" },
          { name: "stroke", type: "string" }
        ],
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "seed", type: "uint64" }],
    name: "selectMaterial",
    outputs: [{ name: "", type: "uint16" }],
    stateMutability: "view",
    type: "function",
  },
] as const
