import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useLivePreview, usePreviewAccuracy } from "@/hooks/useLivePreview"
import { Eye, Sparkles, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * Enhanced preview component using real contract logic
 */
export function LivePreview() {
  const { attributes, isLoading } = useLivePreview()
  const { isAccurate, confidence, note } = usePreviewAccuracy()
  
  if (isLoading) {
    return <PreviewSkeleton />
  }
  
  if (!attributes) {
    return <PreviewPlaceholder />
  }
  
  return (
    <div className="space-y-4">
      {/* Preview Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span className="font-mono text-sm">Live Preview</span>
          {isAccurate && <Sparkles className="w-4 h-4 text-yellow-500" />}
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant={isAccurate ? "default" : "secondary"} className="gap-1">
                <Info className="w-3 h-3" />
                {confidence}% accurate
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{note}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Preview Card */}
      <Card className="aspect-[5/7] bg-parchment paper-texture rounded overflow-hidden hover-lift">
        <div className="w-full h-full p-4 flex flex-col items-center justify-center">
          {/* Simplified SVG Preview */}
          <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 rounded border-2 border-amber-200 flex flex-col items-center justify-center">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-amber-800">
                {attributes.materialName}
              </div>
              <div className="text-sm text-amber-600">
                {attributes.materialTier}
              </div>
              <div className="text-xs text-amber-500">
                Major: {attributes.majorId} | Minor: {attributes.minorId}
              </div>
              <div className="text-xs text-amber-500">
                Punches: {attributes.punchCount}
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Preview Attributes */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="space-y-1">
          <div className="font-mono text-muted-foreground">Material</div>
          <div className="font-medium">{attributes.materialName}</div>
        </div>
        <div className="space-y-1">
          <div className="font-mono text-muted-foreground">Rarity</div>
          <div className="font-medium">{attributes.materialTier}</div>
        </div>
        <div className="space-y-1">
          <div className="font-mono text-muted-foreground">Glyphs</div>
          <div className="font-medium">{attributes.majorId}/{attributes.minorId}</div>
        </div>
        <div className="space-y-1">
          <div className="font-mono text-muted-foreground">Punches</div>
          <div className="font-medium">{attributes.punchCount}</div>
        </div>
      </div>
      
      {/* Preview Note */}
      <div className="text-xs text-muted-foreground text-center p-2 bg-muted/30 rounded">
        {isAccurate 
          ? "🎯 Preview uses real contract logic - high accuracy"
          : "⚠️ Approximate preview - actual result may vary"
        }
      </div>
    </div>
  )
}

/**
 * Loading skeleton for preview
 */
function PreviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-20" />
      </div>
      
      <Card className="aspect-[5/7] bg-muted/20">
        <div className="w-full h-full p-4">
          <Skeleton className="w-full h-full rounded" />
        </div>
      </Card>
      
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Placeholder when no preview available
 */
function PreviewPlaceholder() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 text-muted-foreground" />
        <span className="font-mono text-sm text-muted-foreground">Preview</span>
      </div>
      
      <Card className="aspect-[5/7] bg-muted/10 border-dashed">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">Select attributes to preview</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
