import { generateSeed, pickMaterial, getPunchCount } from '../utils/materialPicker';
import { renderOmamoriSVG } from '../renderer/omamoriSvg';

export type MintArgs = {
  majorId: number; // 0..11
  minorId: number; // 0..3
  offeringHype: string; // wei string
  to?: `0x${string}`; // defaults to signer
};

export type OmamoriToken = {
  tokenId: number;
  majorId: number;
  minorId: number;
  materialId: number;
  materialName: string;
  materialTier: 'Common' | 'Uncommon' | 'Rare' | 'Ultra Rare' | 'Mythic';
  punchCount: number; // 0..25
  hypeBurned: string; // wei string
  seed: string;
  imageSvg: string;  // from renderer
  mintedAt: number;
};

// Mock storage - in real app this would be blockchain state
let mockTokenId = 1;
const mockTokens: OmamoriToken[] = [];

/**
 * Mock mint function - simulates on-chain minting
 */
export async function mintOmamoriMock(args: MintArgs): Promise<OmamoriToken> {
  const { majorId, minorId, offeringHype } = args;
  
  // Validate HYPE amount (minimum 0.01 HYPE in wei)
  const minHype = BigInt('10000000000000000'); // 0.01 HYPE in wei
  const hypeAmount = BigInt(offeringHype);
  
  if (hypeAmount < minHype) {
    throw new Error('Minimum HYPE offering is 0.01');
  }
  
  // Generate deterministic seed from mint parameters
  const seed = generateSeed();
  
  // Pick material and punch count based on seed
  const material = pickMaterial(seed);
  const punchCount = getPunchCount(seed);
  
  // Create token
  const token: OmamoriToken = {
    tokenId: mockTokenId++,
    majorId,
    minorId,
    materialId: material.id,
    materialName: material.name,
    materialTier: material.tier as any,
    punchCount,
    hypeBurned: offeringHype,
    seed,
    imageSvg: '',
    mintedAt: Date.now()
  };
  
  // Generate SVG
  token.imageSvg = renderOmamoriSVG(token);
  
  // Store mock token
  mockTokens.push(token);
  
  return token;
}

/**
 * Get user's minted tokens (mock)
 */
export async function getMyOmamoriMock(address?: `0x${string}`): Promise<OmamoriToken[]> {
  // In real implementation, this would filter by owner address
  // For now, return all mock tokens
  return [...mockTokens].reverse(); // Most recent first
}

/**
 * Get all tokens for exploration (mock)
 */
export async function getAllOmamoriMock(): Promise<OmamoriToken[]> {
  // Include pre-seeded examples + user mints
  const seededTokens = generateSeededTokens();
  return [...seededTokens, ...mockTokens].reverse();
}

/**
 * Get specific token by ID (mock)
 */
export async function getTokenByIdMock(tokenId: number): Promise<OmamoriToken | null> {
  const seededTokens = generateSeededTokens();
  const allTokens = [...seededTokens, ...mockTokens];
  return allTokens.find(t => t.tokenId === tokenId) || null;
}

// Future real implementation stubs
export async function mintOmamoriOnChain(args: MintArgs): Promise<`0x${string}`> {
  throw new Error('Real on-chain minting not implemented yet');
}

export async function readTokenMetadataOnChain(tokenId: number): Promise<OmamoriToken> {
  throw new Error('Real on-chain reading not implemented yet');
}

/**
 * Generate pre-seeded example tokens for /explore
 */
function generateSeededTokens(): OmamoriToken[] {
  const examples: OmamoriToken[] = [];
  
  // Generate 60 example tokens with interesting combinations
  for (let i = 1000; i < 1060; i++) {
    const majorId = i % 12;
    const minorId = (i * 7) % 4; // Mix up the minors
    const seed = `example_${i}`;
    const material = pickMaterial(seed);
    const punchCount = getPunchCount(seed);
    
    // Vary HYPE amounts for interesting display
    const baseHype = BigInt('10000000000000000'); // 0.01 HYPE
    const multiplier = BigInt(Math.floor(Math.random() * 100) + 1); // 1-100x
    const hypeBurned = (baseHype * multiplier).toString();
    
    const token: OmamoriToken = {
      tokenId: i,
      majorId,
      minorId,
      materialId: material.id,
      materialName: material.name,
      materialTier: material.tier as any,
      punchCount,
      hypeBurned,
      seed,
      imageSvg: '',
      mintedAt: Date.now() - (60 - (i - 1000)) * 60000 // Spread over last hour
    };
    
    token.imageSvg = renderOmamoriSVG(token);
    examples.push(token);
  }
  
  return examples;
}