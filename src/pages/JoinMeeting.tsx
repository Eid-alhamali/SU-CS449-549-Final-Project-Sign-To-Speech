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
import { HandLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

const JoinMeeting = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Initialize MediaPipe Hand Landmarker
  useEffect(() => {
    const initializeHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        setHandLandmarker(landmarker);
      } catch (error) {
        console.error("Error initializing Hand Landmarker:", error);
      }
    };
    initializeHandLandmarker();
  }, []);

  // Initialize WebSocket
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/predict");
    ws.onopen = () => console.log("Connected to Backend AI (Meeting)");
    ws.onmessage = (event) => {
      const prediction = event.data;
      if (prediction && prediction !== "?") {
        updateCaption(prediction);
      }
    };
    setSocket(ws);
    return () => ws.close();
  }, []);

  const updateCaption = (text: string) => {
    setCaptionText(prev => {
      const words = prev.split(" ");
      const lastWord = words[words.length - 1];

      if (lastWord === text) {
        return prev;
      }

      const newText = prev ? `${prev} ${text}` : text;
      return newText.split(" ").slice(-20).join(" ");
    });
  };

  useEffect(() => {
    if (isVideoOn) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isVideoOn]);

  // Detection Loop when Simulating (Translating)
  useEffect(() => {
    if (isSimulating && isVideoOn && handLandmarker && videoRef.current) {
      detectHands();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [isSimulating, isVideoOn, handLandmarker]);

  const detectHands = () => {
    if (!videoRef.current || !canvasRef.current || !handLandmarker) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(detectHands);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const startTimeMs = performance.now();
    const results = handLandmarker.detectForVideo(video, startTimeMs);

    if (results.landmarks && results.landmarks.length > 0) {
      const drawingUtils = new DrawingUtils(ctx);
      for (const landmarks of results.landmarks) {
        drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: "rgba(24, 184, 196, 0.8)", lineWidth: 3 });
        drawingUtils.drawLandmarks(landmarks, { color: "rgba(255, 107, 107, 0.9)", lineWidth: 2, radius: 4 });

        if (socket && socket.readyState === WebSocket.OPEN) {
          const simplifiedLandmarks = landmarks.map(lm => ({ x: lm.x, y: lm.y, z: lm.z }));
          socket.send(JSON.stringify(simplifiedLandmarks));
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(detectHands);
  };


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
      toast.success("AI Translation started");
    } else {
      toast.info("AI Translation stopped");
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
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
              />
            </>
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
              AI Translation Active
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
            <span className="hidden sm:inline">Translate</span>
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
