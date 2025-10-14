import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface ForgingAnimationProps {
  isActive: boolean;
  onComplete?: () => void;
}

const FORGING_STAGES = [
  {
    id: 1,
    name: "Inscribing glyphs",
    glyph: "╬",
    duration: 15, // seconds
  },
  {
    id: 2,
    name: "Selecting material",
    glyph: "◇",
    duration: 15,
  },
  {
    id: 3,
    name: "Counting punches",
    glyph: "◉",
    duration: 15,
  },
  {
    id: 4,
    name: "Sealing talisman",
    glyph: "⌂",
    duration: 15,
  },
];

const TOTAL_DURATION = FORGING_STAGES.reduce((sum, stage) => sum + stage.duration, 0);

export function ForgingAnimation({ isActive, onComplete }: ForgingAnimationProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setElapsedTime(0);
      setCurrentStageIndex(0);
      return;
    }

    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedTime(elapsed);

      // Calculate which stage we're in
      let cumulativeTime = 0;
      for (let i = 0; i < FORGING_STAGES.length; i++) {
        cumulativeTime += FORGING_STAGES[i].duration;
        if (elapsed < cumulativeTime) {
          setCurrentStageIndex(i);
          break;
        }
      }

      // If we've exceeded total duration, loop back to stage 0
      if (elapsed >= TOTAL_DURATION) {
        setElapsedTime(0);
        setCurrentStageIndex(0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  const currentStage = FORGING_STAGES[currentStageIndex];
  const progress = Math.min((elapsedTime / TOTAL_DURATION) * 100, 100);

  // Calculate stage-specific progress
  const stageStartTime = FORGING_STAGES.slice(0, currentStageIndex).reduce(
    (sum, stage) => sum + stage.duration,
    0
  );
  const stageProgress = Math.min(
    ((elapsedTime - stageStartTime) / currentStage.duration) * 100,
    100
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-8 space-y-6 animate-in fade-in zoom-in-95">
        {/* Animated Glyph */}
        <div className="text-center">
          <div className="font-mono text-8xl glyph animate-pulse">
            {currentStage.glyph}
          </div>
        </div>

        {/* Current Stage */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-mono font-bold">{currentStage.name}</h3>
          <p className="text-sm text-muted-foreground">
            Stage {currentStageIndex + 1} of {FORGING_STAGES.length}
          </p>
        </div>

        {/* Stage Progress */}
        <div className="space-y-2">
          <Progress value={stageProgress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>Stage Progress</span>
            <span>{Math.floor(stageProgress)}%</span>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>Overall Progress</span>
            <span>{Math.floor(progress)}%</span>
          </div>
        </div>

        {/* Stage Indicators */}
        <div className="flex justify-between items-center">
          {FORGING_STAGES.map((stage, index) => (
            <div
              key={stage.id}
              className={`flex flex-col items-center gap-1 transition-all ${
                index === currentStageIndex
                  ? "text-primary scale-110"
                  : index < currentStageIndex
                  ? "text-green-500"
                  : "text-muted-foreground/50"
              }`}
            >
              <div className="font-mono text-2xl glyph">{stage.glyph}</div>
              <div className="text-xs font-mono">{index + 1}</div>
            </div>
          ))}
        </div>

        {/* Time Estimate */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-center gap-2 text-blue-800">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-mono">
              Transaction typically takes ~60 seconds
            </span>
          </div>
        </Card>

        {/* Ceremonial Text */}
        <p className="text-center text-xs text-muted-foreground italic font-serif">
          The gods are forging your omamori...
        </p>
      </Card>
    </div>
  );
}

