import { useState } from "react";
import {
  Activity,
  Camera,
  CircleHelp,
  Expand,
  HeartPulse,
  Info,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { CameraFeed } from "@/components/CameraFeed";
import { POSE_LIBRARY, scorePose, type YogaPose } from "@/lib/poseLibrary";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function scoreStatus(score: number) {
  if (score >= 85) return { label: "Excellent alignment", tone: "text-emerald-300" };
  if (score >= 65) return { label: "Nearly there", tone: "text-teal-200" };
  if (score > 0) return { label: "Keep adjusting", tone: "text-amber-200" };
  return { label: "Waiting for pose", tone: "text-slate-300" };
}

function PoseReference({ pose, expanded = false }: { pose: YogaPose; expanded?: boolean }) {
  const illustration = pose.id === "downdog" ? (
    <svg viewBox="0 0 280 210" className="h-full w-full" role="img" aria-label="Illustration of Downward Dog pose">
      <circle cx="84" cy="110" r="17" fill="#f8c4a8" />
      <path d="M98 112 L148 73 L192 125 M148 73 L223 168 M192 125 L168 188 M223 168 L245 191 M98 112 L45 161 M45 161 L27 193" fill="none" stroke="#63d8ca" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M112 101 L153 63" stroke="#d8fff7" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ) : pose.id === "warrior2" ? (
    <svg viewBox="0 0 280 210" className="h-full w-full" role="img" aria-label="Illustration of Warrior Two pose">
      <circle cx="140" cy="42" r="17" fill="#f8c4a8" />
      <path d="M140 61 L140 119 M140 81 L47 82 M140 81 L233 82 M140 119 L83 178 L36 178 M140 119 L198 178 L244 178" fill="none" stroke="#63d8ca" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M47 82 L27 76 M233 82 L253 76" stroke="#d8fff7" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 280 210" className="h-full w-full" role="img" aria-label="Illustration of Tree pose">
      <circle cx="140" cy="34" r="17" fill="#f8c4a8" />
      <path d="M140 53 L140 116 L140 191 M140 82 L111 51 M140 82 L169 51 M111 51 L105 24 M169 51 L175 24 M140 116 L101 158 L140 158" fill="none" stroke="#63d8ca" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M105 24 L116 12 M175 24 L164 12" stroke="#d8fff7" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );

  return <div className={expanded ? "aspect-[4/3] w-full" : "aspect-[4/3] w-full"}>{illustration}</div>;
}

export default function App() {
  const [poseId, setPoseId] = useState(POSE_LIBRARY[0].id);
  const [angles, setAngles] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("practice");
  const activePose = POSE_LIBRARY.find((pose) => pose.id === poseId)!;
  const result = scorePose(angles, activePose);
  const status = scoreStatus(result.score);

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#213956_0%,_#111b2b_44%,_#080d16_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto w-full space-y-6">
          <header className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-slate-950/45 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div><p className="mb-2 flex items-center gap-2 text-sm font-medium text-teal-300"><HeartPulse className="size-4" /> Motion-aware yoga practice</p><h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Yoga Pose Competence Checker</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Live posture feedback, a visual pose guide, and practical adjustments in one calm workspace.</p></div>
            <Badge variant="secondary" className="w-fit border border-teal-300/20 bg-teal-300/10 px-3 py-1.5 text-teal-100"><span className="mr-2 size-2 rounded-full bg-teal-300 shadow-[0_0_12px_#5eead4]" /> Camera-assisted</Badge>
          </header>

          <Tabs value={activeTab} onValueChange={(value) => value && setActiveTab(value)} className="gap-5">
            <TabsList className="border border-white/10 bg-slate-950/55"><TabsTrigger value="practice" className="text-slate-200 hover:text-white data-active:text-slate-950"><Activity /> Live practice</TabsTrigger><TabsTrigger value="guide" className="text-slate-200 hover:text-white data-active:text-slate-950"><CircleHelp /> Pose guide</TabsTrigger></TabsList>
            <TabsContent value="practice">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(20rem,1fr)]">
                <section className="space-y-4">
                  <Card className="overflow-hidden border-white/10 bg-slate-950/60 py-0 shadow-xl shadow-slate-950/20"><div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-sm"><span className="flex items-center gap-2 font-medium text-white"><Camera className="size-4 text-teal-300" /> Live camera</span><span className="flex items-center gap-2 text-slate-400"><span className={`size-2 rounded-full ${result.perJoint.length ? "bg-emerald-400" : "bg-amber-300"}`} />{result.perJoint.length ? "Pose detected" : "Step into frame"}</span></div><CameraFeed onAngles={setAngles} /></Card>
                  <Card className="border-white/10 bg-slate-950/60"><CardHeader className="pb-3"><CardTitle className="text-base text-white">Choose your practice</CardTitle></CardHeader><CardContent><Select value={poseId} onValueChange={(value) => value && setPoseId(value)}><SelectTrigger className="h-11 w-full border-white/10 bg-white/5 text-slate-100"><SelectValue placeholder="Choose a pose" /></SelectTrigger><SelectContent>{POSE_LIBRARY.map((pose) => <SelectItem key={pose.id} value={pose.id}>{pose.name} · {pose.sanskritName}</SelectItem>)}</SelectContent></Select></CardContent></Card>
                </section>

                <aside className="space-y-4">
                  <Card className="border-teal-300/15 bg-gradient-to-br from-teal-300/10 to-slate-950/60"><CardHeader className="pb-2"><CardTitle className="flex items-center justify-between text-base text-white">Alignment score <Sparkles className="size-4 text-teal-300" /></CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-end gap-3"><span className="text-5xl font-semibold tracking-tight text-white">{result.score}</span><span className="pb-1 text-sm text-slate-400">/ 100</span></div><Progress value={result.score} className="[&_[data-slot=progress-indicator]]:bg-teal-300" /><p className={`text-sm font-medium ${status.tone}`}>{status.label}</p><div className="space-y-2 border-t border-white/10 pt-3">{result.feedback.length ? result.feedback.map((tip) => <p key={tip} className="text-sm leading-5 text-slate-300">{tip}</p>) : <p className="text-sm leading-5 text-slate-400">Step into frame and we’ll show targeted form tips.</p>}</div></CardContent></Card>
                  <Card className="border-white/10 bg-slate-950/60"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base text-white">Joint feedback <Tooltip><TooltipTrigger render={<Info className="size-4 cursor-help text-slate-400" />} /><TooltipContent>Angles are compared with the selected pose’s target ranges.</TooltipContent></Tooltip></CardTitle></CardHeader><CardContent className="space-y-2">{result.perJoint.length ? result.perJoint.map((joint) => <div key={joint.key} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm"><span className="capitalize text-slate-300">{joint.label}</span><span className={joint.ok ? "text-emerald-300" : "text-amber-300"}>{Math.round(joint.current)}° <span className="text-slate-500">/ {joint.target}°</span></span></div>) : <p className="text-sm text-slate-400">No joint data yet.</p>}</CardContent></Card>
                </aside>
              </div>
            </TabsContent>

            <TabsContent value="guide">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(19rem,.75fr)]">
                <Card className="border-white/10 bg-slate-950/60"><CardHeader><CardTitle className="text-xl text-white">{activePose.name} <span className="font-normal text-slate-400">· {activePose.sanskritName}</span></CardTitle></CardHeader><CardContent className="space-y-5"><p className="leading-7 text-slate-300">{activePose.description}</p><div><h2 className="mb-2 text-sm font-medium text-white">Benefits</h2><div className="flex flex-wrap gap-2">{activePose.benefits.map((benefit) => <Badge key={benefit} variant="secondary" className="bg-teal-300/10 text-teal-100">{benefit}</Badge>)}</div></div><Accordion><AccordionItem value="safety"><AccordionTrigger className="text-slate-100 hover:text-white hover:no-underline"><span className="flex items-center gap-2"><ListChecks className="size-4 text-amber-300" /> Practice safely</span></AccordionTrigger><AccordionContent><ul className="space-y-2 text-slate-300">{activePose.cautions.map((caution) => <li key={caution}>• {caution}</li>)}</ul></AccordionContent></AccordionItem><AccordionItem value="tips"><AccordionTrigger className="text-slate-100 hover:text-white hover:no-underline">What the camera checks</AccordionTrigger><AccordionContent>Your score compares the key joint angles for this pose with healthy target ranges. Use the live feedback to make one small adjustment at a time.</AccordionContent></AccordionItem></Accordion></CardContent></Card>
                <Card className="border-teal-300/15 bg-gradient-to-b from-teal-300/10 to-slate-950/60"><CardHeader className="pb-2"><CardTitle className="flex items-center justify-between text-base text-white">Pose reference <Badge variant="outline" className="border-teal-300/30 text-teal-100">Illustration</Badge></CardTitle></CardHeader><CardContent className="space-y-3"><Dialog><DialogTrigger render={<button className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-teal-300" />}><PoseReference pose={activePose} /><span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2.5 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"><Expand className="size-3" /> Expand</span></DialogTrigger><DialogContent className="max-w-2xl border border-white/10 bg-slate-950 text-slate-100"><DialogHeader><DialogTitle>{activePose.name} reference</DialogTitle><DialogDescription>Use this as a visual starting point before switching to live practice.</DialogDescription></DialogHeader><PoseReference pose={activePose} expanded /></DialogContent></Dialog><p className="text-sm leading-6 text-slate-300">Match the general shape first, then let the live angle feedback guide small refinements.</p><Button className="w-full bg-teal-300 text-slate-950 hover:bg-teal-200" onClick={() => setActiveTab("practice")}><Activity /> Start live practice</Button></CardContent></Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </TooltipProvider>
  );
}
