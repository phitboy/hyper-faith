import majorsData from '../../data/majors.json';
import { materials } from '../../data/materials.json';

export interface TokenData {
  majorId: number;
  minorId: number;
  materialId: number;
  materialName: string;
  materialTier: 'Common' | 'Uncommon' | 'Rare' | 'Ultra Rare' | 'Mythic';
  punchCount: number;
  seed: string;
}

/**
 * Render an Omamori NFT as SVG
 * @param token - Token data including major, minor, material, punches, etc.
 * @returns SVG string
 */
export function renderOmamoriSVG(token: TokenData): string {
  const { majorId, minorId, materialId, punchCount, seed } = token;
  
  // Get major and minor data
  const major = majorsData[majorId];
  const minor = major?.minors[minorId];
  const material = materials.find(m => m.id === materialId);
  
  if (!major || !minor || !material) {
    throw new Error('Invalid token data');
  }
  
  // Color scheme based on material tier
  const getTierColors = (tier: string) => {
    switch (tier) {
      case 'Common':
        return { primary: '#e6e1d5', accent: '#6c6a65', frame: '#8B4513' };
      case 'Uncommon':
        return { primary: '#e6e1d5', accent: '#5a9fd4', frame: '#2F4F4F' };
      case 'Rare':
        return { primary: '#e6e1d5', accent: '#b19cd9', frame: '#663399' };
      case 'Ultra Rare':
        return { primary: '#fff5e6', accent: '#ffb347', frame: '#FFD700' };
      case 'Mythic':
        return { primary: '#fff8dc', accent: '#ff6b35', frame: '#FF4500' };
      default:
        return { primary: '#e6e1d5', accent: '#6c6a65', frame: '#8B4513' };
    }
  };
  
  const colors = getTierColors(material.tier);
  
  // Generate punch positions (25 slots in diamond pattern)
  const generatePunchSlots = () => {
    const slots = [];
    const rows = [1, 2, 3, 4, 5, 4, 3, 2, 1]; // Diamond pattern
    let slotIndex = 0;
    
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const slotsInRow = rows[rowIndex];
      const startX = 500 - (slotsInRow * 15) / 2; // Center the row
      const y = 400 + rowIndex * 30 - 120; // Center vertically around 400
      
      for (let slotInRow = 0; slotInRow < slotsInRow; slotInRow++) {
        const x = startX + slotInRow * 30;
        
        // Add slight jitter based on seed
        const jitterX = (hashCode(seed + slotIndex) % 6) - 3;
        const jitterY = (hashCode(seed + slotIndex + 'y') % 6) - 3;
        const rotation = (hashCode(seed + slotIndex + 'rot') % 20) - 10;
        
        slots.push({
          x: x + jitterX,
          y: y + jitterY,
          rotation,
          filled: slotIndex < punchCount
        });
        
        slotIndex++;
      }
    }
    
    return slots;
  };
  
  const punchSlots = generatePunchSlots();
  
  // Format glyphs for SVG text
  const formatGlyph = (glyph: string) => {
    return glyph.split('\\n').join('\n');
  };
  
  return `<svg viewBox="0 0 1000 1400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Stone texture filter -->
      <filter id="stoneTexture" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence baseFrequency="0.9" numOctaves="4" result="turbulence"/>
        <feColorMatrix in="turbulence" type="saturate" values="0"/>
        <feComponentTransfer>
          <feFuncA type="discrete" tableValues="0.1 0.15 0.1 0.2 0.05"/>
        </feComponentTransfer>
        <feComposite in2="SourceGraphic" operator="multiply"/>
      </filter>
      
      <!-- Paper texture filter -->
      <filter id="paperTexture" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise"/>
        <feColorMatrix in="noise" type="saturate" values="0"/>
        <feComponentTransfer>
          <feFuncA type="discrete" tableValues="0.02 0.05 0.03 0.07"/>
        </feComponentTransfer>
        <feComposite in2="SourceGraphic" operator="multiply"/>
      </filter>
    </defs>
    
    <!-- Background -->
    <rect width="1000" height="1400" fill="${colors.primary}" filter="url(#paperTexture)"/>
    
    <!-- Frame border -->
    <rect x="20" y="20" width="960" height="1360" 
          fill="none" 
          stroke="${colors.frame}" 
          stroke-width="8" 
          rx="4"/>
    
    <!-- Inner frame -->
    <rect x="40" y="40" width="920" height="1320" 
          fill="none" 
          stroke="${colors.accent}" 
          stroke-width="2" 
          rx="2"/>
    
    <!-- Major glyph (top-left) -->
    <text x="100" y="140" 
          font-family="JetBrains Mono, monospace" 
          font-size="48" 
          font-weight="600"
          fill="${colors.accent}" 
          text-anchor="start">
      ${formatGlyph(major.glyph).split('\n').map((line, i) => 
        `<tspan x="100" dy="${i === 0 ? 0 : 60}">${line}</tspan>`
      ).join('')}
    </text>
    
    <!-- Minor glyph (bottom-right) -->
    <text x="900" y="1140" 
          font-family="JetBrains Mono, monospace" 
          font-size="36" 
          font-weight="500"
          fill="${colors.accent}" 
          text-anchor="end">
      ${formatGlyph(minor.glyph).split('\n').map((line, i) => 
        `<tspan x="900" dy="${i === 0 ? 0 : 45}">${line}</tspan>`
      ).join('')}
    </text>
    
    <!-- Punch diamond -->
    <g transform="translate(500, 700)">
      ${punchSlots.map((slot, index) => `
        <rect x="${slot.x - 500}" y="${slot.y - 700}" width="12" height="12"
              fill="${slot.filled ? colors.accent : 'none'}"
              stroke="${colors.accent}"
              stroke-width="1"
              transform="rotate(${slot.rotation} ${slot.x - 500 + 6} ${slot.y - 700 + 6})"
              opacity="${slot.filled ? 0.8 : 0.3}"/>
      `).join('')}
    </g>
    
    <!-- Material label -->
    <text x="500" y="1300" 
          font-family="JetBrains Mono, monospace" 
          font-size="24" 
          font-weight="500"
          fill="${colors.accent}" 
          text-anchor="middle">
      ${material.name.toUpperCase()}
    </text>
    
    <!-- Tier indicator -->
    <text x="500" y="1330" 
          font-family="Inter, sans-serif" 
          font-size="16" 
          font-weight="400"
          fill="${colors.accent}" 
          text-anchor="middle"
          opacity="0.7">
      ${material.tier}
    </text>
  </svg>`;
}

// Simple hash function for jitter
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}