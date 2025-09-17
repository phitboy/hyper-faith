import React, { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { MajorMinorPicker } from "@/components/MajorMinorPicker";
import { HypeInput } from "@/components/HypeInput";
import { FairPreview } from "@/components/FairPreview";
import { GasEstimator } from "@/components/GasEstimator";
import { useOmamoriStore } from "@/store/omamoriStore";
import { useMintOmamori, useWaitForMint, useTokenURI } from "@/hooks/useOmamoriContract";
import { useOmamoriEvents } from "@/hooks/useContractEvents";
import { parseTokenURI, extractTokenIdFromLogs, validateHypeAmount, getContractErrorMessage } from "@/lib/contracts/realOmamori";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TraitTable } from "@/components/TraitTable";
import type { OmamoriToken } from "@/lib/contracts/omamori";
import { Link } from "react-router-dom";
import { Share2, Eye, Loader2 } from "lucide-react";
import { hyperEVM } from "@/lib/chains";
export default function Mint() {
  const { toast } = useToast();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const {
    selectedMajor,
    selectedMinor,
    hypeAmount,
    addToken
  } = useOmamoriStore();
  
  // Contract hooks
  const { mint, hash, error: mintError, isPending } = useMintOmamori();
  const { data: receipt, isLoading: isConfirming } = useWaitForMint(hash);
  
  // State
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);
  const [mintedToken, setMintedToken] = useState<OmamoriToken | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Fetch token metadata after successful mint
  const { data: tokenURI } = useTokenURI(mintedTokenId || undefined);
  
  // Check if we're on the correct network
  const isCorrectNetwork = chainId === hyperEVM.id;
  
  // Enable real-time event listening
  useOmamoriEvents();
  
  const handleMint = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to mint an Omamori",
        variant: "destructive"
      });
      return;
    }
    
    if (!isCorrectNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to HyperEVM network",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateHypeAmount(hypeAmount)) {
      toast({
        title: "Invalid Amount",
        description: "Minimum 0.01 HYPE required to mint",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await mint(hypeAmount, selectedMajor, selectedMinor);
      
      toast({
        title: "Transaction Submitted",
        description: "Waiting for confirmation...",
      });
    } catch (error) {
      console.error('Mint error:', error);
      toast({
        title: "Mint Failed",
        description: getContractErrorMessage(error),
        variant: "destructive"
      });
    }
  };
  
  // Handle successful transaction
  React.useEffect(() => {
    if (receipt && receipt.status === 'success') {
      // Extract token ID from transaction logs
      const tokenId = extractTokenIdFromLogs(receipt.logs);
      
      if (tokenId) {
        setMintedTokenId(tokenId);
        toast({
          title: "Omamori Minted!",
          description: `Successfully minted token #${tokenId}`,
        });
      }
    }
  }, [receipt, toast]);
  
  // Handle token metadata fetching
  React.useEffect(() => {
    if (mintedTokenId && tokenURI) {
      try {
        const token = parseTokenURI(mintedTokenId, tokenURI);
        setMintedToken(token);
        addToken(token);
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Failed to parse token metadata:', error);
        toast({
          title: "Metadata Error",
          description: "Token minted but failed to load metadata",
          variant: "destructive"
        });
      }
    }
  }, [mintedTokenId, tokenURI, addToken, toast]);
  
  // Handle mint errors
  React.useEffect(() => {
    if (mintError) {
      toast({
        title: "Transaction Failed",
        description: getContractErrorMessage(mintError),
        variant: "destructive"
      });
    }
  }, [mintError, toast]);
  
  const isMinting = isPending || isConfirming;
  const handleShare = (token: OmamoriToken) => {
    const tweetText = `Just minted my Omamori #${token.tokenId}!\n\n${token.materialTier} ${token.materialName} with ${token.punchCount} punches\n\nMint yours at hyper.faith`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
  };
  return <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="font-mono text-4xl md:text-6xl font-bold">Orderbook Omamori</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Ancient talismans for the modern trader. 100% of $HYPE offered is "burned" to the assistance fund.</p>
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
                disabled={!isConnected || !isCorrectNetwork || isMinting} 
                className="w-full h-12 text-lg font-mono hover-lift focus-ring" 
                size="lg"
              >
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isConfirming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isPending ? 'Confirm in Wallet...' : 
                 isConfirming ? 'Minting...' : 
                 'Burn HYPE & Mint'}
              </Button>
              
              {!isConnected && (
                <p className="text-sm text-muted-foreground text-center">
                  Connect your wallet above to mint
                </p>
              )}
              
              {isConnected && !isCorrectNetwork && (
                <p className="text-sm text-destructive text-center">
                  Please switch to HyperEVM network to mint
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Fair Preview */}
          <div className="space-y-6">
            <FairPreview />
            <GasEstimator hypeAmount={hypeAmount} />
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
            
            {mintedToken && <div className="space-y-6">
                {/* Token Preview */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="aspect-[5/7] bg-parchment paper-texture rounded overflow-hidden">
                    <div className="w-full h-full" dangerouslySetInnerHTML={{
                  __html: mintedToken.imageSvg
                }} />
                  </div>
                  
                  <TraitTable token={mintedToken} />
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                  <Button asChild variant="outline" className="font-mono">
                    <Link to="/my">
                      <Eye className="w-4 h-4 mr-2" />
                      View in My Omamori
                    </Link>
                  </Button>
                  
                  <Button onClick={() => handleShare(mintedToken)} variant="outline" className="font-mono">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share on Twitter
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>;
}