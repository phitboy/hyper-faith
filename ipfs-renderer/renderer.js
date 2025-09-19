// Omamori SVG Renderer - Node.js version adapted from frontend
import fs from 'fs';
import path from 'path';

// Load data files
const majorsData = JSON.parse(fs.readFileSync('./data/majors.json', 'utf8'));
const materialsData = JSON.parse(fs.readFileSync('./data/materials.json', 'utf8'));
const materialsPalette = JSON.parse(fs.readFileSync('./data/materialsPalette.json', 'utf8'));

// SVG helper functions
class SvgHelpers {
  static line(x1, y1, x2, y2, sw, color = "#111") {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}"/>`;
  }

  static rect(x, y, w, h, sw, filled, color = "#111") {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" ry="4" stroke="${color}" stroke-width="${sw}" ${filled ? `fill="${color}"` : 'fill="none"'}/>`;
  }

  static circle(cx, cy, r, filled, sw = 0, color = "#111") {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" ${filled ? `fill="${color}"` : `fill="none" stroke="${color}" stroke-width="${sw}"`}/>`;
  }

  static polygon(points, sw, filled, color = "#111") {
    const pts = [];
    for (let i = 0; i < points.length; i += 2) {
      pts.push(`${points[i]},${points[i + 1]}`);
    }
    return `<polygon points="${pts.join(' ')}" stroke="${color}" stroke-width="${sw}" ${filled ? `fill="${color}"` : 'fill="none"'}/>`;
  }

  static polyline(points, sw, color = "#111") {
    const pts = [];
    for (let i = 0; i < points.length; i += 2) {
      pts.push(`${points[i]},${points[i + 1]}`);
    }
    return `<polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="${sw}"/>`;
  }
}

// Shape builders
function triUp(cx, cy, r) {
  return [cx, cy - r, cx + r, cy + r, cx - r, cy + r];
}

function triDown(cx, cy, r) {
  return [cx, cy + r, cx + r, cy - r, cx - r, cy - r];
}

function diamond(cx, cy, r) {
  return [cx, cy - r, cx + r, cy, cx, cy + r, cx - r, cy];
}

// Major glyph renderers
function renderMajorGlyph(majorId, color = "#111") {
  const major = majorsData[majorId];
  if (!major) return '';

  switch (majorId) {
    case 0: // Liquidity — three pillars
      return [
        SvgHelpers.line(260, 360, 260, 520, 6, color),
        SvgHelpers.line(300, 360, 300, 520, 6, color),
        SvgHelpers.line(340, 360, 340, 520, 6, color)
      ].join('');

    case 1: // Leverage — lever + fulcrum
      return [
        SvgHelpers.line(230, 540, 360, 410, 6, color),
        SvgHelpers.circle(285, 540, 6, true, 0, color)
      ].join('');

    case 2: // Volatility — zigzag bolt
      return SvgHelpers.polyline([230, 420, 280, 470, 255, 495, 320, 560, 360, 520], 6, color);

    case 3: // Narrative — spiral scroll
      return [
        SvgHelpers.circle(300, 470, 38, false, 6, color),
        SvgHelpers.circle(300, 480, 16, false, 6, color)
      ].join('');

    case 4: // The Macro — world axis
      return [
        SvgHelpers.circle(300, 470, 70, false, 6, color),
        SvgHelpers.line(300, 400, 300, 540, 6, color)
      ].join('');

    case 5: // Discipline — frame
      return SvgHelpers.rect(230, 390, 140, 140, 6, false, color);

    case 6: // FOMO — up triangle
      return SvgHelpers.polygon(triUp(300, 470, 90), 6, false, color);

    case 7: // FUD — down triangle
      return SvgHelpers.polygon(triDown(300, 470, 90), 6, false, color);

    case 8: // RNG — braille cell (2x3)
      return [
        SvgHelpers.circle(270, 430, 7, true, 0, color),
        SvgHelpers.circle(330, 430, 7, true, 0, color),
        SvgHelpers.circle(270, 470, 7, true, 0, color),
        SvgHelpers.circle(330, 470, 7, true, 0, color),
        SvgHelpers.circle(270, 510, 7, true, 0, color),
        SvgHelpers.circle(330, 510, 7, true, 0, color)
      ].join('');

    case 9: // Max Pain — X cross
      return [
        SvgHelpers.line(240, 410, 360, 530, 6, color),
        SvgHelpers.line(360, 410, 240, 530, 6, color)
      ].join('');

    case 10: // The Chat — signal bars + ping
      return [
        SvgHelpers.circle(300, 400, 6, true, 0, color),
        SvgHelpers.line(250, 460, 350, 460, 8, color),
        SvgHelpers.line(250, 500, 350, 500, 6, color)
      ].join('');

    case 11: // Ego — lozenge eye + pupil
      return [
        SvgHelpers.polygon(diamond(300, 470, 60), 6, false, color),
        SvgHelpers.circle(300, 470, 8, true, 0, color)
      ].join('');

    default:
      return '';
  }
}

