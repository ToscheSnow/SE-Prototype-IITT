import { useEffect, useRef } from "react";
import { PoseLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import { usePoseLandmarker } from "@/lib/usePoseLandmarker";
import { computeAllAngles, type Point3D } from "@/lib/angleUtils";

interface CameraFeedProps {
  onAngles: (angles: Record<string, number>) => void;
}

export function CameraFeed({ onAngles }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const { ready, error, detect } = usePoseLandmarker();

  // Start webcam
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCamera() {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }
    startCamera();
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  // Detection loop
  useEffect(() => {
    if (!ready) return;

    function loop() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState >= 2) {
        const result = detect(video, performance.now());
        const ctx = canvas.getContext("2d");
        if (ctx && result) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const drawer = new DrawingUtils(ctx);
          for (const landmarks of result.landmarks) {
            drawer.drawLandmarks(landmarks, { radius: 3 });
            drawer.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);

            const points: Point3D[] = landmarks.map((l) => ({
              x: l.x,
              y: l.y,
              z: l.z,
              visibility: l.visibility,
            }));
            onAngles(computeAllAngles(points));
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready, detect, onAngles]);

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full -scale-x-100"
      />
      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">
          Loading pose model…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-red-400 text-sm px-4 text-center">
          {error}
        </div>
      )}
    </div>
  );
}
