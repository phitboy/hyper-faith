import { Card } from "@/components/ui/card";
import majorsData from "@/data/majors.json";

interface IntentionPickerProps {
  onSelect: (majorId: number) => void;
}

export function IntentionPicker({ onSelect }: IntentionPickerProps) {
  const formatGlyph = (glyph: string) => {
    return glyph.split('\n').map((line, i) => (
      <div key={i} className="leading-none">
        {line}
      </div>
    ));
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-mono font-bold">
          What Do You Seek?
        </h2>
        <p className="text-muted-foreground">
          Choose the intention that resonates with your journey
        </p>
      </div>

      {/* Grid of Intention Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {majorsData.map((major) => (
          <Card
            key={major.id}
            onClick={() => onSelect(major.id)}
            className="group relative p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-primary hover:shadow-lg hover:shadow-primary/20 min-h-[200px] flex flex-col items-center justify-center text-center"
          >
            {/* Glyph - Hidden by default, fades in on hover */}
            <div className="absolute top-4 left-0 right-0 font-mono text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 glyph">
              {formatGlyph(major.glyph)}
            </div>

            {/* Intention Statement - Always visible */}
            <div className="mt-auto font-serif italic text-sm md:text-base leading-relaxed text-foreground/90">
              "{major.intention}"
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

