// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title OmamoriGlyphs
 * @notice Library for rendering Major and Minor glyphs using only SVG primitives
 * @dev No text or emoji - only geometric shapes (line, rect, circle, polygon, polyline)
 * @author Hyper Faith Team
 */
library OmamoriGlyphs {
    
    /**
     * @notice Render a Major glyph in the top-left cluster (x=220..380, y=320..600)
     * @param majorId Major glyph ID (0-11)
     * @return SVG string containing the glyph elements
     * @dev Uses only SVG primitives, no text or emoji
     */
    function renderMajor(uint8 majorId) external pure returns (string memory) {
        if (majorId == 0) {
            // Liquidity — three pillars
            return string(abi.encodePacked(
                '<line x1="260" y1="360" x2="260" y2="520" stroke-width="6"/>',
                '<line x1="300" y1="360" x2="300" y2="520" stroke-width="6"/>',
                '<line x1="340" y1="360" x2="340" y2="520" stroke-width="6"/>'
            ));
        } else if (majorId == 1) {
            // Leverage — lever + fulcrum
            return string(abi.encodePacked(
                '<line x1="230" y1="540" x2="360" y2="410" stroke-width="6"/>',
                '<circle cx="285" cy="540" r="6" fill="currentColor"/>'
            ));
        } else if (majorId == 2) {
            // Volatility — zigzag bolt
            return '<polyline points="230,420 280,470 255,495 320,560 360,520" fill="none" stroke-width="6"/>';
        } else if (majorId == 3) {
            // Narrative — spiral-ish scroll
            return string(abi.encodePacked(
                '<circle cx="300" cy="470" r="38" fill="none" stroke-width="6"/>',
                '<circle cx="300" cy="480" r="16" fill="none" stroke-width="6"/>'
            ));
        } else if (majorId == 4) {
            // The Macro — world axis
            return string(abi.encodePacked(
                '<circle cx="300" cy="470" r="70" fill="none" stroke-width="6"/>',
                '<line x1="300" y1="400" x2="300" y2="540" stroke-width="6"/>'
            ));
        } else if (majorId == 5) {
            // Discipline — frame
            return '<rect x="230" y="390" width="140" height="140" rx="4" ry="4" fill="none" stroke-width="6"/>';
        } else if (majorId == 6) {
            // FOMO — up triangle
            return '<polygon points="300,380 390,560 210,560" fill="none" stroke-width="6"/>';
        } else if (majorId == 7) {
            // FUD — down triangle
            return '<polygon points="210,380 390,380 300,560" fill="none" stroke-width="6"/>';
        } else if (majorId == 8) {
            // RNG — braille cell (2x3)
            return string(abi.encodePacked(
                '<circle cx="270" cy="430" r="7" fill="currentColor"/>',
                '<circle cx="330" cy="430" r="7" fill="currentColor"/>',
                '<circle cx="270" cy="470" r="7" fill="currentColor"/>',
                '<circle cx="330" cy="470" r="7" fill="currentColor"/>',
                '<circle cx="270" cy="510" r="7" fill="currentColor"/>',
                '<circle cx="330" cy="510" r="7" fill="currentColor"/>'
            ));
        } else if (majorId == 9) {
            // Max Pain — X cross
            return string(abi.encodePacked(
                '<line x1="240" y1="410" x2="360" y2="530" stroke-width="6"/>',
                '<line x1="360" y1="410" x2="240" y2="530" stroke-width="6"/>'
            ));
        } else if (majorId == 10) {
            // The Chat — signal bars + ping
            return string(abi.encodePacked(
                '<circle cx="300" cy="400" r="6" fill="currentColor"/>',
                '<line x1="250" y1="460" x2="350" y2="460" stroke-width="8"/>',
                '<line x1="250" y1="500" x2="350" y2="500" stroke-width="6"/>'
            ));
        } else if (majorId == 11) {
            // Ego — lozenge eye + pupil
            return string(abi.encodePacked(
                '<polygon points="300,410 360,470 300,530 240,470" fill="none" stroke-width="6"/>',
                '<circle cx="300" cy="470" r="8" fill="currentColor"/>'
            ));
        }
        
        revert("OmamoriGlyphs: Invalid major ID");
    }

    /**
     * @notice Render a Minor glyph in the bottom-right cluster (x=700..860, y=980..1180)
     * @param majorId Major glyph ID (0-11) that determines the minor set
     * @param minorId Minor glyph ID within the major (0-3)
     * @return SVG string containing the glyph elements
     * @dev Each major has exactly 4 minors, uses only SVG primitives
     */
    function renderMinor(uint8 majorId, uint8 minorId) external pure returns (string memory) {
        if (majorId == 0) {
            // Liquidity: Fills, Market-Maker, Spread, Volume
            if (minorId == 0) {
                // Fills: pillars + caps
                return string(abi.encodePacked(
                    '<line x1="740" y1="1000" x2="740" y2="1140" stroke-width="6"/>',
                    '<line x1="780" y1="1000" x2="780" y2="1140" stroke-width="6"/>',
                    '<line x1="820" y1="1000" x2="820" y2="1140" stroke-width="6"/>',
                    '<line x1="730" y1="1000" x2="750" y2="1000" stroke-width="6"/>',
                    '<line x1="770" y1="1000" x2="790" y2="1000" stroke-width="6"/>',
                    '<line x1="810" y1="1000" x2="830" y2="1000" stroke-width="6"/>',
                    '<line x1="730" y1="1140" x2="750" y2="1140" stroke-width="6"/>',
                    '<line x1="770" y1="1140" x2="790" y2="1140" stroke-width="6"/>',
                    '<line x1="810" y1="1140" x2="830" y2="1140" stroke-width="6"/>'
                ));
            } else if (minorId == 1) {
                // Market-Maker: crossbar
                return string(abi.encodePacked(
                    '<line x1="740" y1="1000" x2="740" y2="1140" stroke-width="6"/>',
                    '<line x1="780" y1="1000" x2="780" y2="1140" stroke-width="6"/>',
                    '<line x1="820" y1="1000" x2="820" y2="1140" stroke-width="6"/>',
                    '<line x1="740" y1="1070" x2="820" y2="1070" stroke-width="6"/>'
                ));
            } else if (minorId == 2) {
                // Spread: uneven spacing
                return string(abi.encodePacked(
                    '<line x1="730" y1="1000" x2="730" y2="1140" stroke-width="6"/>',
                    '<line x1="780" y1="1000" x2="780" y2="1140" stroke-width="6"/>',
                    '<line x1="850" y1="1000" x2="850" y2="1140" stroke-width="6"/>'
                ));
            } else if (minorId == 3) {
                // Volume: mid dots
                return string(abi.encodePacked(
                    '<line x1="740" y1="1000" x2="740" y2="1140" stroke-width="6"/>',
                    '<line x1="780" y1="1000" x2="780" y2="1140" stroke-width="6"/>',
                    '<line x1="820" y1="1000" x2="820" y2="1140" stroke-width="6"/>',
                    '<circle cx="760" cy="1070" r="6" fill="currentColor"/>',
                    '<circle cx="800" cy="1070" r="6" fill="currentColor"/>'
                ));
            }
        } else if (majorId == 1) {
            // Leverage: Margin, Liqd, Max Long, Max Short
            if (minorId == 0) {
                // Margin: higher fulcrum
                return string(abi.encodePacked(
                    '<line x1="710" y1="1120" x2="850" y2="1000" stroke-width="6"/>',
                    '<circle cx="780" cy="1090" r="6" fill="currentColor"/>'
                ));
            } else if (minorId == 1) {
                // Liqd: blade at tip
                return string(abi.encodePacked(
                    '<line x1="710" y1="1120" x2="850" y2="1000" stroke-width="6"/>',
                    '<polygon points="850,1000 862,1008 850,1016" fill="currentColor" stroke-width="6"/>',
                    '<circle cx="780" cy="1120" r="6" fill="currentColor"/>'
                ));
            } else if (minorId == 2) {
                // Max Long: steeper up
                return string(abi.encodePacked(
                    '<line x1="710" y1="1140" x2="860" y2="980" stroke-width="6"/>',
                    '<circle cx="780" cy="1140" r="6" fill="currentColor"/>'
                ));
            } else if (minorId == 3) {
                // Max Short: down
                return string(abi.encodePacked(
                    '<line x1="710" y1="1000" x2="860" y2="1140" stroke-width="6"/>',
                    '<circle cx="780" cy="1000" r="6" fill="currentColor"/>'
                ));
            }
        } else if (majorId == 2) {
            // Volatility: Pump, Dump, Chop, Pattern
            if (minorId == 0) {
                // Pump
                return '<polyline points="720,1030 770,1080 745,1105 820,1160 860,1120" fill="none" stroke-width="6"/>';
            } else if (minorId == 1) {
                // Dump
                return '<polyline points="860,1030 810,1080 835,1105 760,1160 720,1120" fill="none" stroke-width="6"/>';
            } else if (minorId == 2) {
                // Chop
                return '<polyline points="720,1060 740,1080 760,1060 780,1080 800,1060 820,1080 840,1060" fill="none" stroke-width="6"/>';
            } else if (minorId == 3) {
                // Pattern (symmetrized)
                return '<polyline points="720,1060 760,1100 740,1120 800,1160 860,1120" fill="none" stroke-width="6"/>';
            }
        } else if (majorId == 3) {
            // Narrative: Insider, Hype, News, Cope
            if (minorId == 0) {
                // Insider: tight inner curl
                return string(abi.encodePacked(
                    '<circle cx="800" cy="1080" r="34" fill="none" stroke-width="6"/>',
                    '<circle cx="800" cy="1090" r="14" fill="none" stroke-width="6"/>'
                ));
            } else if (minorId == 1) {
                // Hype: larger outer
                return string(abi.encodePacked(
                    '<circle cx="800" cy="1080" r="44" fill="none" stroke-width="6"/>',
                    '<circle cx="800" cy="1090" r="16" fill="none" stroke-width="6"/>'
                ));
            } else if (minorId == 2) {
                // News: tail then curl
                return string(abi.encodePacked(
                    '<line x1="740" y1="1080" x2="780" y2="1080" stroke-width="6"/>',
                    '<circle cx="820" cy="1080" r="34" fill="none" stroke-width="6"/>'
                ));
            } else if (minorId == 3) {
                // Cope: open inner gap
                return string(abi.encodePacked(
                    '<circle cx="800" cy="1080" r="40" fill="none" stroke-width="6"/>',
                    '<line x1="792" y1="1080" x2="808" y2="1080" stroke-width="6"/>'
                ));
            }
        } else if (majorId == 4) {
            // The Macro: Regulator, Bear, Bull, Black Swan
            if (minorId == 0) {
                // Regulator: top bar
                return string(abi.encodePacked(
                    '<circle cx="800" cy="1080" r="60" fill="none" stroke-width="6"/>',
                    '<line x1="770" y1="1005" x2="830" y2="1005" stroke-width="6"/>',
                    '<line x1="800" y1="1020" x2="800" y2="1140" stroke-width="6"/>'
                ));
            } else if (minorId == 1) {
                // Bear: heavier bottom arc
                return string(abi.encodePacked(
                    '<circle cx="800" cy="1080" r="60" fill="none" stroke-width="6"/>',
                    '<path d="M 740 1080 A 60 60 0 0 0 860 1080" fill="none" stroke-width="8"/>'
                ));
            } else if (minorId == 2) {
                // Bull: heavier top arc
                return string(abi.encodePacked(
                    '<circle cx="800" cy="1080" r="60" fill="none" stroke-width="6"/>',
                    '<path d="M 740 1080 A 60 60 0 0 1 860 1080" fill="none" stroke-width="8"/>'
                ));
            } else if (minorId == 3) {
                // Black Swan: off-axis dot
                return string(abi.encodePacked(
                    '<circle cx="800" cy="1080" r="60" fill="none" stroke-width="6"/>',
                    '<circle cx="845" cy="1035" r="6" fill="currentColor"/>'
                ));
            }
        } else if (majorId == 5) {
            // Discipline: Take Profit, Size, Strategy, Sideline
            if (minorId == 0) {
                // Take Profit: top tick
                return string(abi.encodePacked(
                    '<rect x="730" y="1020" width="140" height="140" rx="4" ry="4" fill="none" stroke-width="6"/>',
                    '<circle cx="800" cy="1020" r="5" fill="currentColor"/>'
                ));
            } else if (minorId == 1) {
                // Size: inner frame
                return string(abi.encodePacked(
                    '<rect x="730" y="1020" width="140" height="140" rx="4" ry="4" fill="none" stroke-width="6"/>',
                    '<rect x="750" y="1040" width="100" height="100" rx="4" ry="4" fill="none" stroke-width="6"/>'
                ));
            } else if (minorId == 2) {
                // Strategy: grid
                return string(abi.encodePacked(
                    '<rect x="730" y="1020" width="140" height="140" rx="4" ry="4" fill="none" stroke-width="6"/>',
                    '<line x1="800" y1="1020" x2="800" y2="1160" stroke-width="6"/>',
                    '<line x1="730" y1="1090" x2="870" y2="1090" stroke-width="6"/>'
                ));
            } else if (minorId == 3) {
                // Sideline: missing right edge
                return string(abi.encodePacked(
                    '<line x1="730" y1="1020" x2="870" y2="1020" stroke-width="6"/>',
                    '<line x1="730" y1="1020" x2="730" y2="1160" stroke-width="6"/>',
                    '<line x1="730" y1="1160" x2="870" y2="1160" stroke-width="6"/>'
                ));
            }
        } else if (majorId == 6) {
            // FOMO: BTFD, Top Signal, Market Price, Conviction
            if (minorId == 0) {
                // BTFD: small inverted wedge at base
                return string(abi.encodePacked(
                    '<polygon points="800,1000 880,1160 720,1160" fill="none" stroke-width="6"/>',
                    '<polygon points="800,1160 774,1134 826,1134" fill="none" stroke-width="6"/>'
                ));
            } else if (minorId == 1) {
                // Top Signal: dot at apex
                return string(abi.encodePacked(
                    '<polygon points="800,1000 880,1160 720,1160" fill="none" stroke-width="6"/>',
                    '<circle cx="800" cy="1000" r="6" fill="currentColor"/>'
                ));
            } else if (minorId == 2) {
                // Market Price: midline
                return string(abi.encodePacked(
                    '<polygon points="800,1000 880,1160 720,1160" fill="none" stroke-width="6"/>',
                    '<line x1="760" y1="1115" x2="840" y2="1115" stroke-width="6"/>'
                ));
            } else if (minorId == 3) {
                // Conviction: double outline
                return string(abi.encodePacked(
                    '<polygon points="800,1000 880,1160 720,1160" fill="none" stroke-width="6"/>',
                    '<polygon points="800,1014 866,1146 734,1146" fill="none" stroke-width="6"/>'
                ));
            }
        } else if (majorId == 7) {
            // FUD: Shills, PsyOps, Rugs, Scam
            if (minorId == 0) {
                // Shills: side notches
                return string(abi.encodePacked(
                    '<polygon points="720,1000 880,1000 800,1160" fill="none" stroke-width="6"/>',
                    '<line x1="740" y1="1080" x2="750" y2="1080" stroke-width="6"/>',
                    '<line x1="850" y1="1080" x2="860" y2="1080" stroke-width="6"/>'
                ));
            } else if (minorId == 1) {
                // PsyOps: split base
                return string(abi.encodePacked(
                    '<polygon points="720,1000 880,1000 800,1160" fill="none" stroke-width="6"/>',
                    '<line x1="760" y1="1000" x2="790" y2="1000" stroke-width="6"/>',
                    '<line x1="810" y1="1000" x2="840" y2="1000" stroke-width="6"/>'
                ));
            } else if (minorId == 2) {
                // Rugs: trapdoor at tip
                return string(abi.encodePacked(
                    '<polygon points="720,1000 880,1000 800,1160" fill="none" stroke-width="6"/>',
                    '<rect x="796" y="1160" width="8" height="10" rx="4" ry="4" fill="currentColor" stroke-width="6"/>'
                ));
            } else if (minorId == 3) {
                // Scam: hollow ghost
                return string(abi.encodePacked(
                    '<polygon points="720,1000 880,1000 800,1160" fill="none" stroke-width="6"/>',
                    '<polygon points="740,1020 860,1020 800,1140" fill="none" stroke-width="4"/>'
                ));
            }
        } else if (majorId == 8) {
            // RNG: Mints, Order Routing, Uptime, Prediction
            if (minorId == 0) {
                // Mints: top row only
                return string(abi.encodePacked(
                    '<circle cx="780" cy="1020" r="7" fill="currentColor"/>',
                    '<circle cx="820" cy="1020" r="7" fill="currentColor"/>'
                ));
            } else if (minorId == 1) {
                // Order Routing: left column
                return string(abi.encodePacked(
                    '<circle cx="780" cy="1020" r="7" fill="currentColor"/>',
                    '<circle cx="780" cy="1080" r="7" fill="currentColor"/>',
                    '<circle cx="780" cy="1140" r="7" fill="currentColor"/>'
                ));
            } else if (minorId == 2) {
                // Uptime: right column
                return string(abi.encodePacked(
                    '<circle cx="820" cy="1020" r="7" fill="currentColor"/>',
                    '<circle cx="820" cy="1080" r="7" fill="currentColor"/>',
                    '<circle cx="820" cy="1140" r="7" fill="currentColor"/>'
                ));
            } else if (minorId == 3) {
                // Prediction: diagonal
                return string(abi.encodePacked(
                    '<circle cx="780" cy="1020" r="7" fill="currentColor"/>',
                    '<circle cx="800" cy="1080" r="7" fill="currentColor"/>',
                    '<circle cx="820" cy="1140" r="7" fill="currentColor"/>'
                ));
            }
        } else if (majorId == 9) {
            // Max Pain: Too Early, Too Late, Too Little, Too Much
            if (minorId == 0) {
                // Too Early: X shifted up
                return string(abi.encodePacked(
                    '<line x1="740" y1="1000" x2="860" y2="1120" stroke-width="6"/>',
                    '<line x1="860" y1="1000" x2="740" y2="1120" stroke-width="6"/>'
                ));
            } else if (minorId == 1) {
                // Too Late: X shifted down
                return string(abi.encodePacked(
                    '<line x1="740" y1="1040" x2="860" y2="1160" stroke-width="6"/>',
                    '<line x1="860" y1="1040" x2="740" y2="1160" stroke-width="6"/>'
                ));
            } else if (minorId == 2) {
                // Too Little: small x
                return string(abi.encodePacked(
                    '<line x1="770" y1="1050" x2="830" y2="1110" stroke-width="6"/>',
                    '<line x1="830" y1="1050" x2="770" y2="1110" stroke-width="6"/>'
                ));
            } else if (minorId == 3) {
                // Too Much: X + center dot
                return string(abi.encodePacked(
                    '<line x1="740" y1="1020" x2="860" y2="1140" stroke-width="6"/>',
                    '<line x1="860" y1="1020" x2="740" y2="1140" stroke-width="6"/>',
                    '<circle cx="800" cy="1080" r="8" fill="currentColor"/>'
                ));
            }
        } else if (majorId == 10) {
            // The Chat: Alpha, Slop, In, Out
            if (minorId == 0) {
                // Alpha: thicker top bar
                return string(abi.encodePacked(
                    '<circle cx="800" cy="1000" r="6" fill="currentColor"/>',
                    '<line x1="750" y1="1060" x2="850" y2="1060" stroke-width="10"/>',
                    '<line x1="750" y1="1100" x2="850" y2="1100" stroke-width="6"/>'
                ));
            } else if (minorId == 1) {
                // Slop: wavy bottom
                return string(abi.encodePacked(
                    '<circle cx="800" cy="1000" r="6" fill="currentColor"/>',
                    '<line x1="750" y1="1060" x2="850" y2="1060" stroke-width="6"/>',
                    '<polyline points="750,1100 770,1110 790,1095 810,1110 830,1095 850,1110" fill="none" stroke-width="6"/>'
                ));
            } else if (minorId == 2) {
                // In: left chevron
                return string(abi.encodePacked(
                    '<line x1="750" y1="1060" x2="850" y2="1060" stroke-width="6"/>',
                    '<line x1="750" y1="1100" x2="850" y2="1100" stroke-width="6"/>',
                    '<polygon points="750,1060 760,1052 760,1068" fill="currentColor" stroke-width="6"/>'
                ));
            } else if (minorId == 3) {
                // Out: right chevron
                return string(abi.encodePacked(
                    '<line x1="750" y1="1060" x2="850" y2="1060" stroke-width="6"/>',
                    '<line x1="750" y1="1100" x2="850" y2="1100" stroke-width="6"/>',
                    '<polygon points="850,1060 840,1052 840,1068" fill="currentColor" stroke-width="6"/>'
                ));
            }
        } else if (majorId == 11) {
            // Ego: Touch Grass, Hyperliquid, Family, Needs
            if (minorId == 0) {
                // Touch Grass: eye without pupil
                return '<polygon points="800,1010 870,1080 800,1150 730,1080" fill="none" stroke-width="6"/>';
            } else if (minorId == 1) {
                // Hyperliquid: halo circle
                return string(abi.encodePacked(
                    '<circle cx="800" cy="1080" r="84" fill="none" stroke-width="6"/>',
                    '<polygon points="800,1010 870,1080 800,1150 730,1080" fill="none" stroke-width="6"/>',
                    '<circle cx="800" cy="1080" r="6" fill="currentColor"/>'
                ));
            } else if (minorId == 2) {
                // Family: two side dots
                return string(abi.encodePacked(
                    '<polygon points="800,1010 870,1080 800,1150 730,1080" fill="none" stroke-width="6"/>',
                    '<circle cx="760" cy="1080" r="6" fill="currentColor"/>',
                    '<circle cx="840" cy="1080" r="6" fill="currentColor"/>'
                ));
            } else if (minorId == 3) {
                // Needs: four corner dots
                return string(abi.encodePacked(
                    '<polygon points="800,1010 870,1080 800,1150 730,1080" fill="none" stroke-width="6"/>',
                    '<circle cx="800" cy="1010" r="6" fill="currentColor"/>',
                    '<circle cx="870" cy="1080" r="6" fill="currentColor"/>',
                    '<circle cx="800" cy="1150" r="6" fill="currentColor"/>',
                    '<circle cx="730" cy="1080" r="6" fill="currentColor"/>'
                ));
            }
        }
        
        revert("OmamoriGlyphs: Invalid major or minor ID");
    }
}
