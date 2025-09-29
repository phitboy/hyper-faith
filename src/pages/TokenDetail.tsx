import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TraitTable } from "@/components/TraitTable";
import { TransferDialog } from "@/components/TransferDialog";
import { getTokenById } from "@/lib/contracts/omamori";
import { useTokenOwnership } from "@/hooks/useOmamoriContract";
import type { OmamoriToken } from "@/lib/contracts/omamori";
import { ArrowLeft, Copy, Download, Share2, ExternalLink, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import majorsData from "@/data/majors.json";

export default function TokenDetail() {
  const { id } = useParams<{ id: string }>();
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [token, setToken] = useState<OmamoriToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  
  // Check token ownership
  const { data: tokenOwner } = useTokenOwnership(token?.tokenId);
  const isOwner = address && tokenOwner && address.toLowerCase() === tokenOwner.toLowerCase();

  useEffect(() => {
    loadToken();
  }, [id]);

  const loadToken = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const tokenData = await getTokenById(parseInt(id));
      if (tokenData) {
        setToken(tokenData);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Failed to load token:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyImage = async () => {
    if (!token) return;
    
    try {
      await navigator.clipboard.writeText(token.imageSvg);
      toast({
        title: "Copied!",
        description: "SVG code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy SVG to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPNG = () => {
    if (!token) return;
    
    // Create a canvas and render SVG to it
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = 1000;
    canvas.height = 1400;
    
    // Create image from SVG
    const img = new Image();
    const svgBlob = new Blob([token.imageSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      ctx.fillStyle = '#e6e1d5'; // Paper background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      // Download
      const link = document.createElement('a');
      link.download = `omamori-${token.tokenId}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded!",
        description: `Omamori #${token.tokenId} saved as PNG`,
      });
    };
    
    img.src = url;
  };

  const handleShare = () => {
    if (!token) return;
    
    const major = majorsData[token.majorId];
    const minor = major?.minors[token.minorId];
    
    const tweetText = `Check out this Omamori #${token.tokenId}!\n\n${token.materialTier} ${token.materialName} with ${token.punchCount}/25 punches\n\n${major?.name} → ${minor?.name}\n\nView on hyper.faith`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
  };

  const formatHype = (hype: string) => {
    // token.hypeBurned is already in HYPE format, not wei
    const hyp = parseFloat(hype);
    return `${hyp.toFixed(4)} HYPE`;
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

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="font-mono text-muted-foreground">Loading token...</div>
        </div>
      </Layout>
    );
  }

  if (notFound) {
    return (
      <Layout>
        <div className="text-center py-20 space-y-6">
          <h1 className="font-mono text-4xl font-bold">Token Not Found</h1>
          <p className="text-xl text-muted-foreground">
            The requested Omamori does not exist
          </p>
          <Button asChild className="font-mono">
            <Link to="/explore">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Collection
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  if (!token) return null;

  const major = majorsData[token.majorId];
  const minor = major?.minors[token.minorId];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button asChild variant="outline" className="font-mono">
            <Link to="/explore">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Collection
            </Link>
          </Button>
          
          <div className="text-center">
            <h1 className="font-mono text-2xl font-bold">
              Omamori #{token.tokenId}
            </h1>
            <p className="text-muted-foreground">
              {major?.name} → {minor?.name}
            </p>
          </div>
          
          <div className="w-32" /> {/* Spacer for centering */}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Image */}
          <div className="space-y-6">
            {/* Large SVG Display */}
            <Card className="overflow-hidden">
              <div className="aspect-[5/7] bg-parchment paper-texture">
                {token.imageSvg.startsWith('http') ? (
                  <img 
                    src={token.imageSvg} 
                    alt={`Omamori #${token.tokenId}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: token.imageSvg }}
                  />
                )}
              </div>
            </Card>
            
            {/* Image Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleCopyImage}
                variant="outline"
                className="font-mono"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy SVG
              </Button>
              
              <Button
                onClick={handleDownloadPNG}
                variant="outline"
                className="font-mono"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
            </div>
            
            {/* Share Button */}
            <Button
              onClick={handleShare}
              className="w-full font-mono"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share on Twitter
            </Button>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Overview Card */}
            <Card className="p-6">
              <h2 className="font-mono text-xl mb-4">Overview</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Major Arcanum</span>
                  <span className="font-mono font-medium">{major?.name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Minor Arcanum</span>
                  <span className="font-mono font-medium">{minor?.name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Material</span>
                  <div className="text-right">
                    <div className="font-medium">{token.materialName}</div>
                    <div className={`text-sm ${getTierColor(token.materialTier)}`}>
                      {token.materialTier}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Punches</span>
                  <span className="font-mono font-medium">{token.punchCount}/25</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">HYPE Burned</span>
                  <span className="font-mono font-medium">{formatHype(token.hypeBurned)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Minted</span>
                  <span className="text-sm">{formatDate(token.mintedAt)}</span>
                </div>
              </div>
            </Card>
            
            {/* Full Trait Table */}
            <TraitTable token={token} />
            
            {/* Action Buttons */}
            <Card className="p-6">
              <h3 className="font-mono text-lg mb-4">Actions</h3>
              <div className="space-y-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full font-mono"
                >
                  <a 
                    href="https://opensea.io/collection/hyperliquid-omamori-39961233" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    List for Sale on OpenSea
                  </a>
                </Button>
                
                <Button
                  onClick={() => setShowTransferDialog(true)}
                  disabled={!isConnected || !isOwner}
                  variant="outline"
                  className="w-full font-mono"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Transfer Token
                </Button>
                
                {!isConnected && (
                  <p className="text-xs text-muted-foreground text-center">
                    Connect your wallet to transfer this NFT
                  </p>
                )}
                
                {isConnected && !isOwner && (
                  <p className="text-xs text-muted-foreground text-center">
                    You don't own this NFT
                  </p>
                )}
                
                {isConnected && isOwner && (
                  <p className="text-xs text-muted-foreground text-center">
                    Send this NFT to another wallet address
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
        
        {/* Transfer Dialog */}
        <TransferDialog
          token={token}
          open={showTransferDialog}
          onOpenChange={setShowTransferDialog}
          onTransferComplete={() => {
            // Refresh token data or redirect to My Omamori
            toast({
              title: "Transfer Complete",
              description: "The NFT has been transferred successfully.",
            });
          }}
        />
      </div>
    </Layout>
  );
}