/**
 * Shared SVG renderer for Supabase Edge Functions
 * This module contains the core SVG generation logic
 */

// Material data - simplified for Edge Functions
const materials = [
  { id: 0, name: "Copper", tier: "Common", bg: "#B87333", stroke: "#8B4513" },
  { id: 1, name: "Iron", tier: "Common", bg: "#708090", stroke: "#2F4F4F" },
  { id: 2, name: "Silver", tier: "Uncommon", bg: "#C0C0C0", stroke: "#808080" },
  { id: 3, name: "Gold", tier: "Rare", bg: "#FFD700", stroke: "#B8860B" },
  { id: 4, name: "Platinum", tier: "Epic", bg: "#E5E4E2", stroke: "#71706E" },
  { id: 5, name: "Mithril", tier: "Legendary", bg: "#B0E0E6", stroke: "#4682B4" },
  { id: 6, name: "Adamantine", tier: "Mythic", bg: "#9370DB", stroke: "#4B0082" },
  { id: 7, name: "Ethereal", tier: "Divine", bg: "#F0F8FF", stroke: "#6495ED" }
];

const majors = [
  { id: 0, name: "The Fool", symbol: "0" },
  { id: 1, name: "The Magician", symbol: "I" },
  { id: 2, name: "The High Priestess", symbol: "II" },
  { id: 3, name: "The Empress", symbol: "III" },
  { id: 4, name: "The Emperor", symbol: "IV" },
  { id: 5, name: "The Hierophant", symbol: "V" },
  { id: 6, name: "The Lovers", symbol: "VI" },
  { id: 7, name: "The Chariot", symbol: "VII" },
  { id: 8, name: "Strength", symbol: "VIII" },
  { id: 9, name: "The Hermit", symbol: "IX" },
  { id: 10, name: "Wheel of Fortune", symbol: "X" },
  { id: 11, name: "Justice", symbol: "XI" },
  { id: 12, name: "The Hanged Man", symbol: "XII" },
  { id: 13, name: "Death", symbol: "XIII" },
  { id: 14, name: "Temperance", symbol: "XIV" },
  { id: 15, name: "The Devil", symbol: "XV" },
  { id: 16, name: "The Tower", symbol: "XVI" },
  { id: 17, name: "The Star", symbol: "XVII" },
  { id: 18, name: "The Moon", symbol: "XVIII" },
  { id: 19, name: "The Sun", symbol: "XIX" },
  { id: 20, name: "Judgement", symbol: "XX" },
  { id: 21, name: "The World", symbol: "XXI" }
];

// Minor arcana names for trading concepts
const minorNames = [
  ["Discipline", "Risk Management", "Position Sizing", "Stop Loss"],
  ["Leverage", "Margin", "Liquidation", "Collateral"],
  ["Trend", "Momentum", "Reversal", "Breakout"],
  ["Support", "Resistance", "Volume", "Volatility"],
  ["Bull Market", "Bear Market", "Sideways", "Correction"],
  ["FOMO", "FUD", "Diamond Hands", "Paper Hands"],
  ["Hodl", "DCA", "Swing Trade", "Day Trade"],
  ["Arbitrage", "Scalping", "Grid Trading", "Mean Reversion"],
  ["Technical Analysis", "Fundamental Analysis", "Sentiment", "News"],
  ["Liquidity", "Slippage", "Spread", "Order Book"],
  ["Market Maker", "Market Taker", "Whale", "Retail"],
  ["Pump", "Dump", "Accumulation", "Distribution"],
  ["Resistance Flip", "Support Test", "Breakout Retest", "False Breakout"],
  ["Oversold", "Overbought", "Neutral", "Divergence"],
  ["Bull Trap", "Bear Trap", "Dead Cat Bounce", "Capitulation"],
  ["MACD", "RSI", "Bollinger Bands", "Moving Average"],
  ["Fibonacci", "Elliott Wave", "Wyckoff", "Dow Theory"],
  ["Market Cap", "Volume Profile", "Open Interest", "Funding Rate"],
  ["Long", "Short", "Hedge", "Straddle"],
  ["Alpha", "Beta", "Gamma", "Delta"],
  ["Backtest", "Forward Test", "Paper Trade", "Live Trade"],
  ["RNG", "Luck", "Skill", "Uptime"]
];

