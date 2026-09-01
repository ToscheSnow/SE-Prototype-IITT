import { useEffect, useRef, useState } from "react";
import { CameraIcon } from "lucide-react";
import { PoseLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import { usePoseLandmarker } from "@/lib/usePoseLandmarker";
import { computeAllAngles, type Point3D } from "@/lib/angleUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CameraFeedProps {
  onAngles: (angles: Record<string, number>) => void;
}

export function CameraFeed({ onAngles }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { ready, error, detect } = usePoseLandmarker();

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        setCameraError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: cameraId ? { deviceId: { exact: cameraId } } : { facingMode: "user" },
          audio: false,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;

        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameras(devices.filter((device) => device.kind === "videoinput"));
      } catch (cause) {
        setCameraError(cause instanceof Error ? cause.message : "We could not access this camera.");
      }
    }

    startCamera();
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, [cameraId]);

  useEffect(() => {
    if (!ready) return;

    function loop() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState >= 2) {
        const result = detect(video, performance.now());
        const context = canvas.getContext("2d");
        if (context && result) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.clearRect(0, 0, canvas.width, canvas.height);

          const drawer = new DrawingUtils(context);
          for (const landmarks of result.landmarks) {
            drawer.drawLandmarks(landmarks, { radius: 3 });
            drawer.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);
            const points: Point3D[] = landmarks.map((landmark) => ({
              x: landmark.x,
              y: landmark.y,
              z: landmark.z,
              visibility: landmark.visibility,
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
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full -scale-x-100 object-cover" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full -scale-x-100" />
      <div className="absolute left-3 top-3 z-10 w-56">
        <Select value={cameraId || "default"} onValueChange={(value) => setCameraId(value === "default" ? "" : value ?? "")}>
          <SelectTrigger className="h-9 w-full border-white/15 bg-slate-950/75 text-xs text-white backdrop-blur"><CameraIcon className="size-3.5 text-teal-300" /><SelectValue placeholder="Select camera" /></SelectTrigger>
          <SelectContent><SelectItem value="default">Default laptop camera</SelectItem>{cameras.map((camera, index) => <SelectItem key={camera.deviceId} value={camera.deviceId}>{camera.label || `Camera ${index + 1}`}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {!ready && !error && !cameraError && <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">Loading pose model…</div>}
      {(error || cameraError) && <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-red-300">{error || cameraError}</div>}
    </div>
  );
}
