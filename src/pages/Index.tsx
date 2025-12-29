import { Hand, MessageSquareText, Volume2, Settings, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FeatureToggle from "@/components/FeatureToggle";
import TranslationOutput from "@/components/TranslationOutput";
import CameraPreview from "@/components/CameraPreview";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useRef } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [signToTextEnabled, setSignToTextEnabled] = useState(false);
  const [signToSpeechEnabled, setSignToSpeechEnabled] = useState(false);
  const translationRef = useRef<{ addText: (text: string) => void } | null>(null);

  const handleGestureDetected = (gesture: string) => {
    // This will be called when MediaPipe detects a gesture
    console.log("Gesture detected:", gesture);
    if (translationRef.current) {
      translationRef.current.addText(gesture);
    }
  };

  const handleSignLanguageToggle = (enabled: boolean) => {
    setSignToTextEnabled(enabled);
    if (enabled) {
      toast.success("Sign Language to Text enabled", {
        description: "Camera access will be requested"
      });
    } else {
      toast.info("Sign Language to Text disabled");
    }
  };

  const handleSignToSpeechToggle = (enabled: boolean) => {
    setSignToSpeechEnabled(enabled);
    if (enabled) {
      toast.success("Sign Language to Speech enabled", {
        description: "Translates gestures directly to audio"
      });
    } else {
      toast.info("Sign Language to Speech disabled");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="mx-auto max-w-md p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg mb-2">
            <Hand className="h-8 w-8" />
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
            icon={MessageSquareText}
            onToggle={handleSignLanguageToggle}
          />

          <FeatureToggle
            title="Sign Language to Speech"
            description="Translate sign language gestures directly to spoken audio"
            icon={Volume2}
            onToggle={handleSignToSpeechToggle}
          />
        </div>

        {/* Camera Preview */}
        <CameraPreview 
          isActive={signToTextEnabled} 
          onGestureDetected={handleGestureDetected}
        />

        {/* Translation Output */}
        <TranslationOutput 
          isActive={signToTextEnabled}
          ref={translationRef}
        />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate("/meeting")} 
            className="flex-1 gap-2"
            size="lg"
          >
            <Video className="h-4 w-4" />
            Join Meeting
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate("/accessibility")}
          >
            <Settings className="h-4 w-4" />
          </Button>
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
