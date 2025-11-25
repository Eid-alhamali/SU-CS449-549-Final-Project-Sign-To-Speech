import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TranslationOutputProps {
  isActive: boolean;
}

const TranslationOutput = ({ isActive }: TranslationOutputProps) => {
  const [translatedText, setTranslatedText] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

  const handleCopy = async () => {
    if (!translatedText) return;
    
    try {
      await navigator.clipboard.writeText(translatedText);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy text");
    }
  };

  const handleClear = () => {
    setTranslatedText("");
    toast.info("Translation cleared");
  };

  // Simulate gesture detection (this will be replaced with actual ML model)
  const simulateGestureDetection = () => {
    const sampleTexts = [
      "Hello, how are you?",
      "Thank you for your help.",
      "I need assistance.",
      "Good morning!",
      "See you later.",
    ];
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setTranslatedText(prev => prev ? `${prev} ${randomText}` : randomText);
  };

  if (!isActive) return null;

  return (
    <Card className="border-2 border-primary/20 bg-card shadow-lg">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Translation Output</h3>
            {isDetecting && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <Loader2 className="h-3 w-3 animate-spin" />
                Detecting...
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!translatedText}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!translatedText}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Output Area */}
        <div
          className={cn(
            "min-h-[120px] max-h-[200px] overflow-y-auto rounded-lg border-2 p-4 transition-all duration-300",
            translatedText
              ? "border-primary/30 bg-primary/5"
              : "border-dashed border-muted bg-muted/30"
          )}
        >
          {translatedText ? (
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {translatedText}
            </p>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-sm text-muted-foreground">
                Start signing to see translation...
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Recognized gestures will appear here in real-time
              </p>
            </div>
          )}
        </div>

        {/* Demo Button - Remove this when integrating actual ML model */}
        <Button
          onClick={simulateGestureDetection}
          variant="outline"
          size="sm"
          className="w-full text-xs"
        >
          Simulate Gesture Detection (Demo)
        </Button>
      </div>
    </Card>
  );
};

export default TranslationOutput;
