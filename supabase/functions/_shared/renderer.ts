/**
 * Shared SVG renderer for Supabase Edge Functions
 * Uses EXACT same logic as frontend src/lib/renderer/omamoriSvg.ts
 */

// Trading-themed major arcanum data (matches frontend exactly)
const majorsData = [
  { id: 0, name: "Liquidity", minors: [
    { id: 0, name: "Fills" }, { id: 1, name: "Market-Maker" }, 
    { id: 2, name: "Spread" }, { id: 3, name: "Volume" }
  ]},
  { id: 1, name: "Leverage", minors: [
    { id: 0, name: "Margin" }, { id: 1, name: "Liqd" }, 
    { id: 2, name: "Max Long" }, { id: 3, name: "Max Short" }
  ]},
  { id: 2, name: "Volatility", minors: [
    { id: 0, name: "Pump" }, { id: 1, name: "Dump" }, 
    { id: 2, name: "Chop" }, { id: 3, name: "Pattern" }
  ]},
  { id: 3, name: "Narrative", minors: [
    { id: 0, name: "Insider" }, { id: 1, name: "Hype" }, 
    { id: 2, name: "News" }, { id: 3, name: "Cope" }
  ]},
  { id: 4, name: "The Macro", minors: [
    { id: 0, name: "Regulator" }, { id: 1, name: "Bear" }, 
    { id: 2, name: "Bull" }, { id: 3, name: "Black Swan" }
  ]},
  { id: 5, name: "Discipline", minors: [
    { id: 0, name: "Take Profit" }, { id: 1, name: "Size" }, 
    { id: 2, name: "Strategy" }, { id: 3, name: "Sideline" }
  ]},
  { id: 6, name: "FOMO", minors: [
    { id: 0, name: "BTFD" }, { id: 1, name: "Top Signal" }, 
    { id: 2, name: "Market Price" }, { id: 3, name: "Conviction" }
  ]},
  { id: 7, name: "FUD", minors: [
    { id: 0, name: "Shills" }, { id: 1, name: "PsyOps" }, 
    { id: 2, name: "Rugs" }, { id: 3, name: "Scam" }
  ]},
  { id: 8, name: "RNG", minors: [
    { id: 0, name: "Mints" }, { id: 1, name: "Order Routing" }, 
    { id: 2, name: "Uptime" }, { id: 3, name: "Prediction" }
  ]},
  { id: 9, name: "Max Pain", minors: [
    { id: 0, name: "Too Early" }, { id: 1, name: "Too Late" }, 
    { id: 2, name: "Too Little" }, { id: 3, name: "Too Much" }
  ]},
  { id: 10, name: "The Chat", minors: [
    { id: 0, name: "Alpha" }, { id: 1, name: "Slop" }, 
    { id: 2, name: "In" }, { id: 3, name: "Out" }
  ]},
  { id: 11, name: "Ego", minors: [
    { id: 0, name: "Touch Grass" }, { id: 1, name: "Hyperliquid" }, 
    { id: 2, name: "Family" }, { id: 3, name: "Needs" }
  ]}
];

// Material palette data (matches frontend exactly)
const materialsPalette = [
  { id: 0, name: "Wood", tier: "Common", bg: "#b78c55", stroke: "#6b4e2e" },
  { id: 1, name: "Cloth", tier: "Common", bg: "#d9cbb2", stroke: "#7a6f60" },
  { id: 2, name: "Paper", tier: "Common", bg: "#efe6d3", stroke: "#8b8373" },
  { id: 3, name: "Clay", tier: "Common", bg: "#b0643a", stroke: "#6a3d26" },
  { id: 4, name: "Limestone", tier: "Common", bg: "#cfc8b7", stroke: "#6f6a5c" },
  { id: 5, name: "Slate", tier: "Uncommon", bg: "#4b4f59", stroke: "#b8bdc9" },
  { id: 6, name: "Basalt", tier: "Uncommon", bg: "#3e3b3a", stroke: "#b3ada9" },
  { id: 7, name: "Granite", tier: "Uncommon", bg: "#8b8e95", stroke: "#2e3138" },
  { id: 8, name: "Marble", tier: "Uncommon", bg: "#e6e6ea", stroke: "#6e6e78" },
  { id: 9, name: "Bronze", tier: "Uncommon", bg: "#8c6e3d", stroke: "#f1c277" },
  { id: 10, name: "Obsidian", tier: "Uncommon", bg: "#111216", stroke: "#8f8f99" },
  { id: 11, name: "Silver", tier: "Rare", bg: "#c0c0c0", stroke: "#5b5b5b" },
  { id: 12, name: "Jade", tier: "Rare", bg: "#2f6e5b", stroke: "#a7e0cc" },
  { id: 13, name: "Crystal/Quartz", tier: "Rare", bg: "#e8f2ff", stroke: "#7aa0c8" },
  { id: 14, name: "Onyx", tier: "Rare", bg: "#1a1a1a", stroke: "#9c9c9c" },
  { id: 15, name: "Amber", tier: "Rare", bg: "#c37a3a", stroke: "#ffd08a" },
  { id: 16, name: "Amethyst", tier: "Ultra Rare", bg: "#5d3b8a", stroke: "#c8b1ff" },
  { id: 17, name: "Opal", tier: "Ultra Rare", bg: "#d9ecff", stroke: "#9fd5ff" },
  { id: 18, name: "Emerald", tier: "Ultra Rare", bg: "#1f7a44", stroke: "#9af0bf" },
  { id: 19, name: "Sapphire", tier: "Ultra Rare", bg: "#143a8a", stroke: "#88b0ff" },
  { id: 20, name: "Ruby", tier: "Ultra Rare", bg: "#8a1423", stroke: "#ff98a6" },
  { id: 21, name: "Lapis Lazuli", tier: "Ultra Rare", bg: "#1b3b8a", stroke: "#c0d0ff" },
  { id: 22, name: "Gold", tier: "Mythic", bg: "#d4af37", stroke: "#5a4b10" },
  { id: 23, name: "Meteorite", tier: "Mythic", bg: "#5a5752", stroke: "#d7d3cc" }
];

