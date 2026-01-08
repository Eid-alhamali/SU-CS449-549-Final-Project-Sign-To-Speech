import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HandLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

interface CameraPreviewProps {
  isActive: boolean;
  onGestureDetected?: (gesture: string) => void;
}

const CameraPreview = ({ isActive, onGestureDetected }: CameraPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
        console.log("MediaPipe Hand Landmarker initialized");
      } catch (error) {
        console.error("Error initializing Hand Landmarker:", error);
        toast.error("Failed to initialize hand detection");
      }
    };

    initializeHandLandmarker();

    return () => {
      if (handLandmarker) {
        handLandmarker.close();
      }
    };
  }, []);

  // Start camera
  const startCamera = async () => {
    if (!handLandmarker) {
      toast.error("Hand detection not ready yet");
      return;
    }

    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        toast.success("Camera started");


      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera. Please check permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsCameraActive(false);
    toast.info("Camera stopped");
  };

  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Initialize WebSocket
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/predict");

    ws.onopen = () => {
      console.log("Connected to Backend AI");
      toast.success("Connected to AI Model");
    };

    ws.onmessage = (event) => {
      const prediction = event.data;
      if (onGestureDetected && prediction && prediction !== "?") {
        onGestureDetected(prediction);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  // Detect hands in video
  const detectHands = () => {
    if (!videoRef.current || !canvasRef.current || !handLandmarker) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(detectHands);
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Detect hands
    const startTimeMs = performance.now();
    const results = handLandmarker.detectForVideo(video, startTimeMs);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw hand landmarks
    if (results.landmarks && results.landmarks.length > 0) {
      const drawingUtils = new DrawingUtils(ctx);

      for (const landmarks of results.landmarks) {
        // Draw connections
        drawingUtils.drawConnectors(
          landmarks,
          HandLandmarker.HAND_CONNECTIONS,
          { color: "rgba(24, 184, 196, 0.8)", lineWidth: 3 }
        );

        // Draw landmarks
        drawingUtils.drawLandmarks(
          landmarks,
          { color: "rgba(255, 107, 107, 0.9)", lineWidth: 2, radius: 4 }
        );

        // Send landmarks to backend
        if (socket && socket.readyState === WebSocket.OPEN) {
          // Extract x, y, z
          const simplifiedLandmarks = landmarks.map(lm => ({ x: lm.x, y: lm.y, z: lm.z }));
          socket.send(JSON.stringify(simplifiedLandmarks));
        }
      }
    }

    // Continue detection loop
    animationFrameRef.current = requestAnimationFrame(detectHands);
  };

  // Handle active state changes & Detection Loop
  useEffect(() => {
    if (isActive && handLandmarker && !isCameraActive) {
      startCamera();
    } else if (!isActive && isCameraActive) {
      stopCamera();
    }

    // Manage Detection Loop
    if (isActive && isCameraActive && handLandmarker && videoRef.current) {
      detectHands();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [isActive, handLandmarker, isCameraActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);



  return (
    <Card className="border-2 border-secondary/20 bg-card shadow-lg overflow-hidden">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Camera Preview</h3>

          {isCameraActive ? (
            <Button
              variant="outline"
              size="sm"
              onClick={stopCamera}
              className="gap-2"
            >
              <CameraOff className="h-4 w-4" />
              Stop Camera
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={startCamera}
              disabled={isLoading || !handLandmarker}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              {isLoading ? "Starting..." : "Start Camera"}
            </Button>
          )}
        </div>

        {/* Video Preview */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "absolute inset-0 w-full h-full object-cover",
              !isCameraActive && "hidden"
            )}
          />

          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <Camera className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Click "Start Camera" to begin hand detection
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Camera permission will be requested
              </p>
            </div>
          )}
        </div>

        {/* Status Info */}
        {isCameraActive && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Hand detection active
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CameraPreview;
