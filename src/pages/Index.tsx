import { Languages, Volume2 } from "lucide-react";
import FeatureToggle from "@/components/FeatureToggle";
import { toast } from "sonner";

const Index = () => {
  const handleSignLanguageToggle = (enabled: boolean) => {
    if (enabled) {
      toast.success("Sign Language to Text enabled", {
        description: "Camera access will be requested"
      });
    } else {
      toast.info("Sign Language to Text disabled");
    }
  };

  const handleTextToSpeechToggle = (enabled: boolean) => {
    if (enabled) {
      toast.success("Text to Speech enabled", {
        description: "Ready to convert text to audio"
      });
    } else {
      toast.info("Text to Speech disabled");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="mx-auto max-w-md p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg mb-2">
            <Languages className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Sign Translator
          </h1>
          <p className="text-sm text-muted-foreground">
            Enable features to start translating
          </p>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-4">
          <FeatureToggle
            title="Sign Language to Text"
            description="Translate sign language gestures to written text"
            icon={Languages}
            onToggle={handleSignLanguageToggle}
          />

          <FeatureToggle
            title="Text to Speech"
            description="Convert written text to spoken audio"
            icon={Volume2}
            onToggle={handleTextToSpeechToggle}
          />
        </div>

        {/* Footer Info */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            Click on a feature to enable or disable it
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
