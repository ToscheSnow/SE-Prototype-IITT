# Yoga Pose Competence Checker — Project Structure

A single-page React + TypeScript app that uses your webcam to detect a yoga
pose in real time and scores how closely it matches the ideal form.

## Tech Stack

| Layer          | Choice                                                                               |
| -------------- | ------------------------------------------------------------------------------------ |
| Framework      | React 19 + TypeScript, Vite                                                          |
| Compiler       | React Compiler (babel plugin — auto-memoization, no manual `useMemo`/`useCallback`)  |
| Styling        | Tailwind CSS v4                                                                      |
| UI components  | shadcn/ui (Base UI preset)                                                           |
| Pose detection | MediaPipe Tasks Vision — `PoseLandmarker` model, runs fully client-side via WASM/GPU |
| Backend        | None — everything runs in the browser                                                |

## Folder Layout

```
yoga-prototype/
├── src/
│   ├── App.tsx                  # Main screen — layout + state glue
│   ├── components/
│   │   ├── CameraFeed.tsx       # Webcam + skeleton overlay + detection loop
│   │   └── ui/                  # shadcn-generated components (card, select, progress, badge)
│   ├── lib/
│   │   ├── angleUtils.ts        # Generic joint-angle math (reusable, pose-agnostic)
│   │   ├── poseLibrary.ts       # Pose definitions (target angles) + scoring logic
│   │   └── usePoseLandmarker.ts # Hook that loads & runs the MediaPipe model
│   └── index.css                # Tailwind entry point
├── vite.config.ts               # Path alias (@/*) + Tailwind + React Compiler plugins
├── tsconfig.json / tsconfig.app.json
└── package.json
```

## How Data Flows

```
Webcam
  │  getUserMedia()
  ▼
<video> element (CameraFeed.tsx)
  │  every animation frame
  ▼
usePoseLandmarker.detect(video, timestamp)
  │  MediaPipe returns 33 body landmarks (x, y, z, visibility)
  ▼
computeAllAngles() (angleUtils.ts)
  │  converts landmark triplets → joint angles in degrees
  ▼
onAngles callback → App.tsx state
  │
  ▼
scorePose(angles, activePose) (poseLibrary.ts)
  │  compares live angles to the selected pose's target angles
  ▼
{ score, perJoint, feedback } → rendered in the sidebar Cards
```

The skeleton overlay (dots + connecting lines) is drawn straight onto a
`<canvas>` positioned over the `<video>`, using MediaPipe's own
`DrawingUtils` — this is separate from the angle-scoring pipeline, it's
purely visual.

## Key Files Explained

### `lib/angleUtils.ts`

Pure math, no React. Given any three landmark points (`a`, vertex `b`, `c`),
`angleBetweenPoints()` returns the angle at the vertex. `COMMON_JOINTS` maps
human-readable joint names (`leftElbow`, `rightKnee`, etc.) to which three
landmark indices form that joint, using MediaPipe's fixed 33-point skeleton
numbering. This file has zero knowledge of yoga — it would work for any
angle-based movement app.

### `lib/poseLibrary.ts`

This is where the actual yoga content lives. `POSE_LIBRARY` is an array of
pose objects — name, description, benefits, cautions, and a `targets` map of
`{ jointKey: { target: degrees, tolerance: degrees } }`. `scorePose()` takes
the live angles plus a chosen pose and returns a 0–100 score (linear falloff
per joint, averaged) and plain-English feedback strings. **Adding a new pose
is just adding a new object to this array — no other code changes needed.**

### `lib/usePoseLandmarker.ts`

A React hook that loads the MediaPipe WASM runtime and the pose model once
on mount, and exposes a `detect()` function. Model files load from Google's
CDN at runtime, so there's nothing to bundle or self-host.

### `components/CameraFeed.tsx`

Owns the webcam stream and the `requestAnimationFrame` detection loop. On
every frame it draws the skeleton, converts landmarks into angles, and
reports them upward via the `onAngles` prop — it doesn't know or care what
those angles mean, that's `poseLibrary.ts`'s job.

### `App.tsx`

Ties it together: holds the selected pose and live angles in state, renders
the camera feed, the pose picker dropdown, and the score/info Cards.

## Design Philosophy

- **No backend, no training pipeline** — MediaPipe ships a pretrained model,
  so this is a config + math prototype, not an ML training project.
- **Pose-agnostic core** — the angle math and scoring engine don't know
  anything about yoga specifically; all the "yoga-ness" lives in one data
  file (`poseLibrary.ts`), making it easy to extend or even repurpose for
  other movement types later.
- **Everything client-side** — good for a fast prototype and for privacy
  (no video ever leaves the browser).
