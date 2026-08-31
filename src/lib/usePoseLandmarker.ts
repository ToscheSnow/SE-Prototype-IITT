import { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  PoseLandmarker,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";

// Loads the MediaPipe Pose model once, then exposes a `detect(video, timestamp)`
// function you can call inside a requestAnimationFrame loop.
export function usePoseLandmarker() {
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });
        if (!cancelled) {
          landmarkerRef.current = landmarker;
          setReady(true);
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    }

    init();
    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
    };
  }, []);

  function detect(video: HTMLVideoElement, timestampMs: number): PoseLandmarkerResult | null {
    if (!landmarkerRef.current) return null;
    return landmarkerRef.current.detectForVideo(video, timestampMs);
  }

  return { ready, error, detect };
}
