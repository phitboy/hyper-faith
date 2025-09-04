import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { MajorMinorPicker } from "@/components/MajorMinorPicker";
import { HypeInput } from "@/components/HypeInput";
import { OmamoriPreview } from "@/components/OmamoriPreview";
import { useOmamoriStore } from "@/store/omamoriStore";
import { mintOmamoriMock } from "@/lib/contracts/omamori";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TraitTable } from "@/components/TraitTable";
import type { OmamoriToken } from "@/lib/contracts/omamori";
import { Link } from "react-router-dom";
import { Share2, Eye } from "lucide-react";

export default function Mint() {
  const { toast } = useToast();
  const { 
    isConnected, 
    selectedMajor, 
    selectedMinor, 
    hypeAmount, 
    addToken 
  } = useOmamoriStore();
  
  const [isMinting, setIsMinting] = useState(false);
  const [mintedToken, setMintedToken] = useState<OmamoriToken | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleMint = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to mint an Omamori",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsMinting(true);
      
      // Convert HYPE to wei
      const weiAmount = (parseFloat(hypeAmount) * 1e18).toString();
      
      const token = await mintOmamoriMock({
        majorId: selectedMajor,
        minorId: selectedMinor,
        offeringHype: weiAmount
      });
      
      // Add to store
      addToken(token);
      setMintedToken(token);
      setShowSuccessModal(true);
      
      toast({
        title: "Omamori Minted!",
        description: `Successfully minted token #${token.tokenId}`,
      });
      
    } catch (error) {
      console.error('Mint error:', error);
      toast({
        title: "Mint Failed",
        description: error instanceof Error ? error.message : "Failed to mint Omamori",
        variant: "destructive"
      });
    } finally {
      setIsMinting(false);
    }
  };

  const handleShare = (token: OmamoriToken) => {
    const tweetText = `Just minted my Omamori #${token.tokenId}! 🔮\n\n${token.materialTier} ${token.materialName} with ${token.punchCount} punches\n\nMint yours at hyper.faith`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="font-mono text-4xl md:text-6xl font-bold">
            Mint an Omamori
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Protective talismans for the modern trader. Choose your arcanum, 
            offer your HYPE, and receive a unique NFT blessed by the ancient algorithms.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Selection */}
          <div className="space-y-8">
            <MajorMinorPicker />
            
            <div className="space-y-6">
              <HypeInput />
              
              {/* Mint Button */}
              <Button
                onClick={handleMint}
                disabled={!isConnected || isMinting}
                className="w-full h-12 text-lg font-mono hover-lift focus-ring"
                size="lg"
              >
                {isMinting ? 'Burning HYPE...' : 'Burn HYPE & Mint'}
              </Button>
              
              {!isConnected && (
                <p className="text-sm text-muted-foreground text-center">
                  Connect your wallet above to mint
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <div>
              <h2 className="font-mono text-xl mb-4">Live Preview</h2>
              <OmamoriPreview className="hover-lift" />
            </div>
          </div>
        </div>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-mono text-2xl">
                Omamori Minted Successfully! 🎉
              </DialogTitle>
              <DialogDescription>
                Your protective talisman has been forged in the blockchain fires
              </DialogDescription>
            </DialogHeader>
            
            {mintedToken && (
              <div className="space-y-6">
                {/* Token Preview */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="aspect-[5/7] bg-parchment paper-texture rounded overflow-hidden">
                    <div 
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: mintedToken.imageSvg }}
                    />
                  </div>
                  
                  <TraitTable token={mintedToken} />
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                  <Button
                    asChild
                    variant="outline"
                    className="font-mono"
                  >
                    <Link to="/my">
                      <Eye className="w-4 h-4 mr-2" />
                      View in My Omamori
                    </Link>
                  </Button>
                  
                  <Button
                    onClick={() => handleShare(mintedToken)}
                    variant="outline"
                    className="font-mono"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share on Twitter
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}