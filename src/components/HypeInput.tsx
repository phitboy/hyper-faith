import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import { useOmamoriStore } from "@/store/omamoriStore";

export function HypeInput() {
  const { hypeAmount, setHypeAmount } = useOmamoriStore();
  const [inputValue, setInputValue] = useState(hypeAmount);

  useEffect(() => {
    setInputValue(hypeAmount);
  }, [hypeAmount]);

  const validateAndSet = (value: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    const formatted = parts.length > 2 
      ? `${parts[0]}.${parts.slice(1).join('')}` 
      : cleaned;
    
    // Validate minimum
    const numValue = parseFloat(formatted);
    if (!isNaN(numValue) && numValue >= 0.01) {
      setHypeAmount(formatted);
    } else if (formatted === '' || formatted === '0' || formatted === '0.') {
      // Allow intermediate states while typing
      setInputValue(formatted);
      return;
    }
    
    setInputValue(formatted);
  };

  const increment = () => {
    const current = parseFloat(inputValue) || 0;
    const newValue = Math.max(0.01, current + 0.01);
    const formatted = newValue.toFixed(2);
    setInputValue(formatted);
    setHypeAmount(formatted);
  };

  const decrement = () => {
    const current = parseFloat(inputValue) || 0;
    const newValue = Math.max(0.01, current - 0.01);
    const formatted = newValue.toFixed(2);
    setInputValue(formatted);
    setHypeAmount(formatted);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSet(e.target.value);
  };

  const handleBlur = () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < 0.01) {
      setInputValue('0.01');
      setHypeAmount('0.01');
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="font-mono text-sm text-muted-foreground block mb-2">
          HYPE Offering
        </label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={decrement}
            disabled={parseFloat(inputValue) <= 0.01}
            className="px-2 h-10 focus-ring"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className="relative flex-1">
            <Input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="font-mono text-lg text-center focus-ring"
              placeholder="0.01"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={increment}
            className="px-2 h-10 focus-ring"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground font-mono">
        Minimum: 0.01 HYPE • Current: {inputValue} HYPE
      </div>
      
      <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded p-2">
        💎 HYPE amount is personal choice - rarity odds are equal for everyone!
      </div>
    </div>
  );
}