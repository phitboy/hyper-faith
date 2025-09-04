import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOmamoriStore } from "@/store/omamoriStore";
import { getMyOmamoriMock } from "@/lib/contracts/omamori";
import type { OmamoriToken } from "@/lib/contracts/omamori";
import { Link } from "react-router-dom";
import majorsData from "@/data/majors.json";
import { Search, Filter } from "lucide-react";

export default function MyOmamori() {
  const { isConnected, myTokens, setMyTokens } = useOmamoriStore();
  const [loading, setLoading] = useState(true);
  const [filteredTokens, setFilteredTokens] = useState<OmamoriToken[]>([]);
  const [filters, setFilters] = useState({
    major: 'all',
    tier: 'all',
    punchCount: { min: 0, max: 25 },
    search: ''
  });

  useEffect(() => {
    loadMyTokens();
  }, [isConnected]);

  useEffect(() => {
    applyFilters();
  }, [myTokens, filters]);

  const loadMyTokens = async () => {
    try {
      setLoading(true);
      const tokens = await getMyOmamoriMock();
      setMyTokens(tokens);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...myTokens];

    // Major filter
    if (filters.major !== 'all') {
      filtered = filtered.filter(token => token.majorId === parseInt(filters.major));
    }

    // Tier filter
    if (filters.tier !== 'all') {
      filtered = filtered.filter(token => token.materialTier === filters.tier);
    }

    // Punch count range
    filtered = filtered.filter(token => 
      token.punchCount >= filters.punchCount.min && 
      token.punchCount <= filters.punchCount.max
    );

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(token => {
        const major = majorsData[token.majorId];
        const minor = major?.minors[token.minorId];
        return (
          major?.name.toLowerCase().includes(search) ||
          minor?.name.toLowerCase().includes(search) ||
          token.materialName.toLowerCase().includes(search) ||
          token.tokenId.toString().includes(search)
        );
      });
    }

    setFilteredTokens(filtered);
  };

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

  const formatHype = (wei: string) => {
    const eth = parseFloat(wei) / 1e18;
    return `${eth.toFixed(4)} ETH`;
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="text-center space-y-6 py-20">
          <h1 className="font-mono text-4xl font-bold">My Omamori</h1>
          <p className="text-xl text-muted-foreground">
            Connect your wallet to view your protective talismans
          </p>
          <Button asChild className="font-mono">
            <Link to="/">Connect Wallet</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-mono text-4xl font-bold">My Omamori</h1>
            <p className="text-muted-foreground mt-2">
              {myTokens.length} protective talisman{myTokens.length !== 1 ? 's' : ''} in your collection
            </p>
          </div>
          
          <Button asChild className="font-mono">
            <Link to="/">Mint Another</Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4" />
            <span className="font-mono text-sm">Filters</span>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 font-mono"
              />
            </div>
            
            {/* Major Filter */}
            <Select
              value={filters.major}
              onValueChange={(value) => setFilters(prev => ({ ...prev, major: value }))}
            >
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="All Majors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Majors</SelectItem>
                {majorsData.map(major => (
                  <SelectItem key={major.id} value={major.id.toString()}>
                    {major.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Tier Filter */}
            <Select
              value={filters.tier}
              onValueChange={(value) => setFilters(prev => ({ ...prev, tier: value }))}
            >
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="Common">Common</SelectItem>
                <SelectItem value="Uncommon">Uncommon</SelectItem>
                <SelectItem value="Rare">Rare</SelectItem>
                <SelectItem value="Ultra Rare">Ultra Rare</SelectItem>
                <SelectItem value="Mythic">Mythic</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Punch Count Range */}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="25"
                value={filters.punchCount.min}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  punchCount: { ...prev.punchCount, min: parseInt(e.target.value) || 0 }
                }))}
                className="w-16 font-mono text-center"
                placeholder="0"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                min="0"
                max="25"
                value={filters.punchCount.max}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  punchCount: { ...prev.punchCount, max: parseInt(e.target.value) || 25 }
                }))}
                className="w-16 font-mono text-center"
                placeholder="25"
              />
            </div>
          </div>
        </Card>

        {/* Collection Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="font-mono text-muted-foreground">Loading your collection...</div>
          </div>
        ) : filteredTokens.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="font-mono text-xl">No Omamori found</div>
            <p className="text-muted-foreground">
              {myTokens.length === 0 
                ? "You haven't minted any Omamori yet" 
                : "Try adjusting your filters"
              }
            </p>
            {myTokens.length === 0 && (
              <Button asChild className="font-mono">
                <Link to="/">Mint Your First</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTokens.map(token => {
              const major = majorsData[token.majorId];
              const minor = major?.minors[token.minorId];
              
              return (
                <Card key={token.tokenId} className="overflow-hidden hover-lift">
                  <Link to={`/token/${token.tokenId}`}>
                    {/* SVG Preview */}
                    <div className="aspect-[5/7] bg-parchment paper-texture">
                      <div 
                        className="w-full h-full"
                        dangerouslySetInnerHTML={{ __html: token.imageSvg }}
                      />
                    </div>
                    
                    {/* Token Info */}
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-mono text-sm text-muted-foreground">
                            #{token.tokenId}
                          </div>
                          <div className="font-ui font-medium">
                            {minor?.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{token.materialName}</div>
                          <div className={`text-xs ${getTierColor(token.materialTier)}`}>
                            {token.materialTier}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{token.punchCount}/25 punches</span>
                        <span>{formatHype(token.hypeBurned)}</span>
                      </div>
                    </div>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}