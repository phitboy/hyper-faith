import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import majorsData from "@/data/majors.json";
import { useOmamoriStore } from "@/store/omamoriStore";

export function MajorMinorPicker() {
  const { selectedMajor, selectedMinor, setMintSelection } = useOmamoriStore();
  const [selectedMajorId, setSelectedMajorId] = useState(selectedMajor);

  const currentMajor = majorsData[selectedMajorId];

  const handleMajorSelect = (majorId: number) => {
    setSelectedMajorId(majorId);
    setMintSelection(majorId, 0); // Reset to first minor
  };

  const handleMinorSelect = (minorId: number) => {
    setMintSelection(selectedMajorId, minorId);
  };

  const formatGlyph = (glyph: string) => {
    return glyph.split('\\n').map((line, i) => (
      <div key={i} className="leading-none">
        {line}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Major Selection */}
      <div>
        <h3 className="font-mono text-lg mb-4">Choose Major Arcanum</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {majorsData.map((major) => (
            <Card
              key={major.id}
              className={`p-4 cursor-pointer transition-all hover-lift ${
                selectedMajorId === major.id
                  ? 'bg-accent border-primary' 
                  : 'bg-card hover:bg-accent/50'
              }`}
              onClick={() => handleMajorSelect(major.id)}
            >
              <div className="text-center">
                <div className="font-mono text-2xl mb-2 leading-tight glyph">
                  {formatGlyph(major.glyph)}
                </div>
                <div className="text-sm font-medium">
                  {major.name}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Minor Selection */}
      {currentMajor && (
        <div>
          <h3 className="font-mono text-lg mb-4">
            Choose Minor: {currentMajor.name}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {currentMajor.minors.map((minor) => (
              <Card
                key={minor.id}
                className={`p-4 cursor-pointer transition-all hover-lift ${
                  selectedMinor === minor.id
                    ? 'bg-accent border-primary' 
                    : 'bg-card hover:bg-accent/50'
                }`}
                onClick={() => handleMinorSelect(minor.id)}
              >
                <div className="text-center">
                  <div className="font-mono text-xl mb-2 leading-tight glyph">
                    {formatGlyph(minor.glyph)}
                  </div>
                  <div className="text-sm font-medium">
                    {minor.name}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}