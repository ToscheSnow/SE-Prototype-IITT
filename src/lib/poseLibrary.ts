// Config-driven pose definitions. Add new poses here without touching any logic.
// `target` = ideal angle in degrees, `tolerance` = how many degrees off is still "fine".

export interface PoseTarget {
  target: number;
  tolerance: number;
}

export interface YogaPose {
  id: string;
  name: string;
  sanskritName: string;
  description: string;
  benefits: string[];
  cautions: string[];
  // key must match a JointDef.key from angleUtils.ts
  targets: Record<string, PoseTarget>;
}

export const POSE_LIBRARY: YogaPose[] = [
  {
    id: "tree",
    name: "Tree Pose",
    sanskritName: "Vrksasana",
    description: "A standing balance pose — one foot rooted, the other resting on the inner thigh or calf, hands at heart center or overhead.",
    benefits: ["Improves balance and focus", "Strengthens ankles and calves", "Opens the hips"],
    cautions: ["Avoid resting the foot directly on the knee joint", "Use a wall for support if balance is unsteady"],
    targets: {
      leftKnee: { target: 180, tolerance: 15 }, // standing leg straight
      rightKnee: { target: 45, tolerance: 20 }, // bent leg tucked in
      leftHip: { target: 170, tolerance: 15 },
    },
  },
  {
    id: "warrior2",
    name: "Warrior II",
    sanskritName: "Virabhadrasana II",
    description: "A lunging pose with arms extended parallel to the floor, front knee bent to a right angle, gaze over the front hand.",
    benefits: ["Builds leg and core strength", "Improves stamina", "Opens hips and chest"],
    cautions: ["Keep front knee tracking over the ankle, not past the toes", "Avoid if you have knee injuries"],
    targets: {
      leftKnee: { target: 90, tolerance: 15 }, // front knee bent
      rightKnee: { target: 175, tolerance: 15 }, // back leg straight
      leftElbow: { target: 175, tolerance: 15 },
      rightElbow: { target: 175, tolerance: 15 },
    },
  },
  {
    id: "downdog",
    name: "Downward Dog",
    sanskritName: "Adho Mukha Svanasana",
    description: "An inverted V-shape — hands and feet on the floor, hips lifted high, spine long.",
    benefits: ["Stretches hamstrings and calves", "Strengthens arms and shoulders", "Relieves back tension"],
    cautions: ["Avoid with wrist injuries", "Keep a slight bend in the knees if hamstrings are tight"],
    targets: {
      leftElbow: { target: 175, tolerance: 15 },
      rightElbow: { target: 175, tolerance: 15 },
      leftHip: { target: 90, tolerance: 20 },
      rightHip: { target: 90, tolerance: 20 },
      leftKnee: { target: 170, tolerance: 20 },
      rightKnee: { target: 170, tolerance: 20 },
    },
  },
];

export interface JointFeedback {
  key: string;
  label: string;
  current: number;
  target: number;
  diff: number;
  ok: boolean;
}

export interface ScoreResult {
  score: number; // 0-100
  perJoint: JointFeedback[];
  feedback: string[];
}

const LABELS: Record<string, string> = {
  leftElbow: "left elbow",
  rightElbow: "right elbow",
  leftKnee: "left knee",
  rightKnee: "right knee",
  leftHip: "left hip",
  rightHip: "right hip",
};

/** Compares live joint angles against a pose's targets and produces a competence score + tips. */
export function scorePose(
  liveAngles: Record<string, number>,
  pose: YogaPose
): ScoreResult {
  const entries = Object.entries(pose.targets);
  const perJoint: JointFeedback[] = [];
  let totalScore = 0;

  for (const [key, { target, tolerance }] of entries) {
    const current = liveAngles[key];
    if (current === undefined) continue;

    const diff = Math.abs(current - target);
    const ok = diff <= tolerance;
    // Linear falloff: 0 diff = 100%, diff >= 3x tolerance = 0%
    const jointScore = Math.max(0, 100 - (diff / (tolerance * 3)) * 100);
    totalScore += jointScore;

    perJoint.push({ key, label: LABELS[key] ?? key, current, target, diff, ok });
  }

  const score = entries.length > 0 ? Math.round(totalScore / entries.length) : 0;

  const feedback = perJoint
    .filter((j) => !j.ok)
    .map((j) => {
      const direction = j.current < j.target ? "extend" : "ease off";
      return `Try to ${direction} your ${j.label} a bit`;
    });

  if (feedback.length === 0 && perJoint.length > 0) {
    feedback.push("Great alignment — hold it there!");
  }

  return { score, perJoint, feedback };
}
