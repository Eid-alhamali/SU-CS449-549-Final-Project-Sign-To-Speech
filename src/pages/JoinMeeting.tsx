import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mic, MicOff, Video, VideoOff, Phone, 
  Captions, Hand, Settings, MoreVertical,
  Play, Pause
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const JoinMeeting = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const simulatedGestures = [
    "Hello", "How are you?", "Nice to meet you", 
    "Thank you", "Yes", "No", "Please", "Help",
    "I understand", "Can you repeat?"
  ];

  useEffect(() => {
    if (isVideoOn) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isVideoOn]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating && captionsEnabled) {
      interval = setInterval(() => {
        const randomGesture = simulatedGestures[Math.floor(Math.random() * simulatedGestures.length)];
        setCaptionText(prev => {
          const newText = prev ? `${prev} ${randomGesture}` : randomGesture;
          return newText.split(" ").slice(-20).join(" ");
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSimulating, captionsEnabled]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: !isMuted });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast.error("Could not access camera");
      setIsVideoOn(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleEndCall = () => {
    stopCamera();
    navigate("/");
    toast.info("Meeting ended");
  };

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
    if (!isSimulating) {
      toast.success("Gesture simulation started");
    } else {
      toast.info("Gesture simulation stopped");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Hand className="h-6 w-6 text-primary" />
          <span className="font-semibold text-foreground">Sign Translator Meeting</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/accessibility")}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Video Area */}
      <main className="flex-1 relative bg-muted/30 flex items-center justify-center p-4">
        <Card className="relative w-full max-w-4xl aspect-video bg-muted rounded-xl overflow-hidden shadow-xl">
          {isVideoOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <Hand className="h-12 w-12 text-primary" />
              </div>
            </div>
          )}

          {/* Captions Overlay */}
          {captionsEnabled && captionText && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl">
              <div className="bg-background/90 backdrop-blur-sm rounded-lg px-4 py-3 text-center shadow-lg">
                <p className="text-foreground font-medium text-lg">
                  {captionText}
                </p>
              </div>
            </div>
          )}

          {/* Simulation Badge */}
          {isSimulating && (
            <div className="absolute top-4 left-4 bg-destructive/90 text-destructive-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-destructive-foreground rounded-full animate-pulse" />
              Simulating Gestures
            </div>
          )}
        </Card>
      </main>

      {/* Controls Bar */}
      <footer className="bg-background border-t border-border px-4 py-4">
        <div className="flex items-center justify-center gap-3 max-w-2xl mx-auto">
          {/* Mic Toggle */}
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {/* Video Toggle */}
          <Button
            variant={!isVideoOn ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => setIsVideoOn(!isVideoOn)}
          >
            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          {/* Captions Toggle */}
          <Button
            variant={captionsEnabled ? "default" : "secondary"}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => {
              setCaptionsEnabled(!captionsEnabled);
              toast.info(captionsEnabled ? "Captions disabled" : "Captions enabled");
            }}
          >
            <Captions className="h-5 w-5" />
          </Button>

          {/* Simulate Gestures */}
          <Button
            variant={isSimulating ? "default" : "outline"}
            size="lg"
            className="rounded-full px-4 h-14 gap-2"
            onClick={toggleSimulation}
          >
            {isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="hidden sm:inline">Simulate</span>
          </Button>

          {/* End Call */}
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={handleEndCall}
          >
            <Phone className="h-5 w-5 rotate-[135deg]" />
          </Button>

          {/* More Options */}
          <Button
            variant="ghost"
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => navigate("/accessibility")}
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default JoinMeeting;
