import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import majorsData from "@/data/majors.json";
import { materials } from "@/data/materials.json";
export default function About() {
  const tierCounts = materials.reduce((acc, material) => {
    acc[material.tier] = (acc[material.tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Common':
        return 'text-common';
      case 'Uncommon':
        return 'text-uncommon';
      case 'Rare':
        return 'text-rare';
      case 'Ultra Rare':
        return 'text-ultra-rare';
      case 'Mythic':
        return 'text-mythic';
      default:
        return 'text-muted-foreground';
    }
  };
  const formatGlyph = (glyph: string) => {
    return glyph.split('\\n').map((line, i) => <div key={i} className="leading-none">
        {line}
      </div>);
  };
  return <Layout>
      <div className="space-y-12">
        {/* Hero */}
        <div className="text-center space-y-6">
          <h1 className="font-mono text-4xl md:text-6xl font-bold">A $HYPE Burn Protocol</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">Omamori are protective talismans traditionally carried for luck and protection. Faithful traders remove $HYPE from circulation in exchange for these blessings.</p>
        </div>

        {/* The Lore */}
        <Card className="p-8">
          <h2 className="font-mono text-2xl mb-6">The Lore</h2>
          <div className="prose prose-invert max-w-none space-y-6 text-foreground">
            <div>
              <h3 className="font-mono text-lg text-primary mb-3">Origins</h3>
              <p className="text-muted-foreground leading-relaxed">
                In the early days of electronic trading, when terminals glowed green and 
                positions were held by faith alone, traders would craft digital charms—
                ASCII art, lucky hexstrings, ritual .bat files. These became the first Omamori.
              </p>
            </div>
            
            <div>
              <h3 className="font-mono text-lg text-primary mb-3">The Ritual</h3>
              <p className="text-muted-foreground leading-relaxed">Choose from twelve Major Arcana—fundamental forces that govern all trading. 


Each Major contains four Minor aspects, creating 48 possible combinations. The amount of HYPE you offer influences the material and punch count, determining your talisman's strength.</p>
            </div>
            
            <div>
              <h3 className="font-mono text-lg text-primary mb-3">The Punches</h3>
              <p className="text-muted-foreground leading-relaxed">Each Omamori contains a diamond of up to 25 potential punches—sacred marks that channel an energy of unknown outcomes. </p>
            </div>
          </div>
        </Card>

        {/* Major Arcana */}
        <Card className="p-8">
          <h2 className="font-mono text-2xl mb-6">The Twelve Majors</h2>
          <p className="text-muted-foreground mb-8">Choose wisely— your selection influences not just the appearance of your Omamori, but its spiritual alignment with market forces.</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {majorsData.map(major => <Card key={major.id} className="p-6">
                <div className="text-center mb-4">
                  <div className="font-mono text-3xl mb-3 leading-tight glyph">
                    {formatGlyph(major.glyph)}
                  </div>
                  <h3 className="font-mono text-lg font-bold">{major.name}</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Minor Aspects:</div>
                  {major.minors.map(minor => <div key={minor.id} className="flex justify-between items-center text-sm">
                      <span>{minor.name}</span>
                      <div className="font-mono text-xs glyph">
                        {formatGlyph(minor.glyph)}
                      </div>
                    </div>)}
                </div>
              </Card>)}
          </div>
        </Card>

        {/* Materials & Rarity */}
        <Card className="p-8">
          <h2 className="font-mono text-2xl mb-6">Materials & Rarity</h2>
          <p className="text-muted-foreground mb-8">Your Omamori's material is determined by ancient probabilities. Rarer materials provide stronger protection and greater prestige.</p>
          
          <div className="space-y-6">
            {Object.entries(tierCounts).map(([tier, count]) => {
            const tierMaterials = materials.filter(m => m.tier === tier);
            const totalWeight = tierMaterials.reduce((sum, m) => sum + m.weight, 0);
            const percentage = (totalWeight / 1000000000 * 100).toFixed(3);
            return <div key={tier}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className={`font-mono text-lg ${getTierColor(tier)}`}>
                      {tier}
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      {count} materials • {percentage}% chance
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {tierMaterials.map(material => <div key={material.id} className="text-center p-3 bg-muted/50 rounded">
                        <div className="font-medium text-sm">{material.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {material.description}
                        </div>
                      </div>)}
                  </div>
                </div>;
          })}
          </div>
        </Card>

        {/* Technical Details */}
        <Card className="p-8">
          <h2 className="font-mono text-2xl mb-6">Technical Implementation</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-mono text-lg text-primary mb-3">On-Chain Data</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Major/Minor selection (6 bits)</li>
                <li>• Material ID (5 bits)</li>
                <li>• Punch count (5 bits)</li>
                <li>• HYPE burned (uint256)</li>
                <li>• Generation seed (bytes32)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-mono text-lg text-primary mb-3">SVG Generation</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Client-side rendering</li>
                <li>• Deterministic layout from seed</li>
                <li>• Hand-chiseled aesthetic</li>
                <li>• Ancient ASCII glyphs</li>
                <li>• Stone/paper textures</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <div className="text-center space-y-6">
          <h2 className="font-mono text-2xl">Ready to Mint?</h2>
          <p className="text-muted-foreground">
            Choose your path through the digital tarot. 
            Your protective talisman awaits.
          </p>
          <Button asChild size="lg" className="font-mono">
            <Link to="/">Mint Your Omamori</Link>
          </Button>
        </div>

        {/* Community Links */}
        <Card className="p-8 text-center">
          <h3 className="font-mono text-lg mb-4">Transparency</h3>
          <div className="flex justify-center space-x-6">
            <Button variant="outline" className="font-mono" disabled>
              Discord (Coming Soon)
            </Button>
            <Button variant="outline" className="font-mono" disabled>
              Twitter (Coming Soon)
            </Button>
            <Button variant="outline" className="font-mono" disabled>
              GitHub (Coming Soon)
            </Button>
          </div>
        </Card>
      </div>
    </Layout>;
}