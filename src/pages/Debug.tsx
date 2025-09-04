import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OmamoriPreview } from "@/components/OmamoriPreview";
import { useOmamoriStore } from "@/store/omamoriStore";
import { pickMaterial, getPunchCount, generateSeed } from "@/lib/utils/materialPicker";
import { materials } from "@/data/materials.json";
import { useToast } from "@/hooks/use-toast";

export default function Debug() {
  const { toast } = useToast();
  const { reset } = useOmamoriStore();
  const [testSeed, setTestSeed] = useState(generateSeed());
  const [materialStats, setMaterialStats] = useState<Record<string, { count: number; percentage: number }>>({});
  const [isGeneratingStats, setIsGeneratingStats] = useState(false);

  // Check if debug mode is enabled
  const isDebugEnabled = import.meta.env.VITE_DEBUG === 'true' || 
                        import.meta.env.NODE_ENV === 'development';

  if (!isDebugEnabled) {
    return (
      <Layout>
        <div className="text-center py-20 space-y-6">
          <h1 className="font-mono text-4xl font-bold">Debug Mode Disabled</h1>
          <p className="text-xl text-muted-foreground">
            Debug utilities are only available in development mode
          </p>
        </div>
      </Layout>
    );
  }

  const handleReseedMocks = () => {
    // Clear localStorage and reset store
    localStorage.removeItem('omamori-store');
    reset();
    
    toast({
      title: "Mocks Reset",
      description: "All mock data has been cleared and store reset",
    });
  };

  const handleNewSeed = () => {
    setTestSeed(generateSeed());
    toast({
      title: "New Seed Generated",
      description: `Seed: ${testSeed}`,
    });
  };

  const generateMaterialStats = async () => {
    setIsGeneratingStats(true);
    
    const stats: Record<string, { count: number; percentage: number }> = {};
    const iterations = 10000;
    
    // Initialize stats
    materials.forEach(material => {
      stats[material.name] = { count: 0, percentage: 0 };
    });
    
    // Generate samples
    for (let i = 0; i < iterations; i++) {
      const seed = generateSeed();
      const material = pickMaterial(seed);
      stats[material.name].count++;
    }
    
    // Calculate percentages
    Object.keys(stats).forEach(materialName => {
      stats[materialName].percentage = (stats[materialName].count / iterations) * 100;
    });
    
    setMaterialStats(stats);
    setIsGeneratingStats(false);
    
    toast({
      title: "Material Stats Generated",
      description: `Analyzed ${iterations} random samples`,
    });
  };

  const testMaterial = pickMaterial(testSeed);
  const testPunchCount = getPunchCount(testSeed);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="font-mono text-4xl font-bold">Debug Utilities</h1>
          <p className="text-xl text-muted-foreground">
            Development tools for testing and debugging Omamori generation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Tools */}
          <div className="space-y-6">
            {/* Mock Management */}
            <Card className="p-6">
              <h2 className="font-mono text-lg mb-4">Mock Data Management</h2>
              <div className="space-y-3">
                <Button
                  onClick={handleReseedMocks}
                  variant="destructive"
                  className="w-full font-mono"
                >
                  Reset All Mock Data
                </Button>
                <p className="text-sm text-muted-foreground">
                  Clears all locally stored tokens and resets the application state
                </p>
              </div>
            </Card>

            {/* Seed Testing */}
            <Card className="p-6">
              <h2 className="font-mono text-lg mb-4">Seed Testing</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Test Seed</label>
                  <div className="flex gap-2">
                    <Input
                      value={testSeed}
                      onChange={(e) => setTestSeed(e.target.value)}
                      className="font-mono"
                      placeholder="Enter seed..."
                    />
                    <Button onClick={handleNewSeed} variant="outline">
                      New
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Material:</span>
                    <span className="font-mono">{testMaterial.name} ({testMaterial.tier})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Punch Count:</span>
                    <span className="font-mono">{testPunchCount}/25</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Material Statistics */}
            <Card className="p-6">
              <h2 className="font-mono text-lg mb-4">Material Distribution</h2>
              <div className="space-y-4">
                <Button
                  onClick={generateMaterialStats}
                  disabled={isGeneratingStats}
                  className="w-full font-mono"
                >
                  {isGeneratingStats ? 'Generating...' : 'Generate Stats (10k samples)'}
                </Button>
                
                {Object.keys(materialStats).length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {materials
                      .sort((a, b) => (materialStats[b.name]?.percentage || 0) - (materialStats[a.name]?.percentage || 0))
                      .map(material => {
                        const stat = materialStats[material.name];
                        if (!stat) return null;
                        
                        const expectedPercentage = (material.weight / 1000000000) * 100;
                        const getTierColor = (tier: string) => {
                          switch (tier) {
                            case 'Common': return 'text-common';
                            case 'Uncommon': return 'text-uncommon';
                            case 'Rare': return 'text-rare';
                            case 'Ultra Rare': return 'text-ultra-rare';
                            case 'Mythic': return 'text-mythic';
                            default: return 'text-muted-foreground';
                          }
                        };
                        
                        return (
                          <div key={material.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className={getTierColor(material.tier)}>
                                {material.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({material.tier})
                              </span>
                            </div>
                            <div className="text-right font-mono">
                              <div>{stat.percentage.toFixed(3)}%</div>
                              <div className="text-xs text-muted-foreground">
                                exp: {expectedPercentage.toFixed(3)}%
                              </div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                )}
              </div>
            </Card>

            {/* System Info */}
            <Card className="p-6">
              <h2 className="font-mono text-lg mb-4">System Info</h2>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environment:</span>
                  <span>{import.meta.env.NODE_ENV}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Debug Mode:</span>
                  <span>{isDebugEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Materials:</span>
                  <span>{materials.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Weight:</span>
                  <span>{materials.reduce((sum, m) => sum + m.weight, 0).toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-mono text-lg mb-4">Seed Preview</h2>
              <OmamoriPreview seed={testSeed} />
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}