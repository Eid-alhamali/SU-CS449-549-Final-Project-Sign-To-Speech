import { useState, forwardRef, useImperativeHandle } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";



export interface TranslationOutputRef {
  addText: (text: string) => void;
  getText?: () => string;
}

interface TranslationOutputProps {
  onToggleDetection: () => void;
  isDetecting: boolean;
}
const TranslationOutput = forwardRef<TranslationOutputRef, TranslationOutputProps>(
  ({ isActive, onToggleDetection, isDetecting }, ref) => {
    const [translatedText, setTranslatedText] = useState("");
    // Internal state for loader not strictly needed if we rely on parent isDetecting, 
    // but the spinner "Detecting..." used to rely on isDetecting state. 
    // Let's rename internal state to isTyping to avoid confusion or just use parent one.
    // Actually the existing 'isDetecting' was just for the little spinner when text is added. keeping it.
    const [isTyping, setIsTyping] = useState(false);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      addText: (text: string) => {
        setTranslatedText(prev => prev ? `${prev} ${text}` : text);
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1000);
      },
      getText: () => translatedText
    }));

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





    return (
      <Card className="border-2 border-primary/20 bg-card shadow-lg">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">Translation Output</h3>
              {isTyping && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Receiving...
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isDetecting ? "destructive" : "default"}
                size="sm"
                onClick={onToggleDetection}
                className="h-8 text-xs gap-2"
              >
                {isDetecting ? "Stop Detecting" : "Start Detecting"}
              </Button>
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


        </div>
      </Card>
    );
  });

TranslationOutput.displayName = "TranslationOutput";

export default TranslationOutput;
