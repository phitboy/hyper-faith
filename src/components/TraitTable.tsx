import { Card } from "@/components/ui/card";
import type { OmamoriToken } from "@/lib/contracts/omamori";
import majorsData from "@/data/majors.json";

interface TraitTableProps {
  token: OmamoriToken;
  className?: string;
}

export function TraitTable({ token, className = "" }: TraitTableProps) {
  const major = majorsData[token.majorId];
  const minor = major?.minors[token.minorId];
  
  const formatHype = (wei: string) => {
    const eth = parseFloat(wei) / 1e18;
    return `${eth.toFixed(4)} ETH`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
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

  const traits = [
    { label: 'Token ID', value: `#${token.tokenId}` },
    { label: 'Major Arcanum', value: major?.name || 'Unknown' },
    { label: 'Minor Arcanum', value: minor?.name || 'Unknown' },
    { label: 'Material', value: token.materialName },
    { 
      label: 'Rarity Tier', 
      value: token.materialTier, 
      className: getTierColor(token.materialTier) 
    },
    { label: 'Punch Count', value: `${token.punchCount}/25` },
    { label: 'HYPE Burned', value: formatHype(token.hypeBurned) },
    { label: 'Seed', value: token.seed, mono: true },
    { label: 'Minted', value: formatDate(token.mintedAt) }
  ];

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="font-mono text-lg mb-4">Traits & Metadata</h3>
      <div className="space-y-3">
        {traits.map((trait, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
            <div className="text-sm text-muted-foreground font-medium">
              {trait.label}
            </div>
            <div className={`text-sm ${trait.className || ''} ${trait.mono ? 'font-mono' : 'font-ui'} text-right max-w-xs truncate`}>
              {trait.value}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}