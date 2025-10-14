import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import majorsData from "@/data/majors.json";

interface RevelationAndAspectsProps {
  majorId: number;
  onSelectAspect: (minorId: number) => void;
  onBack: () => void;
}

export function RevelationAndAspects({
  majorId,
  onSelectAspect,
  onBack,
}: RevelationAndAspectsProps) {
  const major = majorsData.find((m) => m.id === majorId);

  if (!major) {
    return <div>Major not found</div>;
  }

  const formatGlyph = (glyph: string) => {
    return glyph.split('\n').map((line, i) => (
      <div key={i} className="leading-none">
        {line}
      </div>
    ));
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="gap-2 font-mono"
      >
        <ChevronLeft className="w-4 h-4" />
        Change Intent
      </Button>

      {/* Large Major Glyph */}
      <div className="text-center space-y-4">
        <div className="font-mono text-6xl md:text-8xl leading-tight glyph">
          {formatGlyph(major.glyph)}
        </div>
        <h2 className="font-mono text-3xl md:text-4xl font-bold">
          {major.name}
        </h2>
      </div>

      {/* Revelation Text */}
      <Card className="p-8 bg-card/50 backdrop-blur border-2">
        <p className="font-serif text-lg md:text-xl leading-relaxed text-center italic">
          {major.revelation}
        </p>
      </Card>

      {/* Aspect Selection */}
      <div className="space-y-4">
        <h3 className="text-xl md:text-2xl font-mono font-bold text-center">
          Choose Your Blessing
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {major.minors.map((minor) => (
            <Card
              key={minor.id}
              onClick={() => onSelectAspect(minor.id)}
              className="group p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-primary hover:shadow-lg hover:shadow-primary/20"
            >
              <div className="flex items-center gap-4">
                {/* Aspect Glyph */}
                <div className="flex-shrink-0 font-mono text-3xl glyph group-hover:text-primary transition-colors">
                  {formatGlyph(minor.glyph)}
                </div>

                {/* Aspect Info */}
                <div className="flex-1 space-y-1">
                  <div className="font-mono font-semibold text-sm text-muted-foreground">
                    {minor.name}
                  </div>
                  <div className="font-serif italic text-base">
                    "{minor.blessing}"
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