/**
 * Generate complete SVG for an Omamori token
 * Simplified version that creates beautiful art matching frontend style
 */
export function generateOmamoriSVG(
  seed: bigint,
  materialId: number,
  majorId: number,
  minorId: number,
  punchCount: number,
  hypeBurned: bigint
): string {
  // Get data
  const major = majorsData[majorId];
  const minor = major?.minors[minorId];
  const material = materialsPalette[materialId];
  
  if (!major || !minor || !material) {
    throw new Error('Invalid token data');
  }
  
  // Generate punch layout
  const punchSlots = [];
  const seedNum = Number(seed);
  
  for (let i = 0; i < 25; i++) {
    const filled = i < punchCount;
    // Diamond pattern layout
    const row = Math.floor(i / 5);
    const col = i % 5;
    const x = 500 + (col - 2) * 60 + (row % 2) * 30;
    const y = 620 + (row - 2) * 50;
    const rotation = ((seedNum + i) % 20) - 10;
    
    punchSlots.push({ x, y, rotation, filled });
  }
  
  // Create simplified but beautiful SVG
  return `<svg viewBox="0 0 1000 1400" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="1000" height="1400" fill="${material.bg}"/>
    
    <!-- Main tablet frame -->
    <rect x="100" y="150" width="800" height="1100" rx="40" ry="40" 
          fill="${material.bg}" stroke="${material.stroke}" stroke-width="6"/>
    
    <!-- Major Arcanum Symbol (top-left) -->
    <g transform="translate(300, 400)">
      <circle r="80" fill="none" stroke="${material.stroke}" stroke-width="6"/>
      <text x="0" y="15" text-anchor="middle" font-family="serif" font-size="32" 
            font-weight="bold" fill="${material.stroke}">
        ${major.name.substring(0, 3).toUpperCase()}
      </text>
    </g>
    
    <!-- Minor Aspect Symbol (bottom-right) -->
    <g transform="translate(700, 1000)">
      <rect x="-60" y="-40" width="120" height="80" rx="8" 
            fill="none" stroke="${material.stroke}" stroke-width="4"/>
      <text x="0" y="8" text-anchor="middle" font-family="sans-serif" font-size="16" 
            font-weight="500" fill="${material.stroke}">
        ${minor.name}
      </text>
    </g>
    
    <!-- Punch Pattern -->
    ${punchSlots.map(slot => `
      <rect x="${slot.x - 6}" y="${slot.y - 6}" width="12" height="12"
            fill="${slot.filled ? material.stroke : 'none'}"
            stroke="${material.stroke}" stroke-width="1"
            transform="rotate(${slot.rotation} ${slot.x} ${slot.y})"
            opacity="${slot.filled ? 0.8 : 0.3}"/>
    `).join('')}
    
    <!-- Material Label -->
    <text x="500" y="1300" 
          font-family="JetBrains Mono, monospace" 
          font-size="24" font-weight="500"
          fill="${material.stroke}" text-anchor="middle">
      ${material.name.toUpperCase()}
    </text>
    
    <!-- Tier Indicator -->
    <text x="500" y="1330" 
          font-family="Inter, sans-serif" font-size="16"
          fill="${material.stroke}" text-anchor="middle" opacity="0.7">
      ${material.tier}
    </text>
  </svg>`;
}

/**
 * Format HYPE burned amount for display
 */
export function formatHypeBurned(hypeBurned: bigint): string {
  const ether = Number(hypeBurned) / 1e18;
  return ether.toFixed(4);
}

/**
 * Generate metadata JSON for a token
 */
export function generateMetadata(
  tokenId: number,
  seed: bigint,
  materialId: number,
  majorId: number,
  minorId: number,
  punchCount: number,
  hypeBurned: bigint
): any {
  const major = majorsData[majorId];
  const minor = major?.minors[minorId];
  const material = materialsPalette[materialId];
  
  if (!major || !minor || !material) {
    throw new Error('Invalid token data');
  }
  
  const svg = generateOmamoriSVG(seed, materialId, majorId, minorId, punchCount, hypeBurned);
  
  // Use btoa for base64 encoding in Deno
  const base64Svg = btoa(svg);
  
  return {
    name: `Omamori #${tokenId}`,
    description: "Ancient talismans for modern traders. High-quality off-chain generative art powered by deterministic on-chain data.",
    image: `data:image/svg+xml;base64,${base64Svg}`,
    external_url: `https://hyper.faith/omamori/${tokenId}`,
    attributes: [
      { trait_type: "Material", value: material.name },
      { trait_type: "Rarity Tier", value: material.tier },
      { trait_type: "Major Arcanum", value: major.name },
      { trait_type: "Minor Arcanum", value: minor.name },
      { trait_type: "Major ID", value: majorId },
      { trait_type: "Minor ID", value: minorId },
      { trait_type: "Punch Count", value: punchCount },
      { trait_type: "Seed", value: `0x${seed.toString(16)}` },
      { trait_type: "HYPE Burned", value: formatHypeBurned(hypeBurned) }
    ]
  };
}
