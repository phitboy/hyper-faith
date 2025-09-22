import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { isAddress } from "viem";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useTransferOmamori, useWaitForTransfer, useTokenOwnership } from "@/hooks/useOmamoriContract";
import { useTransferGasEstimation } from "@/hooks/useGasEstimation";
import { useToast } from "@/hooks/use-toast";
import type { OmamoriToken } from "@/lib/contracts/omamori";
import { Send, AlertTriangle, Loader2, CheckCircle, ExternalLink } from "lucide-react";

interface TransferDialogProps {
  token: OmamoriToken | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransferComplete?: () => void;
}

export function TransferDialog({ token, open, onOpenChange, onTransferComplete }: TransferDialogProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  
  // Form state
  const [toAddress, setToAddress] = useState("");
  const [step, setStep] = useState<"input" | "confirm" | "pending" | "success">("input");
  
  // Contract hooks
  const { transfer, hash, error: transferError, isPending } = useTransferOmamori();
  const { data: receipt, isLoading: isConfirming } = useWaitForTransfer(hash);
  const { data: tokenOwner } = useTokenOwnership(token?.tokenId);
  
  // Gas estimation
  const { totalCost, isLoading: isLoadingGas } = useTransferGasEstimation(
    token?.tokenId, 
    isAddress(toAddress) ? toAddress as `0x${string}` : undefined
  );
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setToAddress("");
      setStep("input");
    }
  }, [open]);
  
  // Handle successful transfer
  useEffect(() => {
    if (receipt) {
      setStep("success");
      toast({
        title: "Transfer Successful!",
        description: `Omamori #${token?.tokenId} has been transferred successfully.`,
      });
      
      // Call completion callback after a delay
      setTimeout(() => {
        onTransferComplete?.();
        onOpenChange(false);
      }, 3000);
    }
  }, [receipt, token?.tokenId, toast, onTransferComplete, onOpenChange]);
  
  // Handle transfer errors
  useEffect(() => {
    if (transferError) {
      toast({
        title: "Transfer Failed",
        description: "Failed to transfer the NFT. Please try again.",
        variant: "destructive"
      });
      setStep("input");
    }
  }, [transferError, toast]);
  
  // Validation
  const isValidAddress = toAddress && isAddress(toAddress);
  const isOwner = address && tokenOwner && address.toLowerCase() === tokenOwner.toLowerCase();
  const isSelfTransfer = address && toAddress && address.toLowerCase() === toAddress.toLowerCase();
  
  const canProceed = isValidAddress && !isSelfTransfer && isOwner && !isLoadingGas;
  
  const handleTransfer = async () => {
    if (!token || !address || !isValidAddress || !isOwner) return;
    
    try {
      setStep("pending");
      await transfer(token.tokenId, toAddress as `0x${string}`, address);
    } catch (error) {
      console.error('Transfer error:', error);
      setStep("input");
    }
  };
  
  const handleConfirm = () => {
    setStep("confirm");
  };
  
  const handleBack = () => {
    setStep("input");
  };
  
  if (!token) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono flex items-center gap-2">
            <Send className="w-5 h-5" />
            Transfer Omamori #{token.tokenId}
          </DialogTitle>
          <DialogDescription>
            Send this NFT to another wallet address
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Ownership Check */}
          {!isOwner && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You don't own this NFT and cannot transfer it.
              </AlertDescription>
            </Alert>
          )}
          
          {step === "input" && (
            <>
              {/* Address Input */}
              <div className="space-y-2">
                <Label htmlFor="toAddress">Recipient Address</Label>
                <Input
                  id="toAddress"
                  placeholder="0x..."
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  className="font-mono"
                />
                {toAddress && !isValidAddress && (
                  <p className="text-sm text-destructive">Invalid Ethereum address</p>
                )}
                {isSelfTransfer && (
                  <p className="text-sm text-destructive">Cannot transfer to yourself</p>
                )}
              </div>
              
              {/* Gas Estimation */}
              {isValidAddress && !isSelfTransfer && totalCost && (
                <div className="space-y-2">
                  <Label>Estimated Gas Fee</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Gas Fee:</span>
                      <span className="font-mono">{totalCost.breakdown.gas} HYPE</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!canProceed}
                  className="flex-1"
                >
                  {isLoadingGas ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </>
          )}
          
          {step === "confirm" && (
            <>
              {/* Confirmation Details */}
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">NFT:</span>
                    <span className="font-mono">Omamori #{token.tokenId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">To:</span>
                    <span className="font-mono text-xs">{toAddress}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Gas Fee:</span>
                    <span className="font-mono">{totalCost?.breakdown.gas} HYPE</span>
                  </div>
                </div>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This action cannot be undone. Make sure the recipient address is correct.
                  </AlertDescription>
                </Alert>
              </div>
              
              {/* Confirmation Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleTransfer}
                  disabled={isPending}
                  className="flex-1"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    "Confirm Transfer"
                  )}
                </Button>
              </div>
            </>
          )}
          
          {step === "pending" && (
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <div>
                <p className="font-medium">Transfer in Progress</p>
                <p className="text-sm text-muted-foreground">
                  {isConfirming ? "Confirming transaction..." : "Waiting for confirmation..."}
                </p>
              </div>
              {hash && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://hyperliquid.cloud.blockscout.com/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    View Transaction
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              )}
            </div>
          )}
          
          {step === "success" && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
              <div>
                <p className="font-medium">Transfer Successful!</p>
                <p className="text-sm text-muted-foreground">
                  Omamori #{token.tokenId} has been transferred to {toAddress}
                </p>
              </div>
              {hash && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://hyperliquid.cloud.blockscout.com/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    View Transaction
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
