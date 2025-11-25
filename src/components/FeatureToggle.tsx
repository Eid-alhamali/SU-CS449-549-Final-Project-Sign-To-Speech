import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FeatureToggleProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onToggle?: (enabled: boolean) => void;
}

const FeatureToggle = ({ title, description, icon: Icon, onToggle }: FeatureToggleProps) => {
  const [enabled, setEnabled] = useState(false);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    onToggle?.(newState);
  };

  return (
    <Card
      onClick={handleToggle}
      className={cn(
        "cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]",
        "border-2 p-6",
        enabled
          ? "bg-gradient-to-br from-primary/10 to-accent/10 border-primary shadow-lg"
          : "bg-card border-border hover:border-primary/50 shadow-sm"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "rounded-xl p-3 transition-all duration-300",
            enabled 
              ? "bg-primary text-primary-foreground shadow-md" 
              : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground leading-tight">{title}</h3>
            <div
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors duration-300",
                enabled ? "bg-primary" : "bg-input"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-md transition-transform duration-300",
                  enabled ? "translate-x-[22px]" : "translate-x-0.5"
                )}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-snug">{description}</p>
          
          {enabled && (
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Active
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FeatureToggle;