/**
 * Generate complete SVG for an Omamori token
 */
export function generateOmamoriSVG(
  seed: bigint,
  materialId: number,
  majorId: number,
  minorId: number,
  punchCount: number,
  hypeBurned: bigint
): string {
  const material = materials[materialId] || materials[0];
  const major = majors[majorId] || majors[0];
  const minorName = minorNames[majorId]?.[minorId] || "Unknown";
  
  // Generate punches based on seed and count
  const punches = generatePunches(seed, punchCount);
  
  return `<svg width="600" height="800" viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${material.bg};stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:${material.stroke};stop-opacity:1" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Background -->
    <rect width="600" height="800" fill="url(#bg-gradient)" stroke="${material.stroke}" stroke-width="4"/>
    
    <!-- Border decoration -->
    <rect x="20" y="20" width="560" height="760" fill="none" stroke="${material.stroke}" stroke-width="2" opacity="0.6"/>
    
    <!-- Major Arcanum Symbol -->
    <g transform="translate(300, 150)">
      <circle r="80" fill="none" stroke="${material.stroke}" stroke-width="4" filter="url(#glow)"/>
      <text x="0" y="15" text-anchor="middle" font-family="serif" font-size="48" font-weight="bold" fill="${material.stroke}">
        ${major.symbol}
      </text>
    </g>
    
    <!-- Major Arcanum Name -->
    <text x="300" y="280" text-anchor="middle" font-family="serif" font-size="24" font-weight="bold" fill="${material.stroke}">
      ${major.name}
    </text>
    
    <!-- Minor Arcanum -->
    <text x="300" y="320" text-anchor="middle" font-family="sans-serif" font-size="18" fill="${material.stroke}" opacity="0.8">
      ${minorName}
    </text>
    
    <!-- Material Info -->
    <g transform="translate(300, 380)">
      <text x="0" y="0" text-anchor="middle" font-family="sans-serif" font-size="16" fill="${material.stroke}" opacity="0.7">
        ${material.name} • ${material.tier}
      </text>
    </g>
    
    <!-- Punches -->
    ${punches.map(punch => `<circle cx="${punch.x}" cy="${punch.y}" r="${punch.size}" fill="${material.stroke}" opacity="0.3"/>`).join('')}
    
    <!-- HYPE Burned -->
    <text x="300" y="750" text-anchor="middle" font-family="monospace" font-size="14" fill="${material.stroke}" opacity="0.6">
      ${formatHypeBurned(hypeBurned)} HYPE
    </text>
  </svg>`;
}

/**
 * Generate punch positions based on seed
 */
function generatePunches(seed: bigint, count: number): Array<{x: number, y: number, size: number}> {
  const punches = [];
  let rng = Number(seed);
  
  for (let i = 0; i < count; i++) {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    const x = 50 + (rng % 500);
    
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    const y = 400 + (rng % 300);
    
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    const size = 3 + (rng % 8);
    
    punches.push({ x, y, size });
  }
  
  return punches;
}

/**
 * Format HYPE burned amount for display
 */
function formatHypeBurned(hypeBurned: bigint): string {
  const ether = Number(hypeBurned) / 1e18;
  return ether.toFixed(4);
}

/**
 * Get material by ID
 */
export function getMaterial(id: number) {
  return materials[id] || materials[0];
}

/**
 * Get major arcanum by ID
 */
export function getMajor(id: number) {
  return majors[id] || majors[0];
}

/**
 * Get minor arcanum name
 */
export function getMinorName(majorId: number, minorId: number): string {
  return minorNames[majorId]?.[minorId] || "Unknown";
}
