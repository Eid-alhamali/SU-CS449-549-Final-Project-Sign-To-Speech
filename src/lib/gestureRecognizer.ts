import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type Gesture = "Hello" | "Yes" | "No" | "Peace" | null;

export class GestureRecognizer {
  static recognize(landmarks: NormalizedLandmark[]): Gesture {
    if (!landmarks || landmarks.length === 0) return null;

    // Finger states (open or closed)
    const thumbIsOpen = this.isThumbOpen(landmarks);
    const indexIsOpen = this.isFingerOpen(landmarks, 8, 6);
    const middleIsOpen = this.isFingerOpen(landmarks, 12, 10);
    const ringIsOpen = this.isFingerOpen(landmarks, 16, 14);
    const pinkyIsOpen = this.isFingerOpen(landmarks, 20, 18);

    // "Hello" / "Stop": All fingers open
    if (thumbIsOpen && indexIsOpen && middleIsOpen && ringIsOpen && pinkyIsOpen) {
      return "Hello";
    }

    // "No" / "Fist": All fingers closed
    if (!thumbIsOpen && !indexIsOpen && !middleIsOpen && !ringIsOpen && !pinkyIsOpen) {
      return "No";
    }

    // "Yes" / "Thumbs Up": Thumb open, others closed
    if (thumbIsOpen && !indexIsOpen && !middleIsOpen && !ringIsOpen && !pinkyIsOpen) {
      return "Yes";
    }

    // "Peace": Index and middle open, others closed
    if (!thumbIsOpen && indexIsOpen && middleIsOpen && !ringIsOpen && !pinkyIsOpen) {
      return "Peace";
    }

    return null;
  }

  static isFingerOpen(landmarks: NormalizedLandmark[], tipIdx: number, pipIdx: number): boolean {
    // Simple check: is tip above PIP joint? (assuming hand is upright)
    // Note: Y coordinates are normalized (0 is top, 1 is bottom)
    // So "above" means smaller Y value
    return landmarks[tipIdx].y < landmarks[pipIdx].y;
  }

  static isThumbOpen(landmarks: NormalizedLandmark[]): boolean {
    // Thumb is a bit trickier, checking X distance from pinky base or similar
    // For simplicity in this demo, let's check if tip is to the side of the IP joint
    // This depends on handedness, but we'll try a simple X-based check relative to the wrist
    // or just check if it's extended away from the palm.

    // A robust way for upright hand: Tip x is further from pinky base x than IP x is
    // But let's stick to a simpler heuristic:
    // Check if thumb tip is "far" from index finger MCP (base)

    const thumbTip = landmarks[4];
    const indexMCP = landmarks[5]; // Base of index finger
    const pinkyMCP = landmarks[17]; // Base of pinky finger

    // Distance between thumb tip and pinky base
    const distanceToPinky = Math.sqrt(
      Math.pow(thumbTip.x - pinkyMCP.x, 2) + Math.pow(thumbTip.y - pinkyMCP.y, 2)
    );

    // Distance between index base and pinky base (reference for hand size)
    const handWidth = Math.sqrt(
      Math.pow(indexMCP.x - pinkyMCP.x, 2) + Math.pow(indexMCP.y - pinkyMCP.y, 2)
    );

    // If thumb is far from pinky, it's likely open/extended
    return distanceToPinky > handWidth * 1.5;
  }
}
