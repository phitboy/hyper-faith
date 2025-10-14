import React, { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { IntentionPicker } from "@/components/IntentionPicker";
import { RevelationAndAspects } from "@/components/RevelationAndAspects";
import { PreviewAndOffering } from "@/components/PreviewAndOffering";
import { ForgingAnimation } from "@/components/ForgingAnimation";
import { ReturningUserBanner } from "@/components/ReturningUserBanner";
import { useOmamoriStore } from "@/store/omamoriStore";
import { useMintOmamori, useWaitForMint } from "@/hooks/useOmamoriContract";
import { useOmamoriEvents } from "@/hooks/useContractEvents";
import { extractTokenIdFromLogs, validateHypeAmount, getContractErrorMessage } from "@/lib/contracts/realOmamori";
import { fetchTokenById } from "@/lib/contracts/tokenQueries";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TraitTable } from "@/components/TraitTable";
import type { OmamoriToken } from "@/lib/contracts/omamori";
import { Link } from "react-router-dom";
import { Share2, Eye } from "lucide-react";
import { hyperEVM } from "@/lib/chains";

type MintStep = 'intention' | 'revelation' | 'offering' | 'forging';
export default function Mint() {
  const { toast } = useToast();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const {
    selectedMajor,
    selectedMinor,
    hypeAmount,
    addToken,
    setSelectedMajor,
    setSelectedMinor,
  } = useOmamoriStore();
  
  // Contract hooks
  const { mint, hash, error: mintError, isPending } = useMintOmamori();
  const { data: receipt, isLoading: isConfirming } = useWaitForMint(hash);
  
  // State
  const [currentStep, setCurrentStep] = useState<MintStep>('intention');
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);
  const [mintedToken, setMintedToken] = useState<OmamoriToken | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userMintCount, setUserMintCount] = useState(0);
  
  // Check if we're on the correct network
  const isCorrectNetwork = chainId === hyperEVM.id;
  
  // Enable real-time event listening
  useOmamoriEvents();

  // Load user mint count from localStorage
  useEffect(() => {
    const storedCount = localStorage.getItem('user_mint_count');
    if (storedCount) {
      setUserMintCount(parseInt(storedCount, 10));
    }
  }, []);
  
  // Step navigation handlers
  const handleSelectIntention = (majorId: number) => {
    setSelectedMajor(majorId);
    setCurrentStep('revelation');
  };

  const handleSelectAspect = (minorId: number) => {
    setSelectedMinor(minorId);
    setCurrentStep('offering');
  };

  const handleBackToIntention = () => {
    setCurrentStep('intention');
  };

  const handleBackToRevelation = () => {
    setCurrentStep('revelation');
  };

  const handleMint = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet in the header to mint",
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
      setCurrentStep('forging');
      await mint(hypeAmount, selectedMajor, selectedMinor);
      
      toast({
        title: "Transaction Submitted",
        description: "Forging your omamori...",
      });
    } catch (error) {
      console.error('Mint error:', error);
      setCurrentStep('offering'); // Return to offering on error
      toast({
        title: "Mint Failed",
        description: getContractErrorMessage(error),
        variant: "destructive"
      });
    }
  };
  
  // Handle successful transaction
  useEffect(() => {
    if (receipt && receipt.status === 'success') {
      // Extract token ID from transaction logs
      const tokenId = extractTokenIdFromLogs(receipt.logs);
      
      if (tokenId) {
        setMintedTokenId(tokenId);
        setCurrentStep('intention'); // Reset to start for next mint
        
        // Increment mint count
        const newCount = userMintCount + 1;
        setUserMintCount(newCount);
        localStorage.setItem('user_mint_count', newCount.toString());
        
        toast({
          title: "Omamori Forged!",
          description: `Successfully minted token #${tokenId}`,
        });
      }
    }
  }, [receipt, toast, userMintCount]);
  
  // Handle token metadata fetching
  useEffect(() => {
    if (mintedTokenId) {
      const fetchTokenData = async () => {
        try {
          const token = await fetchTokenById(mintedTokenId);
          if (token) {
            setMintedToken(token);
            addToken(token);
            setShowSuccessModal(true);
          } else {
            throw new Error('Token not found');
          }
        } catch (error) {
          console.error('Failed to fetch token metadata:', error);
          toast({
            title: "Metadata Error",
            description: "Token minted but failed to load metadata",
            variant: "destructive"
          });
        }
      };
      
      fetchTokenData();
    }
  }, [mintedTokenId, addToken, toast]);
  
  // Handle mint errors
  useEffect(() => {
    if (mintError) {
      setCurrentStep('offering'); // Return to offering on error
      toast({
        title: "Transaction Failed",
        description: getContractErrorMessage(mintError),
        variant: "destructive"
      });
    }
  }, [mintError, toast]);
  
  const isMinting = isPending || isConfirming;
  
  const handleShare = (token: OmamoriToken) => {
    const tweetText = `Just forged my Omamori #${token.tokenId}!\n\n${token.materialTier} ${token.materialName} with ${token.punchCount} punches\n\nMint yours at hyper.faith`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="font-mono text-4xl md:text-6xl font-bold">Forge Your Omamori</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ancient talismans for the modern trader. 100% of HYPE offered supports the assistance fund.
          </p>
        </div>

        {/* Returning User Banner */}
        {userMintCount > 0 && <ReturningUserBanner mintCount={userMintCount} />}

        {/* Step-based Content */}
        <div className="min-h-[600px]">
          {currentStep === 'intention' && (
            <IntentionPicker onSelect={handleSelectIntention} />
          )}

          {currentStep === 'revelation' && (
            <RevelationAndAspects
              majorId={selectedMajor}
              onSelectAspect={handleSelectAspect}
              onBack={handleBackToIntention}
            />
          )}

          {currentStep === 'offering' && (
            <PreviewAndOffering
              majorId={selectedMajor}
              minorId={selectedMinor}
              onMint={handleMint}
              onBack={handleBackToRevelation}
              isMinting={isMinting}
              isPending={isPending}
              isConfirming={isConfirming}
            />
          )}

          {/* Forging Animation (Full Screen Overlay) */}
          <ForgingAnimation isActive={currentStep === 'forging' || isMinting} />
        </div>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-mono text-2xl">
                Omamori Forged Successfully!
              </DialogTitle>
              <DialogDescription>
                Your protective talisman has been sealed by the blockchain
              </DialogDescription>
            </DialogHeader>

            {mintedToken && (
              <div className="space-y-6">
                {/* Token Preview */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="aspect-[5/7] bg-parchment paper-texture rounded overflow-hidden">
                    {mintedToken.imageSvg.startsWith('http') ? (
                      <img
                        src={mintedToken.imageSvg}
                        alt={`Omamori #${mintedToken.tokenId}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        dangerouslySetInnerHTML={{
                          __html: mintedToken.imageSvg,
                        }}
                      />
                    )}
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