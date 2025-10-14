import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReturningUserBannerProps {
  mintCount: number;
}

export function ReturningUserBanner({ mintCount }: ReturningUserBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner this session
    const dismissed = sessionStorage.getItem("returning_user_banner_dismissed");
    
    if (!dismissed && mintCount > 0) {
      setIsVisible(true);
    }
  }, [mintCount]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    sessionStorage.setItem("returning_user_banner_dismissed", "true");
  };

  if (!isVisible || isDismissed) return null;

  return (
    <Card className="relative p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 animate-in slide-in-from-top-4 fade-in">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="absolute top-2 right-2 h-6 w-6 p-0"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="font-mono text-2xl glyph">╬</div>
          <h3 className="font-mono text-lg font-bold">Welcome Back, Seeker</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          You've minted {mintCount} omamori {mintCount === 1 ? "talisman" : "talismans"}. Each
          journey requires its own protection. Forge another to strengthen your path.
        </p>

        <div className="text-xs font-mono text-primary">
          {mintCount === 1 && "First talisman forged. Many more await."}
          {mintCount > 1 && mintCount < 5 && "Your collection grows. The gods smile upon you."}
          {mintCount >= 5 && mintCount < 10 && "A devoted seeker. The glyphs recognize you."}
          {mintCount >= 10 && "Master collector. The temple honors your dedication."}
        </div>
      </div>
    </Card>
  );
}

