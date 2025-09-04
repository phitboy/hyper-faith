import { Button } from "@/components/ui/button";
import { useOmamoriStore } from "@/store/omamoriStore";

export function WalletStatus() {
  const { isConnected, address, chainId, setWalletState } = useOmamoriStore();

  const handleConnect = async () => {
    // Mock wallet connection - in real app would use wagmi
    const mockAddress = '0x742d35Cc6bF4532C6D99f24F5e5b9eE5e9fB0A6D' as `0x${string}`;
    setWalletState(true, mockAddress, 1);
  };

  const handleDisconnect = () => {
    setWalletState(false);
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-card border border-border rounded">
        <div className="text-center">
          <h3 className="font-mono text-lg mb-2">Connect Wallet</h3>
          <p className="text-muted-foreground text-sm">
            Connect your wallet to mint Omamori
          </p>
        </div>
        <Button 
          onClick={handleConnect}
          className="font-mono hover-lift focus-ring"
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <div>
          <div className="font-mono text-sm">
            {address && truncateAddress(address)}
          </div>
          <div className="text-xs text-muted-foreground">
            Chain ID: {chainId || 'Unknown'}
          </div>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDisconnect}
        className="font-mono"
      >
        Disconnect
      </Button>
    </div>
  );
}