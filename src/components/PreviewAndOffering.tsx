import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Eye, Plus, Minus, Loader2, AlertCircle } from "lucide-react";
import { useOmamoriStore } from "@/store/omamoriStore";
import { renderOmamoriSVG } from "@/lib/renderer/omamoriSvg";
import { pickMaterial, getPunchCount } from "@/lib/utils/materialPicker";
import majorsData from "@/data/majors.json";
import { useAccount } from "wagmi";

interface PreviewAndOfferingProps {
  majorId: number;
  minorId: number;
  onMint: () => void;
  onBack: () => void;
  isMinting: boolean;
  isPending: boolean;
  isConfirming: boolean;
}

export function PreviewAndOffering({
  majorId,
  minorId,
  onMint,
  onBack,
  isMinting,
  isPending,
  isConfirming,
}: PreviewAndOfferingProps) {
  const { hypeAmount, setHypeAmount } = useOmamoriStore();
  const [inputValue, setInputValue] = useState(hypeAmount);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const { isConnected } = useAccount();
  
  const major = majorsData.find((m) => m.id === majorId);
  const minor = major?.minors.find((m) => m.id === minorId);

  // Generate preview examples
  const previewExamples = useMemo(() => {
    if (!major || !minor) return [];

    return Array.from({ length: 3 }, (_, i) => {
      const exampleSeed = `preview_${majorId}_${minorId}_${i}_${Date.now()}`;
      const material = pickMaterial(exampleSeed);
      const punchCount = getPunchCount(exampleSeed);

      const tokenData = {
        majorId,
        minorId,
        materialId: material.id,
        materialName: material.name,
        materialTier: material.tier as 'Common' | 'Uncommon' | 'Rare' | 'Ultra Rare' | 'Mythic',
        punchCount,
        seed: exampleSeed,
      };

      return {
        ...tokenData,
        svgContent: renderOmamoriSVG(tokenData),
      };
    });
  }, [majorId, minorId, major, minor]);

  // Cycle through examples
  useEffect(() => {
    if (previewExamples.length === 0) return;

    const interval = setInterval(() => {
      setCurrentExampleIndex((prev) => (prev + 1) % previewExamples.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [previewExamples.length]);

  // HYPE input handlers
  useEffect(() => {
    setInputValue(hypeAmount);
  }, [hypeAmount]);

  const validateAndSet = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const formatted = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;

    const numValue = parseFloat(formatted);
    if (!isNaN(numValue) && numValue >= 0.01) {
      setHypeAmount(formatted);
    } else if (formatted === '' || formatted === '0' || formatted === '0.') {
      setInputValue(formatted);
      return;
    }

    setInputValue(formatted);
  };

  const increment = () => {
    const current = parseFloat(inputValue) || 0;
    const newValue = Math.max(0.01, current + 0.01);
    const formatted = newValue.toFixed(2);
    setInputValue(formatted);
    setHypeAmount(formatted);
  };

  const decrement = () => {
    const current = parseFloat(inputValue) || 0;
    const newValue = Math.max(0.01, current - 0.01);
    const formatted = newValue.toFixed(2);
    setInputValue(formatted);
    setHypeAmount(formatted);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSet(e.target.value);
  };

  const handleBlur = () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < 0.01) {
      setInputValue('0.01');
      setHypeAmount('0.01');
    }
  };

  const currentExample = previewExamples[currentExampleIndex];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="gap-2 font-mono">
        <ChevronLeft className="w-4 h-4" />
        Change Blessing
      </Button>

      {/* Compact Selection Summary */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 text-xl md:text-2xl font-mono font-bold">
          <span className="glyph whitespace-pre-line text-lg">{major?.glyph || ''}</span>
          <span>{major?.name} • {minor?.name}</span>
        </div>
        <p className="text-sm text-muted-foreground font-serif italic">
          "{minor?.blessing}"
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Art Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Example Preview
            </h3>
            <div className="text-xs text-muted-foreground">
              {currentExampleIndex + 1} of {previewExamples.length}
            </div>
          </div>

          {currentExample && (
            <>
              {/* SVG Preview */}
              <div className="aspect-[5/7] bg-parchment paper-texture rounded border-2 border-amber-200 overflow-hidden">
                <div
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ __html: currentExample.svgContent }}
                />
              </div>

              {/* Cycling Indicator */}
              <div className="flex justify-center gap-1">
                {previewExamples.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                      index === currentExampleIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                    onClick={() => setCurrentExampleIndex(index)}
                  />
                ))}
              </div>

              {/* Example Details */}
              <Card className="p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Material (Sample)</span>
                  <Badge variant="secondary">{currentExample.materialTier}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Material Name</span>
                  <span className="font-medium">{currentExample.materialName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Punch Count</span>
                  <span className="font-mono">{currentExample.punchCount}/25</span>
                </div>
              </Card>

              {/* Critical Randomness Warning */}
              <Card className="p-4 bg-red-50 border-2 border-red-300">
                <div className="flex items-start gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <div className="font-bold">THIS IS A SAMPLE ONLY</div>
                    <div className="text-red-700">
                      Your actual mint will have different material & punches determined by blockchain
                      randomness. Only {major?.name} • {minor?.name} are guaranteed.
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Right: Sacred Offering */}
        <div className="space-y-6">
          <h3 className="text-xl font-mono font-bold text-center">Sacred Offering</h3>

          {/* HYPE Input */}
          <div className="space-y-3">
            <label className="font-mono text-sm text-muted-foreground block">
              HYPE to Burn
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={decrement}
                disabled={parseFloat(inputValue) <= 0.01 || isMinting}
                className="px-2 h-10"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <Input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={isMinting}
                className="font-mono text-lg text-center"
                placeholder="0.01"
              />

              <Button
                variant="outline"
                size="sm"
                onClick={increment}
                disabled={isMinting}
                className="px-2 h-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground font-mono text-center">
              Minimum: 0.01 HYPE
            </div>
          </div>

          {/* Why Burn HYPE */}
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-xs text-green-800 space-y-2">
              <div className="font-bold">100% of HYPE burned supports the Assistance Fund</div>
              <div className="text-green-700">
                Your offering amount is personal choice and does NOT affect rarity odds. All minters
                have equal chances regardless of HYPE burned.
              </div>
            </div>
          </Card>

          {/* Mint Button */}
          <Button
            onClick={onMint}
            disabled={!isConnected || isMinting || parseFloat(inputValue) < 0.01}
            className="w-full h-12 text-lg font-mono"
            size="lg"
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isConfirming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isPending
              ? 'Confirm in Wallet...'
              : isConfirming
              ? 'Forging...'
              : `Burn ${inputValue} HYPE & Mint`}
          </Button>

          {!isConnected && (
            <p className="text-sm text-destructive text-center">
              Connect your wallet in the header to mint
            </p>
          )}

          {/* Transaction Time Warning */}
          {(isPending || isConfirming) && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="text-xs text-blue-800 text-center">
                ⏱️ Transaction typically takes ~60 seconds. Please be patient.
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

