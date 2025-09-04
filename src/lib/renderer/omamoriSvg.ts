import majorsData from '@/data/majors.json';
import materialsData from '@/data/materials.json';
import materialsPalette from '@/data/materialsPalette.json';

export interface TokenData {
  majorId: number;
  minorId: number;
  materialId: number;
  materialName: string;
  materialTier: 'Common' | 'Uncommon' | 'Rare' | 'Ultra Rare' | 'Mythic';
  punchCount: number;
  seed: string;
}

// SVG helper functions (translated from Solidity)
class SvgHelpers {
  static line(x1: number, y1: number, x2: number, y2: number, sw: number): string {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#111" stroke-width="${sw}"/>`;
  }

  static rect(x: number, y: number, w: number, h: number, sw: number, filled: boolean): string {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" ry="4" stroke="#111" stroke-width="${sw}" ${filled ? 'fill="#111"' : 'fill="none"'}/>`;
  }

  static circle(cx: number, cy: number, r: number, filled: boolean, sw: number = 0): string {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" ${filled ? 'fill="#111"' : `fill="none" stroke="#111" stroke-width="${sw}"`}/>`;
  }

  static polygon(points: number[], sw: number, filled: boolean): string {
    const pts = [];
    for (let i = 0; i < points.length; i += 2) {
      pts.push(`${points[i]},${points[i + 1]}`);
    }
    return `<polygon points="${pts.join(' ')}" stroke="#111" stroke-width="${sw}" ${filled ? 'fill="#111"' : 'fill="none"'}/>`;
  }

  static polyline(points: number[], sw: number): string {
    const pts = [];
    for (let i = 0; i < points.length; i += 2) {
      pts.push(`${points[i]},${points[i + 1]}`);
    }
    return `<polyline points="${pts.join(' ')}" fill="none" stroke="#111" stroke-width="${sw}"/>`;
  }
}

// Shape builders
function triUp(cx: number, cy: number, r: number): number[] {
  return [cx, cy - r, cx + r, cy + r, cx - r, cy + r];
}

function triDown(cx: number, cy: number, r: number): number[] {
  return [cx - r, cy - r, cx + r, cy - r, cx, cy + r];
}

function diamond(cx: number, cy: number, r: number): number[] {
  return [cx, cy - r, cx + r, cy, cx, cy + r, cx - r, cy];
}

function arrowRight(x: number, y: number, w: number): number[] {
  return [x, y - 8, x + w, y, x, y + 8];
}

function arrowLeft(x: number, y: number, w: number): number[] {
  return [x, y, x - w, y - 8, x - w, y + 8];
}

// Major glyph renderers (top-left cluster ~ x=220..380, y=320..600)
function renderMajorGlyph(id: number, color: string): string {
  const S = SvgHelpers;
  let s = '';
  
  if (id === 0) { // Liquidity — three pillars
    s = S.line(260, 360, 260, 520, 6) + S.line(300, 360, 300, 520, 6) + S.line(340, 360, 340, 520, 6);
  } else if (id === 1) { // Leverage — lever + fulcrum
    s = S.line(230, 540, 360, 410, 6) + S.circle(285, 540, 6, true);
  } else if (id === 2) { // Volatility — zigzag bolt
    const pts = [230, 420, 280, 470, 255, 495, 320, 560, 360, 520];
    s = S.polyline(pts, 6);
  } else if (id === 3) { // Narrative — spiral-ish scroll
    s = S.circle(300, 470, 38, false, 6) + S.circle(300, 480, 16, false, 6);
  } else if (id === 4) { // The Macro — world axis
    s = S.circle(300, 470, 70, false, 6) + S.line(300, 400, 300, 540, 6);
  } else if (id === 5) { // Discipline — frame
    s = S.rect(230, 390, 140, 140, 6, false);
  } else if (id === 6) { // FOMO — up triangle
    s = S.polygon(triUp(300, 470, 90), 6, false);
  } else if (id === 7) { // FUD — down triangle
    s = S.polygon(triDown(300, 470, 90), 6, false);
  } else if (id === 8) { // RNG — braille cell (2x3)
    s = S.circle(270, 430, 7, true) + S.circle(330, 430, 7, true) +
        S.circle(270, 470, 7, true) + S.circle(330, 470, 7, true) +
        S.circle(270, 510, 7, true) + S.circle(330, 510, 7, true);
  } else if (id === 9) { // Max Pain — X cross
    s = S.line(240, 410, 360, 530, 6) + S.line(360, 410, 240, 530, 6);
  } else if (id === 10) { // The Chat — signal bars + ping
    s = S.circle(300, 400, 6, true) + S.line(250, 460, 350, 460, 8) + S.line(250, 500, 350, 500, 6);
  } else if (id === 11) { // Ego — lozenge eye + pupil
    s = S.polygon(diamond(300, 470, 60), 6, false) + S.circle(300, 470, 8, true);
  }
  
  return s.replace(/stroke="#111"/g, `stroke="${color}"`).replace(/fill="#111"/g, `fill="${color}"`);
}

