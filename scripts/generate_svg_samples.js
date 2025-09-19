#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Major arcanum names
const majors = [
    "Liquidity", "Leverage", "Volatility", "Narrative", "The Macro", "Discipline",
    "FOMO", "FUD", "RNG", "Max Pain", "The Chat", "Ego"
];

// Minor aspect names by major
const minors = {
    0: ["Fills", "Market-Maker", "Spread", "Volume"],
    1: ["Margin", "Liqd", "Max Long", "Max Short"],
    2: ["Pump", "Dump", "Chop", "Pattern"],
    3: ["Insider", "Hype", "News", "Cope"],
    4: ["Regulator", "Bear", "Bull", "Black Swan"],
    5: ["Take Profit", "Size", "Strategy", "Sideline"],
    6: ["BTFD", "Top Signal", "Market Price", "Conviction"],
    7: ["Shills", "PsyOps", "Rugs", "Scam"],
    8: ["Mints", "Order Routing", "Uptime", "Prediction"],
    9: ["Too Early", "Too Late", "Too Little", "Too Much"],
    10: ["Alpha", "Slop", "In", "Out"],
    11: ["Touch Grass", "Hyperliquid", "Family", "Needs"]
};

async function generateSVGSamples() {
    console.log('🎨 Generating SVG samples for visual inspection...\n');
    
    // Create output directory
    const outputDir = path.join(__dirname, '..', 'svg_samples');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    
    // Test combinations to generate
    const testCombinations = [
        // All majors with first minor
        ...Array.from({length: 12}, (_, i) => ({majorId: i, minorId: 0, description: `${majors[i]}_${minors[i][0]}`})),
        
        // All minors for Discipline (our test case)
        ...Array.from({length: 4}, (_, i) => ({majorId: 5, minorId: i, description: `Discipline_${minors[5][i]}`})),
        
        // All minors for Leverage (complex lever designs)
        ...Array.from({length: 4}, (_, i) => ({majorId: 1, minorId: i, description: `Leverage_${minors[1][i]}`})),
        
        // All minors for RNG (braille patterns)
        ...Array.from({length: 4}, (_, i) => ({majorId: 8, minorId: i, description: `RNG_${minors[8][i]}`})),
        
        // All minors for FOMO (triangle variations)
        ...Array.from({length: 4}, (_, i) => ({majorId: 6, minorId: i, description: `FOMO_${minors[6][i]}`})),
    ];
    
    console.log(`Generating ${testCombinations.length} SVG samples...\n`);
    
    for (let i = 0; i < testCombinations.length; i++) {
        const {majorId, minorId, description} = testCombinations[i];
        
        try {
            console.log(`[${i+1}/${testCombinations.length}] Generating: ${description}`);
            
            // Create a temporary test file
            const testContent = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../contracts/OmamoriNFTSingle.sol";

contract SVGSampleTest is Test {
    OmamoriNFTSingle public nft;
    
    function setUp() public {
        nft = new OmamoriNFTSingle();
    }
    
    function testGenerateSVG() public {
        nft.mint{value: 0.01 ether}(${majorId}, ${minorId});
        string memory tokenURI = nft.tokenURI(1);
        console.log("TokenURI:", tokenURI);
    }
}`;
            
            fs.writeFileSync(path.join(__dirname, '..', 'test', 'TempSVGTest.t.sol'), testContent);
            
            // Run the test and capture output
            const output = execSync('forge test --match-test testGenerateSVG -vv', {
                cwd: path.join(__dirname, '..'),
                encoding: 'utf8'
            });
            
            // Extract the TokenURI from the output
            const tokenURIMatch = output.match(/TokenURI: (data:application\/json;base64,[A-Za-z0-9+/=]+)/);
            if (!tokenURIMatch) {
                console.log(`❌ Failed to extract TokenURI for ${description}`);
                continue;
            }
            
            const tokenURI = tokenURIMatch[1];
            
            // Decode the JSON
            const base64Json = tokenURI.replace('data:application/json;base64,', '');
            const jsonStr = Buffer.from(base64Json, 'base64').toString('utf8');
            const metadata = JSON.parse(jsonStr);
            
            // Extract and decode the SVG
            const base64Svg = metadata.image.replace('data:image/svg+xml;base64,', '');
            const svgContent = Buffer.from(base64Svg, 'base64').toString('utf8');
            
            // Save the SVG file
            const filename = `${String(i+1).padStart(3, '0')}_${description.replace(/[^a-zA-Z0-9]/g, '_')}.svg`;
            const filepath = path.join(outputDir, filename);
            fs.writeFileSync(filepath, svgContent);
            
            // Also save metadata for reference
            const metadataFilename = `${String(i+1).padStart(3, '0')}_${description.replace(/[^a-zA-Z0-9]/g, '_')}_metadata.json`;
            const metadataFilepath = path.join(outputDir, metadataFilename);
            fs.writeFileSync(metadataFilepath, JSON.stringify(metadata, null, 2));
            
            console.log(`✅ Saved: ${filename}`);
            
        } catch (error) {
            console.log(`❌ Error generating ${description}:`, error.message);
        }
    }
    
    // Clean up temp file
    try {
        fs.unlinkSync(path.join(__dirname, '..', 'test', 'TempSVGTest.t.sol'));
    } catch (e) {
        // Ignore cleanup errors
    }
    
    console.log(`\n🎉 Generated ${testCombinations.length} SVG samples in: ${outputDir}`);
    console.log('\n📋 Summary:');
    console.log('- All 12 major arcanum with first minor aspect');
    console.log('- All 4 minor aspects for Discipline');
    console.log('- All 4 minor aspects for Leverage');
    console.log('- All 4 minor aspects for RNG');
    console.log('- All 4 minor aspects for FOMO');
    console.log('\nYou can now open these SVG files in your browser to visually inspect the art!');
}

// Run the generator
generateSVGSamples().catch(console.error);

