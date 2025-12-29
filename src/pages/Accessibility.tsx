import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Type, Palette, Eye, Volume2, 
  Hand, Brain, Camera, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const Accessibility = () => {
  const navigate = useNavigate();
  
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem("a11y-fontSize") || "100");
  });
  
  const [fontColor, setFontColor] = useState(() => {
    return localStorage.getItem("a11y-fontColor") || "default";
  });
  
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem("a11y-highContrast") === "true";
  });
  
  const [reduceMotion, setReduceMotion] = useState(() => {
    return localStorage.getItem("a11y-reduceMotion") === "true";
  });

  useEffect(() => {
    localStorage.setItem("a11y-fontSize", fontSize.toString());
    document.documentElement.style.setProperty("--a11y-font-scale", `${fontSize / 100}`);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("a11y-fontColor", fontColor);
  }, [fontColor]);

  useEffect(() => {
    localStorage.setItem("a11y-highContrast", highContrast.toString());
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem("a11y-reduceMotion", reduceMotion.toString());
    if (reduceMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  }, [reduceMotion]);

  const colorOptions = [
    { value: "default", label: "Default", color: "hsl(var(--foreground))" },
    { value: "yellow", label: "Yellow", color: "#FBBF24" },
    { value: "cyan", label: "Cyan", color: "#22D3EE" },
    { value: "green", label: "Green", color: "#4ADE80" },
  ];

  const handleReset = () => {
    setFontSize(100);
    setFontColor("default");
    setHighContrast(false);
    setReduceMotion(false);
    toast.success("Settings reset to defaults");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="mx-auto max-w-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Accessibility & About</h1>
            <p className="text-sm text-muted-foreground">Customize your experience</p>
          </div>
        </div>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              About Sign Translator
            </CardTitle>
            <CardDescription>
              Helping people who are hard of speaking and hard of hearing communicate effectively
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sign Translator uses advanced computer vision and machine learning to bridge 
              communication gaps. Our mission is to make conversations accessible to everyone.
            </p>
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Technologies We Use
              </h4>
              
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Camera className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">MediaPipe Hands</p>
                    <p className="text-xs text-muted-foreground">
                      Google's real-time hand tracking solution that detects 21 hand landmarks 
                      with high accuracy, enabling gesture recognition directly in your browser.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Hand className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Gesture Recognition</p>
                    <p className="text-xs text-muted-foreground">
                      Our system analyzes hand positions and movements to interpret sign language 
                      gestures and convert them to text in real-time.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Volume2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Web Speech API</p>
                    <p className="text-xs text-muted-foreground">
                      Browser-native text-to-speech technology that converts recognized gestures 
                      to spoken audio, enabling hands-free communication.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-foreground">
                <strong>Privacy First:</strong> All processing happens locally in your browser. 
                Your camera feed and gestures are never sent to external servers.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Accessibility Settings
            </CardTitle>
            <CardDescription>
              Adjust these settings to improve your experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Font Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Font Size
                </Label>
                <span className="text-sm text-muted-foreground">{fontSize}%</span>
              </div>
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                min={75}
                max={150}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Smaller</span>
                <span>Larger</span>
              </div>
            </div>

            <Separator />

            {/* Caption Color */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Caption Text Color
              </Label>
              <RadioGroup value={fontColor} onValueChange={setFontColor} className="grid grid-cols-2 gap-2">
                {colorOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label 
                      htmlFor={option.value} 
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span 
                        className="w-4 h-4 rounded-full border border-border" 
                        style={{ backgroundColor: option.color }}
                      />
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  High Contrast Mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Increases contrast for better visibility
                </p>
              </div>
              <Switch checked={highContrast} onCheckedChange={setHighContrast} />
            </div>

            <Separator />

            {/* Reduce Motion */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reduce Motion</Label>
                <p className="text-xs text-muted-foreground">
                  Minimizes animations and transitions
                </p>
              </div>
              <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} />
            </div>

            <Separator />

            {/* Reset Button */}
            <Button variant="outline" onClick={handleReset} className="w-full">
              Reset to Defaults
            </Button>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/")} className="flex-1">
            Back to Home
          </Button>
          <Button onClick={() => navigate("/meeting")} className="flex-1">
            Join Meeting
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;