// Minor glyph renderers (bottom-right cluster ~ x=700..860, y=980..1180)
function renderMinorGlyph(majorId: number, minorId: number, color: string): string {
  const S = SvgHelpers;
  let s = '';
  
  if (majorId === 0) { // Liquidity: Fills, MM, Spread, Volume
    if (minorId === 0) { // Fills: pillars + caps
      s = S.line(740, 1000, 740, 1140, 6) + S.line(780, 1000, 780, 1140, 6) + S.line(820, 1000, 820, 1140, 6) +
          S.line(730, 1000, 750, 1000, 6) + S.line(770, 1000, 790, 1000, 6) + S.line(810, 1000, 830, 1000, 6) +
          S.line(730, 1140, 750, 1140, 6) + S.line(770, 1140, 790, 1140, 6) + S.line(810, 1140, 830, 1140, 6);
    } else if (minorId === 1) { // Market-Maker: crossbar
      s = S.line(740, 1000, 740, 1140, 6) + S.line(780, 1000, 780, 1140, 6) + S.line(820, 1000, 820, 1140, 6) +
          S.line(740, 1070, 820, 1070, 6);
    } else if (minorId === 2) { // Spread: uneven spacing
      s = S.line(730, 1000, 730, 1140, 6) + S.line(780, 1000, 780, 1140, 6) + S.line(850, 1000, 850, 1140, 6);
    } else { // Volume: mid dots
      s = S.line(740, 1000, 740, 1140, 6) + S.line(780, 1000, 780, 1140, 6) + S.line(820, 1000, 820, 1140, 6) +
          S.circle(760, 1070, 6, true) + S.circle(800, 1070, 6, true);
    }
  } else if (majorId === 1) { // Leverage: Margin, Liqd, Max Long, Max Short
    if (minorId === 0) { // Margin: higher fulcrum
      s = S.line(710, 1120, 850, 1000, 6) + S.circle(780, 1090, 6, true);
    } else if (minorId === 1) { // Liqd: blade at tip
      s = S.line(710, 1120, 850, 1000, 6) + S.polygon(arrowRight(850, 1000, 12), 6, true) + S.circle(780, 1120, 6, true);
    } else if (minorId === 2) { // Max Long: steeper up
      s = S.line(710, 1140, 860, 980, 6) + S.circle(780, 1140, 6, true);
    } else { // Max Short: down
      s = S.line(710, 1000, 860, 1140, 6) + S.circle(780, 1000, 6, true);
    }
  } else if (majorId === 2) { // Volatility: Pump, Dump, Chop, Pattern
    if (minorId === 0) { // Pump
      s = S.polyline([720, 1030, 770, 1080, 745, 1105, 820, 1160, 860, 1120], 6);
    } else if (minorId === 1) { // Dump
      s = S.polyline([860, 1030, 810, 1080, 835, 1105, 760, 1160, 720, 1120], 6);
    } else if (minorId === 2) { // Chop
      s = S.polyline([720, 1060, 740, 1080, 760, 1060, 780, 1080, 800, 1060, 820, 1080, 840, 1060], 6);
    } else { // Pattern (symmetrized)
      s = S.polyline([720, 1060, 760, 1100, 740, 1120, 800, 1160, 860, 1120], 6);
    }
  } else if (majorId === 3) { // Narrative: Insider, Hype, News, Cope
    if (minorId === 0) { // Insider: tight inner curl
      s = S.circle(800, 1080, 34, false, 6) + S.circle(800, 1090, 14, false, 6);
    } else if (minorId === 1) { // Hype: larger outer
      s = S.circle(800, 1080, 44, false, 6) + S.circle(800, 1090, 16, false, 6);
    } else if (minorId === 2) { // News: tail then curl
      s = S.line(740, 1080, 780, 1080, 6) + S.circle(820, 1080, 34, false, 6);
    } else { // Cope: open inner gap
      s = S.circle(800, 1080, 40, false, 6) + S.line(792, 1080, 808, 1080, 6);
    }
  } else if (majorId === 4) { // The Macro: Regulator, Bear, Bull, Black Swan
    if (minorId === 0) { // Regulator: top bar
      s = S.circle(800, 1080, 60, false, 6) + S.line(770, 1005, 830, 1005, 6) + S.line(800, 1020, 800, 1140, 6);
    } else if (minorId === 1) { // Bear: heavier bottom arc
      s = S.circle(800, 1080, 60, false, 8) + S.circle(800, 1080, 60, false, 6);
    } else if (minorId === 2) { // Bull: heavier top arc
      s = S.circle(800, 1080, 60, false, 8);
    } else { // Black Swan: off-axis dot
      s = S.circle(800, 1080, 60, false, 6) + S.circle(845, 1035, 6, true);
    }
  } else if (majorId === 5) { // Discipline: Take Profit, Size, Strategy, Sideline
    if (minorId === 0) { // Take Profit: top tick
      s = S.rect(730, 1020, 140, 140, 6, false) + S.circle(800, 1020, 5, true);
    } else if (minorId === 1) { // Size: inner frame
      s = S.rect(730, 1020, 140, 140, 6, false) + S.rect(750, 1040, 100, 100, 6, false);
    } else if (minorId === 2) { // Strategy: grid
      s = S.rect(730, 1020, 140, 140, 6, false) + S.line(800, 1020, 800, 1160, 6) + S.line(730, 1090, 870, 1090, 6);
    } else { // Sideline: missing right edge
      s = S.line(730, 1020, 870, 1020, 6) + S.line(730, 1020, 730, 1160, 6) + S.line(730, 1160, 870, 1160, 6);
    }
  } else if (majorId === 6) { // FOMO: BTFD, Top Signal, Market Price, Conviction
    if (minorId === 0) { // BTFD: small inverted wedge at base
      s = S.polygon(triUp(800, 1080, 80), 6, false) + S.polygon(triDown(800, 1160, 26), 6, false);
    } else if (minorId === 1) { // Top Signal: dot at apex
      s = S.polygon(triUp(800, 1080, 80), 6, false) + S.circle(800, 1000, 6, true);
    } else if (minorId === 2) { // Market Price: midline
      s = S.polygon(triUp(800, 1080, 80), 6, false) + S.line(760, 1115, 840, 1115, 6);
    } else { // Conviction: double outline
      s = S.polygon(triUp(800, 1080, 80), 6, false) + S.polygon(triUp(800, 1080, 66), 6, false);
    }
  } else if (majorId === 7) { // FUD: Shills, PsyOps, Rugs, Scam
    if (minorId === 0) { // Shills: side notches
      s = S.polygon(triDown(800, 1080, 80), 6, false) + S.line(740, 1080, 750, 1080, 6) + S.line(850, 1080, 860, 1080, 6);
    } else if (minorId === 1) { // PsyOps: split base
      s = S.polygon(triDown(800, 1080, 80), 6, false) + S.line(760, 1000, 790, 1000, 6) + S.line(810, 1000, 840, 1000, 6);
    } else if (minorId === 2) { // Rugs: trapdoor at tip
      s = S.polygon(triDown(800, 1080, 80), 6, false) + S.rect(796, 1160, 8, 10, 6, true);
    } else { // Scam: hollow ghost
      s = S.polygon(triDown(800, 1080, 80), 6, false) + S.polygon(triDown(800, 1080, 60), 4, false);
    }
  } else if (majorId === 8) { // RNG: Mints, Order Routing, Uptime, Prediction
    if (minorId === 0) { // Mints: top row only
      s = S.circle(780, 1020, 7, true) + S.circle(820, 1020, 7, true);
    } else if (minorId === 1) { // Order Routing: left column
      s = S.circle(780, 1020, 7, true) + S.circle(780, 1080, 7, true) + S.circle(780, 1140, 7, true);
    } else if (minorId === 2) { // Uptime: right column
      s = S.circle(820, 1020, 7, true) + S.circle(820, 1080, 7, true) + S.circle(820, 1140, 7, true);
    } else { // Prediction: diagonal
      s = S.circle(780, 1020, 7, true) + S.circle(800, 1080, 7, true) + S.circle(820, 1140, 7, true);
    }
  } else if (majorId === 9) { // Max Pain: Too Early, Too Late, Too Little, Too Much
    if (minorId === 0) { // Too Early: X shifted up
      s = S.line(740, 1000, 860, 1120, 6) + S.line(860, 1000, 740, 1120, 6);
    } else if (minorId === 1) { // Too Late: X shifted down
      s = S.line(740, 1040, 860, 1160, 6) + S.line(860, 1040, 740, 1160, 6);
    } else if (minorId === 2) { // Too Little: small x
      s = S.line(770, 1050, 830, 1110, 6) + S.line(830, 1050, 770, 1110, 6);
    } else { // Too Much: X + center dot
      s = S.line(740, 1020, 860, 1140, 6) + S.line(860, 1020, 740, 1140, 6) + S.circle(800, 1080, 8, true);
    }
  } else if (majorId === 10) { // The Chat: Alpha, Slop, In, Out
    if (minorId === 0) { // Alpha: thicker top bar
      s = S.circle(800, 1000, 6, true) + S.line(750, 1060, 850, 1060, 10) + S.line(750, 1100, 850, 1100, 6);
    } else if (minorId === 1) { // Slop: wavy bottom
      s = S.circle(800, 1000, 6, true) + S.line(750, 1060, 850, 1060, 6) +
          S.polyline([750, 1100, 770, 1110, 790, 1095, 810, 1110, 830, 1095, 850, 1110], 6);
    } else if (minorId === 2) { // In: left chevron
      s = S.line(750, 1060, 850, 1060, 6) + S.line(750, 1100, 850, 1100, 6) + S.polygon(arrowRight(750, 1060, 10), 6, true);
    } else { // Out: right chevron
      s = S.line(750, 1060, 850, 1060, 6) + S.line(750, 1100, 850, 1100, 6) + S.polygon(arrowLeft(850, 1060, 10), 6, true);
    }
  } else if (majorId === 11) { // Ego: Touch Grass, Hyperliquid, Family, Needs
    if (minorId === 0) { // Touch Grass: eye without pupil
      s = S.polygon(diamond(800, 1080, 70), 6, false);
    } else if (minorId === 1) { // Hyperliquid: halo circle
      s = S.circle(800, 1080, 84, false, 6) + S.polygon(diamond(800, 1080, 70), 6, false) + S.circle(800, 1080, 6, true);
    } else if (minorId === 2) { // Family: two side dots
      s = S.polygon(diamond(800, 1080, 70), 6, false) + S.circle(760, 1080, 6, true) + S.circle(840, 1080, 6, true);
    } else { // Needs: four corner dots
      const d = diamond(800, 1080, 70);
      s = S.polygon(d, 6, false) +
          S.circle(d[0], d[1], 6, true) + S.circle(d[2], d[3], 6, true) +
          S.circle(d[4], d[5], 6, true) + S.circle(d[6], d[7], 6, true);
    }
  }
  
  return s.replace(/stroke="#111"/g, `stroke="${color}"`).replace(/fill="#111"/g, `fill="${color}"`);
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
  
  if (!major || !minor) {
    throw new Error('Invalid token data');
  }
  
  // Get material palette info
  const material = materialsPalette.materials.find(m => m.id === materialId);
  if (!material) {
    throw new Error('Invalid material ID');
  }
  
  // Color scheme based on material tier - removed as colors come from palette now
  
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
  
  // Render glyphs with material colors
  const majorGlyph = renderMajorGlyph(majorId, material.stroke);
  const minorGlyph = renderMinorGlyph(majorId, minorId, material.stroke);
  
  return `<svg viewBox="0 0 1000 1400" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="1000" height="1400" fill="${material.bg}"/>
    
    <!-- Main tablet frame -->
    <rect x="100" y="150" width="800" height="1100" rx="40" ry="40" 
          fill="${material.bg}" stroke="${material.stroke}" stroke-width="6"/>
    
    <!-- Content groups with stroke color -->
    <g stroke="${material.stroke}" stroke-width="6" fill="none">
      ${majorGlyph}
      ${minorGlyph}
    </g>
    
    <!-- Punch diamond -->
    <g transform="translate(500, 700)">
      ${punchSlots.map((slot, index) => `
        <rect x="${slot.x - 500}" y="${slot.y - 700}" width="12" height="12"
              fill="${slot.filled ? material.stroke : 'none'}"
              stroke="${material.stroke}"
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
          fill="${material.stroke}" 
          text-anchor="middle">
      ${material.name.toUpperCase()}
    </text>
    
    <!-- Tier indicator -->
    <text x="500" y="1330" 
          font-family="Inter, sans-serif" 
          font-size="16" 
          fill="${material.stroke}" 
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