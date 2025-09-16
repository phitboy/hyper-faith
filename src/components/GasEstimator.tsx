import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useMintGasEstimation, useGasPriceMonitor, useTransactionCostBreakdown } from "@/hooks/useGasEstimation"
import { Fuel, TrendingUp, TrendingDown, Minus, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface GasEstimatorProps {
  hypeAmount: string
}

/**
 * Real-time gas estimation component
 */
export function GasEstimator({ hypeAmount }: GasEstimatorProps) {
  const { totalCost, isLoading } = useMintGasEstimation(hypeAmount)
  const { gasPriceGwei, category, recommendation } = useGasPriceMonitor()
  const { data: breakdown } = useTransactionCostBreakdown(hypeAmount)
  
  if (!hypeAmount || parseFloat(hypeAmount) < 0.01) {
    return <GasEstimatorPlaceholder />
  }
  
  if (isLoading) {
    return <GasEstimatorSkeleton />
  }
  
  if (!totalCost || !breakdown) {
    return <GasEstimatorError />
  }
  
  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Fuel className="w-4 h-4" />
          <span className="font-mono text-sm">Transaction Cost</span>
        </div>
        
        <GasPriceBadge category={category} gwei={gasPriceGwei} />
      </div>
      
      {/* Cost Breakdown */}
      <div className="space-y-3">
        {breakdown.items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{item.label}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{item.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="text-right">
              <div className="font-mono text-sm">{item.amount} HYPE</div>
              <div className="text-xs text-muted-foreground">{item.percentage}%</div>
            </div>
          </div>
        ))}
        
        {/* Total */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between font-medium">
            <span>{breakdown.total.label}</span>
            <span className="font-mono">{breakdown.total.amount} HYPE</span>
          </div>
        </div>
      </div>
      
      {/* Gas Recommendation */}
      <div className="text-xs text-center p-2 bg-muted/30 rounded">
        {recommendation}
      </div>
      
      {/* Fair Play Note */}
      <div className="text-xs text-center p-2 bg-green-50 border border-green-200 rounded text-green-800">
        💎 HYPE amount is personal choice - rarity odds are equal for everyone!
      </div>
    </Card>
  )
}

/**
 * Gas price indicator badge
 */
function GasPriceBadge({ category, gwei }: { category: string, gwei: string }) {
  const getIcon = () => {
    switch (category) {
      case 'low': return <TrendingDown className="w-3 h-3" />
      case 'high': return <TrendingUp className="w-3 h-3" />
      default: return <Minus className="w-3 h-3" />
    }
  }
  
  const getVariant = () => {
    switch (category) {
      case 'low': return 'default' as const
      case 'high': return 'destructive' as const
      default: return 'secondary' as const
    }
  }
  
  return (
    <Badge variant={getVariant()} className="gap-1">
      {getIcon()}
      {gwei} gwei
    </Badge>
  )
}

/**
 * Loading skeleton
 */
function GasEstimatorSkeleton() {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-20" />
      </div>
      
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <div className="text-right space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
        
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
      
      <Skeleton className="h-8 w-full" />
    </Card>
  )
}

/**
 * Placeholder when no amount entered
 */
function GasEstimatorPlaceholder() {
  return (
    <Card className="p-4 border-dashed bg-muted/10">
      <div className="text-center text-muted-foreground">
        <Fuel className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <div className="text-sm">Enter HYPE amount to see gas estimate</div>
      </div>
    </Card>
  )
}

/**
 * Error state
 */
function GasEstimatorError() {
  return (
    <Card className="p-4 border-destructive/20 bg-destructive/5">
      <div className="text-center text-destructive">
        <Fuel className="w-6 h-6 mx-auto mb-2" />
        <div className="text-sm">Unable to estimate gas</div>
        <div className="text-xs mt-1">Check network connection</div>
      </div>
    </Card>
  )
}
