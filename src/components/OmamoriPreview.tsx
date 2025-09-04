import { useMemo } from "react";
import { useOmamoriStore } from "@/store/omamoriStore";
import { pickMaterial, getPunchCount, generateSeed } from "@/lib/utils/materialPicker";
import { renderOmamoriSVG } from "@/lib/renderer/omamoriSvg";
import majorsData from "@/data/majors.json";

interface OmamoriPreviewProps {
  className?: string;
  seed?: string; // Optional fixed seed for consistent preview
}

export function OmamoriPreview({ className = "", seed: fixedSeed }: OmamoriPreviewProps) {
  const { selectedMajor, selectedMinor, hypeAmount } = useOmamoriStore();

  // Generate preview data
  const previewData = useMemo(() => {
    // Use fixed seed if provided, otherwise generate one based on selections
    const seed = fixedSeed || `preview_${selectedMajor}_${selectedMinor}_${hypeAmount}`;
    
    const material = pickMaterial(seed);
    const punchCount = getPunchCount(seed);
    
    const major = majorsData[selectedMajor];
    const minor = major?.minors[selectedMinor];
    
    if (!major || !minor) {
      return null;
    }
    
    return {
      majorId: selectedMajor,
      minorId: selectedMinor,
      materialId: material.id,
      materialName: material.name,
      materialTier: material.tier as any,
      punchCount,
      seed
    };
  }, [selectedMajor, selectedMinor, hypeAmount, fixedSeed]);

  const svgContent = useMemo(() => {
    if (!previewData) return '';
    return renderOmamoriSVG(previewData);
  }, [previewData]);

  if (!previewData) {
    return (
      <div className={`bg-card border border-border rounded p-8 text-center ${className}`}>
        <div className="text-muted-foreground">
          Select Major and Minor to preview
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded overflow-hidden ${className}`}>
      {/* SVG Preview */}
      <div className="aspect-[5/7] bg-parchment paper-texture">
        <div 
          className="w-full h-full"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>
      
      {/* Preview Details */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-mono text-sm text-muted-foreground">
              {majorsData[selectedMajor].name}
            </div>
            <div className="font-ui text-lg font-medium">
              {majorsData[selectedMajor].minors[selectedMinor].name}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm text-muted-foreground">
              Material
            </div>
            <div className="font-ui text-sm font-medium">
              {previewData.materialName}
            </div>
            <div className={`text-xs font-medium ${getTierColor(previewData.materialTier)}`}>
              {previewData.materialTier}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Punches:</span>
            <span className="ml-2 font-mono">{previewData.punchCount}/25</span>
          </div>
          <div>
            <span className="text-muted-foreground">HYPE:</span>
            <span className="ml-2 font-mono">{hypeAmount} ETH</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTierColor(tier: string): string {
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
}