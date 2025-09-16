import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRealTimeStats } from "@/hooks/useContractEvents"
import { TrendingUp, Users, Flame, Clock } from "lucide-react"
import { formatEther } from "viem"

/**
 * Real-time statistics component
 */
export function RealTimeStats() {
  const stats = useRealTimeStats()
  
  const formatHype = (amount: number) => {
    return amount.toFixed(4)
  }
  
  const statsItems = [
    {
      label: "Total Minted",
      value: stats.totalMinted.toLocaleString(),
      icon: <TrendingUp className="w-4 h-4" />,
      change: stats.totalMinted > 0 ? `+${stats.totalMinted} today` : undefined,
    },
    {
      label: "HYPE Burned",
      value: `${formatHype(stats.totalHypeBurned)}`,
      icon: <Flame className="w-4 h-4" />,
      change: "Deflationary",
    },
    {
      label: "Active Holders",
      value: stats.uniqueHolders.toLocaleString(),
      icon: <Users className="w-4 h-4" />,
      change: "Growing",
    },
  ]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statsItems.map((item, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              {item.icon}
              <span className="text-sm font-mono">{item.label}</span>
            </div>
            {item.change && (
              <Badge variant="secondary" className="text-xs">
                {item.change}
              </Badge>
            )}
          </div>
          
          <div className="text-2xl font-bold font-mono">
            {item.value}
          </div>
        </Card>
      ))}
    </div>
  )
}

/**
 * Recent activity feed
 */
export function RecentActivity() {
  const stats = useRealTimeStats()
  
  if (stats.recentMints.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4" />
          <span className="font-mono text-sm">Recent Activity</span>
        </div>
        
        <div className="text-center text-muted-foreground py-8">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div className="text-sm">No recent activity</div>
        </div>
      </Card>
    )
  }
  
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4" />
        <span className="font-mono text-sm">Recent Mints</span>
      </div>
      
      <div className="space-y-3">
        {stats.recentMints.map((token) => (
          <div key={token.tokenId} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded border border-amber-300 flex items-center justify-center">
                <span className="text-xs font-bold text-amber-800">
                  #{token.tokenId}
                </span>
              </div>
              
              <div>
                <div className="text-sm font-medium">
                  {token.materialName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {token.materialTier}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-mono">
                {formatEther(BigInt(token.hypeBurned || '0'))} HYPE
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(token.mintedAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
