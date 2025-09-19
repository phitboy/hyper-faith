/**
 * Shared SVG renderer for Supabase Edge Functions
 * EXACT COPY of frontend src/lib/renderer/omamoriSvg.ts logic
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
const materialsPalette = {
  materials: [
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
  ]
};

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

/**
 * Generate complete SVG for an Omamori token
 * EXACT COPY of frontend rendering logic
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
  const material = materialsPalette.materials.find(m => m.id === materialId);
  
  if (!major || !minor || !material) {
    throw new Error('Invalid token data');
  }
  
  const seedStr = seed.toString();
  
  // Punch Layout System - mirrors Solidity specification exactly
  
  // Canonical diamond centers (25 slots) - base positions before transform
  const baseSlots = (): [number[], number[]] => {
    const xs = [500,460,540,420,500,580,380,460,540,620,340,420,500,580,660,380,460,540,620,420,500,580,460,540,500];
    const ys = [420,470,470,520,520,520,570,570,570,570,620,620,620,620,620,670,670,670,670,720,720,720,770,770,820];
    return [xs, ys];
  };

  // Tablet interior bounds (keep within slab & away from frame)
  const tabletBounds = () => {
    // our slab rect was x=100..900, y=150..1250
    // keep a little margin for aesthetics:
    return { xMin: 140, yMin: 190, xMax: 860, yMax: 1210 };
  };

  // Forbidden glyph boxes (approximate):
  // top-left Major box & bottom-right Minor box
  const majorBox = () => {
    // around ~ (220..380, 320..600)
    return { x1: 200, y1: 320, x2: 390, y2: 600 };
  };
  
  const minorBox = () => {
    // around ~ (700..860, 980..1180)
    return { x1: 690, y1: 970, x2: 870, y2: 1190 };
  };

  // Simple AABB overlap
  const overlap = (ax1: number, ay1: number, ax2: number, ay2: number, 
                   bx1: number, by1: number, bx2: number, by2: number): boolean => {
    return !(ax2 < bx1 || bx2 < ax1 || ay2 < by1 || by2 < ay1);
  };

  // Fixed-point angles (degrees) with cos/sin scaled by 1e4 to avoid heavy trig
  const angleTable = () => {
    // {-12,-8,-4,0,4,8,12} degrees
    const deg    = [-12, -8, -4, 0, 4, 8, 12];
    const cos1e4 = [ 9781, 9903, 9976, 10000, 9976, 9903, 9781];
    const sin1e4 = [-2079, -1392,  -698,     0,   698,  1392, 2079];
    return { deg, cos1e4, sin1e4 };
  };

  // Deterministic small translation (±18 px) from seed+nonce
  const jitterXY = (seed: string, nonce: number): [number, number] => {
    const hash1 = hashCode(seed + nonce + 0xF17E);
    const hash2 = hashCode(seed + nonce + 0x1234);
    const rx = ((hash1 % 256) - 128); // -127..127
    const ry = ((hash2 % 256) - 128);
    const dx = rx % 19;              // -18..18
    const dy = ry % 19;
    return [dx, dy];
  };

  // Produce transformed slots that don't overlap forbidden boxes
  const transformSlots = (seed: string, punchCount: number): [number[], number[]] => {
    const [bx, by] = baseSlots();
    const bounds = tabletBounds();
    const majorBbox = majorBox();
    const minorBbox = minorBox();
    const angles = angleTable();

    // try up to 10 candidate transforms (angleIndex, dx, dy), deterministic order
    for (let k = 0; k < 10; k++) {
      const idx = Math.abs(hashCode(seed + k)) % 7; // pick angle
      const [dx, dy] = jitterXY(seed, k + 33);

      // pivot around the diamond center (500, 620 is the mid row 5 center)
      const cx = 500; 
      const cy = 620;
      const cosA = angles.cos1e4[idx]; 
      const sinA = angles.sin1e4[idx]; // scaled by 1e4

      let ok = true;
      for (let i = 0; i < punchCount && i < 25; i++) {
        const x0 = bx[i]; 
        const y0 = by[i];
        // rotate around (cx,cy)
        const xr = cx + Math.floor(( (x0 - cx) * cosA - (y0 - cy) * sinA ) / 10000);
        const yr = cy + Math.floor(( (x0 - cx) * sinA + (y0 - cy) * cosA ) / 10000);
        // translate
        const xt = xr + dx;
        const yt = yr + dy;

        // punch rect is 12x12; build its AABB (matching SVG rect size)
        const halfW = 6; 
        const halfH = 6;
        const ax1 = xt - halfW; 
        const ay1 = yt - halfH;
        const ax2 = xt + halfW; 
        const ay2 = yt + halfH;

        // bounds check
        if (ax1 < bounds.xMin || ay1 < bounds.yMin || ax2 > bounds.xMax || ay2 > bounds.yMax) { 
          ok = false; 
          break; 
        }
        // overlap forbidden glyph areas?
        if (overlap(ax1,ay1,ax2,ay2, majorBbox.x1,majorBbox.y1,majorBbox.x2,majorBbox.y2)) { 
          ok = false; 
          break; 
        }
        if (overlap(ax1,ay1,ax2,ay2, minorBbox.x1,minorBbox.y1,minorBbox.x2,minorBbox.y2)) { 
          ok = false; 
          break; 
        }
      }

      if (ok) {
        // write transformed coords (even for unused slots so array is full)
        const outX: number[] = [];
        const outY: number[] = [];
        for (let i = 0; i < 25; i++) {
          const x0 = bx[i]; 
          const y0 = by[i];
          const xr = cx + Math.floor(( (x0 - cx) * cosA - (y0 - cy) * sinA ) / 10000);
          const yr = cy + Math.floor(( (x0 - cx) * sinA + (y0 - cy) * cosA ) / 10000);
          outX[i] = xr + dx;
          outY[i] = yr + dy;
        }
        return [outX, outY];
      }
    }

    // Fallback: untransformed (still OK—by design the base diamond avoids the boxes)
    return [bx.slice(), by.slice()];
  };

  // Generate punch slots with deterministic transform
  const generatePunchSlots = () => {
    const [transformedX, transformedY] = transformSlots(seedStr, punchCount);
    
    const slots = [];
    for (let i = 0; i < 25; i++) {
      // Add small individual rotation for visual interest (but keep positions deterministic)
      const rotation = (hashCode(seedStr + i + 'rot') % 20) - 10;
      
      slots.push({
        x: transformedX[i],
        y: transformedY[i],
        rotation,
        filled: i < punchCount
      });
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
  const material = materialsPalette.materials.find(m => m.id === materialId);
  
  if (!major || !minor || !material) {
    throw new Error('Invalid token data');
  }
  
  return {
    name: `Omamori #${tokenId}`,
    description: "Ancient talismans for modern traders. High-quality off-chain generative art powered by deterministic on-chain data.",
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
