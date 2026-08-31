// Generic joint-angle math. Works on any 3 landmarks (a-b-c), where
// `b` is the joint vertex. Reusable for elbows, knees, hips, shoulders, etc.

export interface Point3D {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

/**
 * Returns the angle (in degrees, 0-180) at vertex `b`, formed by rays b->a and b->c.
 * Uses 2D (x, y) by default since most webcam angle checks work fine in-plane;
 * pass use3D=true if you want to factor in MediaPipe's estimated z-depth.
 */
export function angleBetweenPoints(
  a: Point3D,
  b: Point3D,
  c: Point3D,
  use3D = false
): number {
  const ax = a.x - b.x;
  const ay = a.y - b.y;
  const az = use3D ? (a.z ?? 0) - (b.z ?? 0) : 0;

  const cx = c.x - b.x;
  const cy = c.y - b.y;
  const cz = use3D ? (c.z ?? 0) - (b.z ?? 0) : 0;

  const dot = ax * cx + ay * cy + az * cz;
  const magA = Math.sqrt(ax * ax + ay * ay + az * az);
  const magC = Math.sqrt(cx * cx + cy * cy + cz * cz);

  if (magA === 0 || magC === 0) return 0;

  const cosAngle = Math.min(1, Math.max(-1, dot / (magA * magC)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

/** Landmark indices from MediaPipe's 33-point pose model, named for readability. */
export const LANDMARK = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

/** A joint definition: which 3 landmarks form the angle, and a human label. */
export interface JointDef {
  key: string;
  label: string;
  points: [number, number, number]; // [a, vertex, c]
}

/** Common joints you'll want across most poses. Extend as needed. */
export const COMMON_JOINTS: JointDef[] = [
  { key: "leftElbow", label: "Left elbow", points: [LANDMARK.LEFT_SHOULDER, LANDMARK.LEFT_ELBOW, LANDMARK.LEFT_WRIST] },
  { key: "rightElbow", label: "Right elbow", points: [LANDMARK.RIGHT_SHOULDER, LANDMARK.RIGHT_ELBOW, LANDMARK.RIGHT_WRIST] },
  { key: "leftKnee", label: "Left knee", points: [LANDMARK.LEFT_HIP, LANDMARK.LEFT_KNEE, LANDMARK.LEFT_ANKLE] },
  { key: "rightKnee", label: "Right knee", points: [LANDMARK.RIGHT_HIP, LANDMARK.RIGHT_KNEE, LANDMARK.RIGHT_ANKLE] },
  { key: "leftHip", label: "Left hip", points: [LANDMARK.LEFT_SHOULDER, LANDMARK.LEFT_HIP, LANDMARK.LEFT_KNEE] },
  { key: "rightHip", label: "Right hip", points: [LANDMARK.RIGHT_SHOULDER, LANDMARK.RIGHT_HIP, LANDMARK.RIGHT_KNEE] },
];

/** Compute every joint angle in COMMON_JOINTS for a given landmark set. */
export function computeAllAngles(
  landmarks: Point3D[],
  joints: JointDef[] = COMMON_JOINTS
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const joint of joints) {
    const [ai, bi, ci] = joint.points;
    if (!landmarks[ai] || !landmarks[bi] || !landmarks[ci]) continue;
    result[joint.key] = angleBetweenPoints(landmarks[ai], landmarks[bi], landmarks[ci]);
  }
  return result;
}
