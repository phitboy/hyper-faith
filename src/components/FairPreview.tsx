import React, { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useFairPreview, useInspirationGallery, useFairnessEducation, FIXED_RARITY_DISTRIBUTION } from "@/hooks/useFairPreview"
import { Dice6, Shield, Info, RotateCcw, Sparkles, Eye } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useOmamoriStore } from "@/store/omamoriStore"
import { renderOmamoriSVG } from "@/lib/renderer/omamoriSvg"
import { pickMaterial, getPunchCount } from "@/lib/utils/materialPicker"
import majorsData from "@/data/majors.json"

/**
 * Fair preview component that shows possibilities without prediction
 */
export function FairPreview() {
  const { data: preview } = useFairPreview()
  const { data: gallery } = useInspirationGallery()
  const education = useFairnessEducation()
  
  if (!preview) {
    return <FairPreviewSkeleton />
  }
  
  return (
    <div className="space-y-4">
      {/* Header with Fairness Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-500" />
          <span className="font-mono text-sm">Fair Preview</span>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="default" className="gap-1 bg-green-100 text-green-800 border-green-300">
                <Shield className="w-3 h-3" />
                100% Fair
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-48">
                {preview.fairnessNote}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Your Guaranteed Elements */}
      <Card className="p-4">
        <h3 className="font-mono text-sm mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Your Selections (Guaranteed)
        </h3>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">Major Glyph</div>
            <div className="font-medium">#{preview.guaranteedElements.majorGlyph}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Minor Glyph</div>
            <div className="font-medium">#{preview.guaranteedElements.minorGlyph}</div>
          </div>
          <div className="col-span-2">
            <div className="text-muted-foreground">HYPE to Burn (Metadata Only)</div>
            <div className="font-medium font-mono">{preview.guaranteedElements.hypeBurned} HYPE</div>
            <div className="text-xs text-muted-foreground mt-1">
              💡 {preview.hypeNote}
            </div>
          </div>
        </div>
      </Card>
      
      {/* SVG Preview Gallery */}
      <SVGPreviewGallery />
      
      {/* Rarity Distribution */}
      <RarityDistribution />
      
      {/* Inspiration Gallery */}
      <InspirationGallery gallery={gallery} />
      
      {/* Fairness Education */}
      <FairnessEducation education={education} />
    </div>
  )
}

/**
 * Fixed rarity distribution display
 */
