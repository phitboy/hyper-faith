import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useFairPreview, useInspirationGallery, useFairnessEducation, FIXED_RARITY_DISTRIBUTION } from "@/hooks/useFairPreview"
import { Dice6, Shield, Info, RotateCcw, Sparkles } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
