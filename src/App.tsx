import { useState } from "react";
import { CameraFeed } from "@/components/CameraFeed";
import { POSE_LIBRARY, scorePose } from "@/lib/poseLibrary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function App() {
  const [poseId, setPoseId] = useState(POSE_LIBRARY[0].id);
  const [angles, setAngles] = useState<Record<string, number>>({});

  const activePose = POSE_LIBRARY.find((p) => p.id === poseId)!;
  const result = scorePose(angles, activePose);
  function handlePoseChange(value: string | null) {
    if (value) setPoseId(value);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">
            Yoga Pose Competence Checker
          </h1>
          <p className="text-neutral-400 text-sm">
            Pick a pose, strike it in front of your camera, get live alignment
            feedback.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <CameraFeed onAngles={setAngles} />

            <Select value={poseId} onValueChange={handlePoseChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a pose" />
              </SelectTrigger>
              <SelectContent>
                {POSE_LIBRARY.map((pose) => (
                  <SelectItem key={pose.id} value={pose.id}>
                    {pose.name} ({pose.sanskritName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Competence Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{result.score}</span>
                  <span className="text-neutral-400 text-sm">/ 100</span>
                </div>
                <Progress value={result.score} />
                <div className="space-y-1 pt-2">
                  {result.feedback.map((tip, i) => (
                    <p key={i} className="text-sm text-neutral-300">
                      {tip}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{activePose.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-neutral-300">{activePose.description}</p>
                <div className="flex flex-wrap gap-1">
                  {activePose.benefits.map((b) => (
                    <Badge key={b} variant="secondary">
                      {b}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-1 text-neutral-400">
                  {activePose.cautions.map((c) => (
                    <p key={c}>⚠ {c}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