function RarityDistribution() {
  return (
    <Card className="p-4">
      <h3 className="font-mono text-sm mb-3 flex items-center gap-2">
        <Dice6 className="w-4 h-4" />
        Rarity Chances (Same for Everyone)
      </h3>
      
      <div className="space-y-3">
        {Object.entries(FIXED_RARITY_DISTRIBUTION).map(([rarity, data]) => (
          <div key={rarity} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: data.color }}
                />
                <span className="capitalize font-medium">{rarity}</span>
              </div>
              <span className="font-mono">{data.percentage}%</span>
            </div>
            
            <Progress 
              value={data.percentage} 
              className="h-2"
              style={{
                '--progress-background': data.color
              } as React.CSSProperties}
            />
            
            <div className="text-xs text-muted-foreground">
              Examples: {data.examples.slice(0, 3).join(', ')}...
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-xs">
        <div className="flex items-center gap-2 text-green-800">
          <Shield className="w-3 h-3" />
          <span className="font-medium">Fair Play Guarantee</span>
        </div>
        <div className="text-green-700 mt-1">
          These odds are identical for all users regardless of HYPE amount burned.
        </div>
      </div>
    </Card>
  )
}

/**
 * Cycling inspiration gallery
 */
function InspirationGallery({ gallery }: { gallery: any }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useEffect(() => {
    if (!gallery?.examples) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % gallery.examples.length)
    }, gallery.cycleInterval || 3000)
    
    return () => clearInterval(interval)
  }, [gallery])
  
  if (!gallery?.examples) return null
  
  const currentExample = gallery.examples[currentIndex]
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-mono text-sm flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Example Possibilities
        </h3>
        <div className="text-xs text-muted-foreground">
          {currentIndex + 1} of {gallery.examples.length}
        </div>
      </div>
      
      {/* Current Example */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded border-2 border-amber-200 p-4 mb-3">
        <div className="text-center space-y-2">
          <div className="text-lg font-bold text-amber-800">
            {currentExample.material}
          </div>
          <div className="text-sm text-amber-600">
            {currentExample.rarity}
          </div>
          <div className="text-xs text-amber-500">
            {currentExample.punches} punches • {currentExample.hypeExample} HYPE
          </div>
          <div className="text-xs text-amber-700 font-medium">
            {currentExample.note}
          </div>
        </div>
      </div>
      
      {/* Cycling Indicator */}
      <div className="flex justify-center gap-1 mb-3">
        {gallery.examples.map((_: any, index: number) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-amber-500' : 'bg-amber-200'
            }`}
          />
        ))}
      </div>
      
      {/* Disclaimer */}
      <div className="text-xs text-center p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
        ⚠️ {gallery.disclaimer}
      </div>
    </Card>
  )
}

/**
 * Fairness education component
 */
function FairnessEducation({ education }: { education: any }) {
  return (
    <Card className="p-4">
      <h3 className="font-mono text-sm mb-3 flex items-center gap-2">
        <Info className="w-4 h-4" />
        How Fair Minting Works
      </h3>
      
      <div className="space-y-4 text-sm">
        {/* Fairness Principles */}
        <div>
          <div className="font-medium mb-2">Fairness Principles:</div>
          <div className="space-y-1">
            {education.principles.map((principle: string, index: number) => (
              <div key={index} className="text-muted-foreground">
                {principle}
              </div>
            ))}
          </div>
        </div>
        
        {/* Why Burn HYPE */}
        <div>
          <div className="font-medium mb-2">Why Burn More HYPE?</div>
          <div className="space-y-1">
            {education.hypeReasons.map((reason: string, index: number) => (
              <div key={index} className="text-muted-foreground">
                {reason}
              </div>
            ))}
          </div>
        </div>
        
        {/* Not for Odds */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="text-blue-800 font-medium text-center">
            {education.notForOdds}
          </div>
        </div>
      </div>
    </Card>
  )
}

/**
 * SVG Preview Gallery showing actual rendered examples
 */
function SVGPreviewGallery() {
  const { selectedMajor, selectedMinor, hypeAmount } = useOmamoriStore()
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0)
  
  // Generate multiple preview examples with different materials
  const previewExamples = useMemo(() => {
    const major = majorsData[selectedMajor]
    const minor = major?.minors[selectedMinor]
    
    if (!major || !minor) {
      return []
    }
    
    // Create 5 different examples with different seeds (but same user selections)
    return Array.from({ length: 5 }, (_, i) => {
      const exampleSeed = `fair_preview_${selectedMajor}_${selectedMinor}_${i}_${Date.now()}`
      const material = pickMaterial(exampleSeed)
      const punchCount = getPunchCount(exampleSeed)
      
      const tokenData = {
        majorId: selectedMajor,
        minorId: selectedMinor,
        materialId: material.id,
        materialName: material.name,
        materialTier: material.tier as 'Common' | 'Uncommon' | 'Rare' | 'Ultra Rare' | 'Mythic',
        punchCount,
        seed: exampleSeed
      }
      
      return {
        ...tokenData,
        svgContent: renderOmamoriSVG(tokenData)
      }
    })
  }, [selectedMajor, selectedMinor, hypeAmount])
  
  // Cycle through examples
  useEffect(() => {
    if (previewExamples.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentExampleIndex((prev) => (prev + 1) % previewExamples.length)
    }, 4000) // 4 second intervals
    
    return () => clearInterval(interval)
  }, [previewExamples.length])
  
  if (previewExamples.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div className="text-sm">Select Major and Minor glyphs to see preview examples</div>
        </div>
      </Card>
    )
  }
  
  const currentExample = previewExamples[currentExampleIndex]
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-sm flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Visual Examples (Your Selections)
        </h3>
        <div className="text-xs text-muted-foreground">
          {currentExampleIndex + 1} of {previewExamples.length}
        </div>
      </div>
      
      {/* SVG Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* SVG Render */}
        <div className="aspect-[5/7] bg-parchment paper-texture rounded border-2 border-amber-200 overflow-hidden">
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: currentExample.svgContent }}
          />
        </div>
        
        {/* Example Details */}
        <div className="space-y-3">
          <div>
            <div className="text-xs text-muted-foreground">Your Guaranteed Selections</div>
            <div className="font-medium">{majorsData[selectedMajor].name}</div>
            <div className="text-sm text-muted-foreground">{majorsData[selectedMajor].minors[selectedMinor].name}</div>
          </div>
          
          <div>
            <div className="text-xs text-muted-foreground">Random Material (This Example)</div>
            <div className="font-medium">{currentExample.materialName}</div>
            <div className={`text-sm font-medium ${getTierColor(currentExample.materialTier)}`}>
              {currentExample.materialTier}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-muted-foreground">Random Punches (This Example)</div>
            <div className="font-mono">{currentExample.punchCount}/25</div>
          </div>
          
          <div>
            <div className="text-xs text-muted-foreground">Your HYPE Burn (Metadata)</div>
            <div className="font-mono">{hypeAmount} HYPE</div>
          </div>
        </div>
      </div>
      
      {/* Cycling Indicator */}
      <div className="flex justify-center gap-1 mb-4">
        {previewExamples.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
              index === currentExampleIndex ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            onClick={() => setCurrentExampleIndex(index)}
          />
        ))}
      </div>
      
      {/* Critical Disclaimer */}
      <div className="p-3 bg-red-50 border-2 border-red-200 rounded">
        <div className="flex items-center gap-2 text-red-800 mb-2">
          <Shield className="w-4 h-4" />
          <span className="font-bold text-sm">⚠️ IMPORTANT: Preview ≠ Your Mint</span>
        </div>
        <div className="text-red-700 text-xs space-y-1">
          <div>• Your actual mint will have DIFFERENT random material & punches</div>
          <div>• Only your Major/Minor glyph selections are guaranteed</div>
          <div>• These are just examples of what's POSSIBLE, not what you'll get</div>
          <div>• Pure blockchain randomness determines your actual outcome</div>
        </div>
      </div>
    </Card>
  )
}

/**
 * Get tier color for material display
 */
function getTierColor(tier: string): string {
  switch (tier.toLowerCase()) {
    case 'legendary': return 'text-purple-600'
    case 'epic': return 'text-pink-600'
    case 'rare': return 'text-blue-600'
    case 'uncommon': return 'text-green-600'
    case 'common': return 'text-gray-600'
    default: return 'text-gray-600'
  }
}

/**
 * Loading skeleton
 */
function FairPreviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
      
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
