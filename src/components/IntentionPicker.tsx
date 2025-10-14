import { Card } from "@/components/ui/card";
import majorsData from "@/data/majors.json";

interface IntentionPickerProps {
  onSelect: (majorId: number) => void;
}

export function IntentionPicker({ onSelect }: IntentionPickerProps) {
  const handleCardClick = (majorId: number, majorName: string) => {
    console.log('IntentionPicker: Card clicked', { majorId, majorName });
    onSelect(majorId);
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
            onClick={() => handleCardClick(major.id, major.name)}
            className="group relative p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-primary hover:shadow-lg hover:shadow-primary/20 min-h-[200px] flex flex-col items-center justify-center text-center overflow-hidden"
          >
            {/* Glyph - Hidden by default, fades in on hover */}
            <div className="absolute inset-0 flex items-center justify-center font-mono text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 glyph pointer-events-none whitespace-pre-line">
              {major.glyph}
            </div>

            {/* Intention Statement - Always visible, fades on hover */}
            <div className="font-serif italic text-sm md:text-base leading-relaxed text-foreground/90 group-hover:opacity-0 transition-opacity duration-300">
              "{major.intention}"
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

