# Yoga Pose Competence Checker — Prototype Setup

## 1. Create the Vite project (if not done already)
```bash
npm create vite@latest yoga-pose-app -- --template react-ts
cd yoga-pose-app
```

## 2. Install dependencies
```bash
npm install @mediapipe/tasks-vision
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 3. Set up shadcn/ui
```bash
npx shadcn@latest init
npx shadcn@latest add card select progress badge
```
When it asks, pick TypeScript + your Tailwind config as usual. This creates
`src/components/ui/*` and sets the `@/*` path alias — make sure your
`tsconfig.json` and `vite.config.ts` both have the alias:

```ts
// vite.config.ts
import path from "path";
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

## 4. Enable React Compiler (optional but you mentioned it)
```bash
npm install -D babel-plugin-react-compiler
```
Add it to your `@vitejs/plugin-react` babel config in `vite.config.ts`.

## 5. Drop in these files
Copy the 5 files from this prototype into your project:
- `src/lib/angleUtils.ts` — generic joint-angle math
- `src/lib/poseLibrary.ts` — pose definitions + scoring
- `src/lib/usePoseLandmarker.ts` — MediaPipe model loader/hook
- `src/components/CameraFeed.tsx` — webcam + skeleton overlay
- `src/App.tsx` — main UI

## 6. Run it
```bash
npm run dev
```
Grant camera permission when prompted. Pick a pose from the dropdown and
strike it — you'll see your skeleton overlaid live and a competence score
update in real time.

## Notes for extending later
- **More poses**: just add entries to `POSE_LIBRARY` in `poseLibrary.ts` —
  no other code changes needed.
- **More joints**: add entries to `COMMON_JOINTS` in `angleUtils.ts` (e.g.
  shoulder angle, spine angle using extra landmark triplets).
- **Better scoring**: currently a simple linear falloff per joint, averaged.
  Could weight joints by importance per pose, or add a time-held threshold
  before scoring counts.
- **Performance**: the `pose_landmarker_lite` model is used for speed; swap
  to `pose_landmarker_full` or `_heavy` for more accuracy if your machine
  can handle it.
