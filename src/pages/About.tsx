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
              <p className="text-muted-foreground leading-relaxed">Choose from twelve Major Arcana—fundamental forces that govern all trading.  Each Major contains four Minor aspects, creating 48 possible combinations. The amount of HYPE you offer has no influence on your Omamori's traits, but may determine your talisman's strength.</p>
            </div>
            
            <div>
              <h3 className="font-mono text-lg text-primary mb-3">The Punches</h3>
              <p className="text-muted-foreground leading-relaxed">Each Omamori contains a diamond of up to 26 potential punches—sacred marks that channel an energy of unknown outcomes. </p>
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
        
      </div>
    </Layout>;
}