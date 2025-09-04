/**
 * Utilities for parsing on-chain tokenURI metadata
 */

export interface TokenMetadata {
  image: string; // "data:image/svg+xml;base64,..."
  materialName: string;
  tier: string;
  major: string;
  minor: string;
  punchCount: number;
  hypeBurned: string;
  [key: string]: any; // For additional attributes
}

/**
 * Parse tokenURI JSON and extract structured metadata
 */
export function parseTokenURI(tokenURI: string): TokenMetadata {
  try {
    // Handle data:application/json;base64,... format
    let jsonString: string;
    
    if (tokenURI.startsWith('data:application/json;base64,')) {
      const base64 = tokenURI.split(',')[1];
      if (!base64) throw new Error('Invalid tokenURI format');
      jsonString = atob(base64); // Use native browser atob
    } else if (tokenURI.startsWith('{')) {
      // Already JSON string
      jsonString = tokenURI;
    } else {
      throw new Error('Unsupported tokenURI format');
    }
    
    const json = JSON.parse(jsonString);
    
    // Extract attributes into a map
    const attrs = Object.fromEntries(
      (json.attributes as Array<{trait_type: string, value: string | number}>)
        ?.map(a => [a.trait_type, a.value]) || []
    );
    
    return {
      image: json.image || '',
      materialName: String(attrs['Material'] || '—'),
      tier: String(attrs['Rarity Tier'] || '—'), 
      major: String(attrs['Major'] || '—'),
      minor: String(attrs['Minor'] || '—'),
      punchCount: Number(attrs['Punch Count']) || 0,
      hypeBurned: String(attrs['HYPE Burned']) || '0',
      // Spread all attributes for additional access
      ...attrs
    };
    
  } catch (error) {
    console.warn('Failed to parse tokenURI:', error);
    // Return fallback
    return {
      image: '',
      materialName: '—',
      tier: '—',
      major: '—', 
      minor: '—',
      punchCount: 0,
      hypeBurned: '0'
    };
  }
}

/**
 * Create a mock tokenURI for testing (mimics on-chain format)
 */
export function createMockTokenURI(token: {
  tokenId: number;
  majorName: string;
  minorName: string; 
  materialName: string;
  materialTier: string;
  punchCount: number;
  hypeBurned: string;
  imageSvg: string;
}): string {
  const json = {
    name: `Omamori #${token.tokenId}`,
    description: "hyper.faith omamori", 
    attributes: [
      { trait_type: "Major", value: token.majorName },
      { trait_type: "Minor", value: token.minorName },
      { trait_type: "Material", value: token.materialName },
      { trait_type: "Rarity Tier", value: token.materialTier },
      { display_type: "number", trait_type: "Material ID", value: token.tokenId },
      { display_type: "number", trait_type: "Punch Count", value: token.punchCount },
      { display_type: "number", trait_type: "HYPE Burned", value: token.hypeBurned }
    ],
    image: `data:image/svg+xml;base64,${btoa(token.imageSvg)}`
  };
  
  return `data:application/json;base64,${btoa(JSON.stringify(json))}`;
}

/**
 * Future: Read token metadata from on-chain using viem/wagmi
 */
/*
export async function readTokenOnChain(tokenId: bigint) {
  const uri = await readContract({
    address: OMAMORI_ADDRESS,
    abi: OmamoriAbi,
    functionName: 'tokenURI',
    args: [tokenId]
  });
  
  return parseTokenURI(uri);
}
*/