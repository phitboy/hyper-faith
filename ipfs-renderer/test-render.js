import { renderOmamoriSVG } from './renderer.js';

// Test data that matches what we'd get from the contract
const testTokenData = {
  seed: "0x1234567890abcdef",
  materialId: 21, // Lapis (Ultra Rare)
  majorId: 1,     // Leverage
  minorId: 0,     // Margin
  punchCount: 15,
  materialName: "Lapis",
  materialTier: "Ultra Rare"
};

console.log('🎨 Testing Omamori SVG Renderer...');
console.log('Token Data:', testTokenData);

async function test() {
  try {
    const svg = renderOmamoriSVG(testTokenData);
    
    console.log('✅ SVG Generated Successfully!');
    console.log('SVG Length:', svg.length, 'characters');
    console.log('First 200 chars:', svg.substring(0, 200) + '...');
    
    // Save to file for inspection
    const fs = await import('fs');
    fs.writeFileSync('test-output.svg', svg);
    console.log('💾 SVG saved to test-output.svg');
    
  } catch (error) {
    console.error('❌ Error generating SVG:', error);
    process.exit(1);
  }
}

test();
