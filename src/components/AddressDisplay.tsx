import { useReverseResolution } from "@/lib/hyperliquid-names";
import { Badge } from "@/components/ui/badge";
import { Globe, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddressDisplayProps {
  address: `0x${string}`;
  showFullAddress?: boolean;
  showCopyButton?: boolean;
  className?: string;
}

/**
 * Component that displays an Ethereum address with optional .hl name resolution
 * Shows the .hl name if available, with the address as fallback
 */
export function AddressDisplay({ 
  address, 
  showFullAddress = false, 
  showCopyButton = false,
  className = "" 
}: AddressDisplayProps) {
  const { toast } = useToast();
  const { name: hlName, isLoading } = useReverseResolution(address);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast({
        title: "Copied!",
        description: "Address copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address",
        variant: "destructive"
      });
    }
  };
  
  const formatAddress = (addr: string) => {
    if (showFullAddress) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  if (isLoading) {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <span className="font-mono text-sm">{formatAddress(address)}</span>
        <div className="w-3 h-3 border border-muted-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {hlName ? (
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            <Globe className="w-3 h-3 mr-1" />
            {hlName}
          </Badge>
          {showFullAddress && (
            <span className="font-mono text-xs text-muted-foreground">
              ({formatAddress(address)})
            </span>
          )}
        </div>
      ) : (
        <span className="font-mono text-sm">{formatAddress(address)}</span>
      )}
      
      {showCopyButton && (
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-muted rounded transition-colors"
          title="Copy address"
        >
          <Copy className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/**
 * Simplified version for inline display
 */
export function InlineAddressDisplay({ address, className = "" }: { 
  address: `0x${string}`; 
  className?: string; 
}) {
  return <AddressDisplay address={address} className={className} />;
}

/**
 * Full version with copy button for detailed views
 */
export function DetailedAddressDisplay({ address, className = "" }: { 
  address: `0x${string}`; 
  className?: string; 
}) {
  return (
    <AddressDisplay 
      address={address} 
      showFullAddress={true} 
      showCopyButton={true} 
      className={className} 
    />
  );
}
