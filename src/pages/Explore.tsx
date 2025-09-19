import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllOmamori } from "@/lib/contracts/omamori";
import type { OmamoriToken } from "@/lib/contracts/omamori";
import { Link } from "react-router-dom";
import majorsData from "@/data/majors.json";
import { Search, Filter, TrendingUp, Clock, Star } from "lucide-react";

export default function Explore() {
  const [allTokens, setAllTokens] = useState<OmamoriToken[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<OmamoriToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'rarest' | 'highest-hype'>('newest');
  const [filters, setFilters] = useState({
    major: 'all',
    tier: 'all',
    punchCount: { min: 0, max: 25 },
    search: ''
  });

  useEffect(() => {
    loadAllTokens();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [allTokens, filters, sortBy]);

  const loadAllTokens = async () => {
    try {
      setLoading(true);
      const tokens = await getAllOmamori();
      setAllTokens(tokens);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...allTokens];

    // Apply filters
    if (filters.major !== 'all') {
      filtered = filtered.filter(token => token.majorId === parseInt(filters.major));
    }

    if (filters.tier !== 'all') {
      filtered = filtered.filter(token => token.materialTier === filters.tier);
    }

    filtered = filtered.filter(token => 
      token.punchCount >= filters.punchCount.min && 
      token.punchCount <= filters.punchCount.max
    );

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

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.mintedAt - a.mintedAt);
        break;
      case 'rarest':
        const tierOrder = { 'Mythic': 5, 'Ultra Rare': 4, 'Rare': 3, 'Uncommon': 2, 'Common': 1 };
        filtered.sort((a, b) => {
          const aTier = tierOrder[a.materialTier] || 0;
          const bTier = tierOrder[b.materialTier] || 0;
          if (aTier !== bTier) return bTier - aTier;
          return b.punchCount - a.punchCount; // Secondary sort by punch count
        });
        break;
      case 'highest-hype':
        filtered.sort((a, b) => parseFloat(b.hypeBurned) - parseFloat(a.hypeBurned));
        break;
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

  const formatHype = (hype: string) => {
    // token.hypeBurned is already in HYPE format, not wei
    const hyp = parseFloat(hype);
    return `${hyp.toFixed(4)} HYPE`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Get notable pulls (Rare+ materials)
  const notablePulls = filteredTokens.filter(token => 
    ['Rare', 'Ultra Rare', 'Mythic'].includes(token.materialTier)
  ).slice(0, 3);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="font-mono text-4xl font-bold">Explore Collection</h1>
          <p className="text-xl text-muted-foreground">
            Discover protective talismans minted by the community
          </p>
        </div>

        {/* Notable Pulls */}
        {notablePulls.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-mythic" />
              <h2 className="font-mono text-lg">Notable Recent Pulls</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {notablePulls.map(token => {
                const major = majorsData[token.majorId];
                const minor = major?.minors[token.minorId];
                
                return (
                  <Link key={token.tokenId} to={`/token/${token.tokenId}`}>
                    <Card className="p-4 hover-lift">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 bg-parchment paper-texture rounded overflow-hidden flex-shrink-0">
                          <div 
                            className="w-full h-full scale-75"
                            dangerouslySetInnerHTML={{ __html: token.imageSvg }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-sm text-muted-foreground">
                            #{token.tokenId}
                          </div>
                          <div className="font-medium truncate">
                            {minor?.name}
                          </div>
                          <div className={`text-sm ${getTierColor(token.materialTier)}`}>
                            {token.materialTier} {token.materialName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatHype(token.hypeBurned)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </Card>
        )}

        {/* Filters and Sort */}
        <Card className="p-6">
          <div className="space-y-4">
            {/* Filter Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="font-mono text-sm">Filters & Sort</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredTokens.length} of {allTokens.length} tokens
              </div>
            </div>
            
            {/* Filters Row */}
            <div className="grid md:grid-cols-5 gap-4">
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
              
              {/* Sort */}
              <Select
                value={sortBy}
                onValueChange={(value: 'newest' | 'rarest' | 'highest-hype') => setSortBy(value)}
              >
                <SelectTrigger className="font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Newest
                    </div>
                  </SelectItem>
                  <SelectItem value="rarest">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Rarest
                    </div>
                  </SelectItem>
                  <SelectItem value="highest-hype">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Highest HYPE
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Collection Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="font-mono text-muted-foreground">Loading collection...</div>
          </div>
        ) : filteredTokens.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="font-mono text-xl">No tokens found</div>
            <p className="text-muted-foreground">Try adjusting your filters</p>
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
                      {token.imageSvg.startsWith('http') ? (
                        <img 
                          src={token.imageSvg} 
                          alt={`Omamori #${token.tokenId}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full"
                          dangerouslySetInnerHTML={{ __html: token.imageSvg }}
                        />
                      )}
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
                        <span>{formatTimeAgo(token.mintedAt)}</span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground text-center pt-1 border-t border-border">
                        {formatHype(token.hypeBurned)} HYPE burned
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