// Minor glyph renderers (simplified for key majors)
function renderMinorGlyph(majorId, minorId, color = "#111") {
  const major = majorsData[majorId];
  if (!major || !major.minors[minorId]) return '';

  // Position in bottom right area
  const baseX = 750;
  const baseY = 1050;

  switch (majorId) {
    case 1: // Leverage variations
      if (minorId === 0) { // Margin: higher fulcrum
        return [
          SvgHelpers.line(baseX - 40, baseY + 70, baseX + 100, baseY - 50, 6, color),
          SvgHelpers.circle(baseX + 30, baseY + 40, 6, true, 0, color)
        ].join('');
      } else if (minorId === 1) { // Liqd: blade at tip
        return [
          SvgHelpers.line(baseX - 40, baseY + 70, baseX + 100, baseY - 50, 6, color),
          SvgHelpers.polygon([baseX + 100, baseY - 50, baseX + 112, baseY - 58, baseX + 112, baseY - 42], 6, true, color),
          SvgHelpers.circle(baseX + 30, baseY + 70, 6, true, 0, color)
        ].join('');
      } else if (minorId === 2) { // Max Long: steeper up
        return [
          SvgHelpers.line(baseX - 40, baseY + 90, baseX + 110, baseY - 70, 6, color),
          SvgHelpers.circle(baseX + 30, baseY + 90, 6, true, 0, color)
        ].join('');
      } else { // Max Short: down
        return [
          SvgHelpers.line(baseX - 40, baseY - 50, baseX + 110, baseY + 90, 6, color),
          SvgHelpers.circle(baseX + 30, baseY - 50, 6, true, 0, color)
        ].join('');
      }

    default:
      // Generic minor glyph
      return SvgHelpers.polygon(triUp(baseX, baseY, 20), 6, true, color);
  }
}

// Punch layout with collision detection
function renderPunchLayout(seed, punchCount) {
  if (punchCount === 0) return '';

  // Diamond slot positions (25 slots) - relative to center (0,0)
  const slots = [
    [0, -280], [-40, -230], [40, -230], [-80, -180], [0, -180], [80, -180],
    [-120, -130], [-40, -130], [40, -130], [120, -130], [-160, -80], [-80, -80],
    [0, -80], [80, -80], [160, -80], [-120, -30], [-40, -30], [40, -30], [120, -30],
    [-80, 20], [0, 20], [80, 20], [-40, 70], [40, 70], [0, 120]
  ];

  let result = '';
  const actualCount = Math.min(punchCount, 25);
  const seedNum = parseInt(seed, 16) || parseInt(seed) || 12345;

  for (let i = 0; i < actualCount; i++) {
    const slotIndex = Math.abs((seedNum >> (i * 2)) % slots.length);
    let x = slots[slotIndex][0];
    let y = slots[slotIndex][1];

    // Add small jitter
    const jitterX = ((seedNum >> (i * 3)) % 21) - 10;
    const jitterY = ((seedNum >> (i * 3 + 8)) % 21) - 10;
    x += jitterX;
    y += jitterY;

    // Small rotation for visual interest
    const rotation = ((seedNum >> (i * 4 + 16)) % 20) - 10;

    result += `<rect x="${x - 6}" y="${y - 6}" width="12" height="12" ` +
              `fill="${i < punchCount ? '#000' : 'none'}" ` +
              `stroke="#000" stroke-width="1" ` +
              `transform="rotate(${rotation} ${x + 6} ${y + 6})" ` +
              `opacity="${i < punchCount ? '0.8' : '0.3'}"/>`;
  }

  return result;
}

// Main render function
export function renderOmamoriSVG(tokenData) {
  const {
    seed,
    materialId,
    majorId,
    minorId,
    punchCount,
    materialName,
    materialTier
  } = tokenData;

  // Get material colors
  const material = materialsPalette.materials.find(m => m.id === materialId);
  const bgColor = material?.bg || '#b87333';
  const strokeColor = material?.stroke || '#8b4513';

  // Generate glyphs
  const majorGlyph = renderMajorGlyph(majorId, strokeColor);
  const minorGlyph = renderMinorGlyph(majorId, minorId, strokeColor);
  
  // Generate punch layout (positioned at 500,700 with relative coordinates)
  const punches = renderPunchLayout(seed, punchCount);

  // Assemble complete SVG (1000x1400 matching frontend exactly)
  return `<svg viewBox="0 0 1000 1400" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="1000" height="1400" fill="${bgColor}"/>
    
    <!-- Main tablet frame -->
    <rect x="100" y="150" width="800" height="1100" rx="40" ry="40" 
          fill="${bgColor}" stroke="${strokeColor}" stroke-width="6"/>
    
    <!-- Content groups with stroke color -->
    <g stroke="${strokeColor}" stroke-width="6" fill="none">
      ${majorGlyph}
      ${minorGlyph}
    </g>
    
    <!-- Punch diamond (positioned at 500,700 with relative coordinates) -->
    <g transform="translate(500, 700)">
      ${punches}
    </g>
    
    <!-- Material label -->
    <text x="500" y="1300" 
          font-family="JetBrains Mono, monospace" 
          font-size="24" 
          font-weight="500" 
          fill="${strokeColor}" 
          text-anchor="middle">
      ${materialName.toUpperCase()}
    </text>
    
    <!-- Tier indicator -->
    <text x="500" y="1330" 
          font-family="Inter, sans-serif" 
          font-size="16" 
          fill="${strokeColor}" 
          text-anchor="middle" 
          opacity="0.7">
      ${materialTier}
    </text>
  </svg>`;
}
