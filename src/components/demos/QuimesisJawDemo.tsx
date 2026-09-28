"use client";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ThreeStage, type ThreeStageSetup } from "./ThreeStage";

/**
 * Quimesis demo (PORT-049, rebuilt in PORT-059): an interactive procedural
 * jaw next to `QuimesisFragmentsDemo`. No scan, no downloaded model. Each
 * arcade is ONE continuous parametric surface (gum and crowns fused, one
 * colour), modelled on the screenshots of the real app published in the
 * project gallery (`assets/images-src/img/Quimesis1-3.png`): a raw scan look,
 * teeth only readable through their crowns, cusps and the grooves between
 * them.
 *
 * The surface is a tube swept along the arch: at every arc-length sample `s`
 * a cross-section ring (gum base + crown, in the local (normal, up) plane) is
 * built from the tooth that `s` falls in.
 */

// ---------------------------------------------------------------------------
// Arch guide curve: the PORT-049 parabola, in the XZ plane.
const ARC_A = -0.55;
const ARC_C = 0.9;
const TEETH_HALF_X = 1.2; // last molar ends here
const END_HALF_X = 1.3; // gum continues a little behind the last molar
const arcZ = (x: number) => ARC_A * x * x + ARC_C;

type ToothType = "incisor" | "canine" | "premolar" | "molar";
/** Midline-to-back order for one side (the other side mirrors it). */
const TOOTH_ORDER: readonly ToothType[] = ["incisor", "incisor", "canine", "premolar", "premolar", "molar", "molar"];

interface ToothShape {
  /** Relative mesio-distal length along the arch (molars are the longest). */
  readonly weight: number;
  /** Bucco-lingual half width of the crown. */
  readonly halfWidth: number;
  /** Crown height above the gum line. */
  readonly height: number;
}

const TOOTH_SHAPES: Readonly<Record<ToothType, ToothShape>> = {
  incisor: { weight: 0.78, halfWidth: 0.05, height: 0.2 },
  canine: { weight: 0.88, halfWidth: 0.065, height: 0.22 },
  premolar: { weight: 0.9, halfWidth: 0.08, height: 0.18 },
  molar: { weight: 1.3, halfWidth: 0.105, height: 0.15 },
};

const RINGS_PER_TOOTH = 16;
const RINGS_PER_END = 4;
const CROWN_SEGMENTS = 20;
const GUM_DEPTH = 0.2;

/** Arc-length table of the parabola for x in [0, END_HALF_X]. */
const ARC_TABLE = (() => {
  const samples = 600;
  const xs: number[] = [];
  const lengths: number[] = [];
  let length = 0;
  let previousX = 0;
  let previousZ = arcZ(0);
  for (let i = 0; i <= samples; i++) {
    const x = (i / samples) * END_HALF_X;
    const z = arcZ(x);
    length += Math.hypot(x - previousX, z - previousZ);
    xs.push(x);
    lengths.push(length);
    previousX = x;
    previousZ = z;
  }
  return { xs, lengths };
})();

function xAtLength(target: number): number {
  const { xs, lengths } = ARC_TABLE;
  let i = 1;
  while (i < lengths.length - 1 && lengths[i] < target) i++;
  const span = lengths[i] - lengths[i - 1] || 1;
  return xs[i - 1] + ((xs[i] - xs[i - 1]) * (target - lengths[i - 1])) / span;
}

function lengthAtX(x: number): number {
  const { xs, lengths } = ARC_TABLE;
  let i = 1;
  while (i < xs.length - 1 && xs[i] < x) i++;
  return lengths[i - 1] + ((lengths[i] - lengths[i - 1]) * (x - xs[i - 1])) / (xs[i] - xs[i - 1]);
}

const TEETH_LENGTH = lengthAtX(TEETH_HALF_X);
const END_LENGTH = lengthAtX(END_HALF_X);

/** Tooth boundaries along |s| (arc length from the midline), one side. */
const TOOTH_BOUNDS: readonly number[] = (() => {
  const total = TOOTH_ORDER.reduce((sum, type) => sum + TOOTH_SHAPES[type].weight, 0);
  const bounds = [0];
  for (const type of TOOTH_ORDER) {
    bounds.push(bounds[bounds.length - 1] + (TOOTH_SHAPES[type].weight / total) * TEETH_LENGTH);
  }
  return bounds;
})();

/** Which tooth of one side `|s|` falls in, and where inside it (t in 0..1). */
function locateTooth(absS: number): { index: number; t: number } | null {
  if (absS > TEETH_LENGTH) return null;
  let index = 0;
  while (index < TOOTH_ORDER.length - 1 && absS > TOOTH_BOUNDS[index + 1]) index++;
  const t = (absS - TOOTH_BOUNDS[index]) / (TOOTH_BOUNDS[index + 1] - TOOTH_BOUNDS[index]);
  return { index, t: Math.min(Math.max(t, 0), 1) };
}

/** Global tooth id 0..13, left back molar to right back molar. */
const globalToothId = (s: number, sideIndex: number) => (s < 0 ? 6 - sideIndex : 7 + sideIndex);

/** Gum half width, interpolated between tooth centres so the base is smooth. */
function baseHalfWidth(absS: number): number {
  const centres = TOOTH_ORDER.map((_, i) => (TOOTH_BOUNDS[i] + TOOTH_BOUNDS[i + 1]) / 2);
  const widths = TOOTH_ORDER.map((type) => TOOTH_SHAPES[type].halfWidth);
  if (absS <= centres[0]) return widths[0];
  for (let i = 1; i < centres.length; i++) {
    if (absS <= centres[i]) {
      const k = (absS - centres[i - 1]) / (centres[i] - centres[i - 1]);
      const smooth = k * k * (3 - 2 * k);
      return widths[i - 1] + (widths[i] - widths[i - 1]) * smooth;
    }
  }
  return widths[widths.length - 1];
}

const gauss = (dt: number, dq: number, st: number, sq: number) => Math.exp(-((dt * dt) / st + (dq * dq) / sq));

/** Occlusal relief (cusps, fissures) on top of the crown, before scaling by
 * the crown's own rise. `t` runs along the arch, `q` bucco-lingually (-1..1). */
function cuspRelief(type: ToothType, t: number, q: number): number {
  switch (type) {
    case "incisor":
      return 0.006 * gauss(t - 0.5, 0, 0.2, 1); // a straight incisal edge
    case "canine":
      return 0.022 * gauss(t - 0.5, q - 0.1, 0.06, 0.4) - 0.006; // one blunt cusp
    case "premolar":
      return 0.032 * gauss(t - 0.5, q - 0.42, 0.04, 0.07) + 0.02 * gauss(t - 0.5, q + 0.45, 0.04, 0.07) - 0.018;
    case "molar": {
      let relief = -0.02;
      for (const tc of [0.26, 0.72]) {
        for (const qc of [0.45, -0.45]) relief += 0.03 * gauss(t - tc, q - qc, 0.018, 0.06);
      }
      relief += 0.015 * gauss(t - 0.5, q - 0.5, 0.01, 0.05); // small distobuccal cusp
      return relief;
    }
  }
}

/** Deterministic small "scan noise", so the surface is not perfectly smooth. */
const scanNoise = (a: number, b: number, c: number) =>
  Math.sin(a * 71 + b * 23) * Math.sin(b * 57 + c * 31) * Math.sin(c * 43 + a * 19);

/** One cross-section ring, counter-clockwise in the (n, y) plane (n points
 * out of the mouth, y towards the crowns). Returns interleaved n, y. */
function buildRing(s: number): number[] {
  const absS = Math.abs(s);
  const tooth = locateTooth(absS);
  const base = baseHalfWidth(absS);

  let gumLine = 0;
  let crownHalfWidth = base * 0.82;
  let crownRise = 0; // 0..1 along the tooth (0 in the grooves between teeth)
  let crownHeight = 0;
  let type: ToothType = "molar";
  let t = 0;
  if (tooth) {
    type = TOOTH_ORDER[tooth.index];
    t = tooth.t;
    const shape = TOOTH_SHAPES[type];
    const edge = Math.abs(2 * t - 1);
    // Superellipse along the arch: flat crown, steep sides, a V groove at the boundary.
    crownRise = Math.pow(1 - Math.pow(edge, 2.6), 1 / 2.6);
    crownHeight = shape.height;
    crownHalfWidth = base * (0.82 + 0.18 * Math.sin(Math.PI * t));
    gumLine = 0.035 * Math.pow(edge, 3); // interdental papilla, gum dips at the tooth centre
  } else {
    // Retromolar pad: the gum slopes down behind the last molar.
    const k = (absS - TEETH_LENGTH) / (END_LENGTH - TEETH_LENGTH);
    gumLine = 0.035 - 0.07 * k * k;
  }

  // Root eminences: the gum bulges a little under each crown.
  const eminence = tooth ? 0.012 * Math.sin(Math.PI * t) : 0;
  const buccalTop = base + 0.035 + eminence;
  const buccalBottom = base + 0.085;
  const lingualTop = base + 0.03;
  const lingualBottom = base + 0.05;
  // Ragged lower edge, like the cut base of a real scan.
  const bottom = -GUM_DEPTH - 0.005 * (1 + Math.sin(s * 23) * Math.sin(s * 9.7 + 1));

  const ring: number[] = [];
  const push = (n: number, y: number) => ring.push(n, y);

  // Bottom, lingual to buccal.
  push(-lingualBottom, bottom);
  push(-lingualBottom * 0.5, bottom);
  push(0, bottom);
  push(buccalBottom * 0.5, bottom);
  push(buccalBottom, bottom);
  // Buccal wall, slightly flared at the bottom.
  for (const k of [0.3, 0.6, 0.85]) {
    const eased = Math.sin((k * Math.PI) / 2);
    push(buccalBottom + (buccalTop - buccalBottom) * eased, bottom + (gumLine - 0.04 - bottom) * k);
  }
  // Buccal gum shoulder.
  push(buccalTop, gumLine - 0.04);
  push(buccalTop - 0.012, gumLine - 0.012);
  push(crownHalfWidth + 0.008, gumLine);
  // Crown, buccal to lingual.
  for (let j = 0; j <= CROWN_SEGMENTS; j++) {
    const psi = Math.PI / 2 - (j / CROWN_SEGMENTS) * Math.PI;
    const q = Math.sin(psi);
    const dome = Math.pow(Math.max(1 - Math.pow(Math.abs(q), 3), 0), 1 / 3);
    const relief = tooth ? cuspRelief(type, t, q) * dome : 0;
    const rise = crownRise * (crownHeight * dome + relief);
    push(crownHalfWidth * q, gumLine + Math.max(rise, 0));
  }
  // Lingual gum shoulder and wall.
  push(-crownHalfWidth - 0.008, gumLine);
  push(-lingualTop + 0.012, gumLine - 0.012);
  push(-lingualTop, gumLine - 0.04);
  for (const k of [0.15, 0.4, 0.7]) {
    push(-lingualTop - (lingualBottom - lingualTop) * k, gumLine - 0.04 + (bottom - gumLine + 0.04) * k);
  }
  return ring;
}

const RING_SIZE = buildRing(0).length / 2;

interface Arcade {
  readonly geometry: THREE.BufferGeometry;
  /** Tooth id (0..13) of the quad strip starting at each ring, -1 behind the teeth. */
  readonly stripTooth: readonly number[];
  /** Dotted gum-line boundary of every tooth, in the arcade's local frame. */
  readonly toothDots: readonly (readonly THREE.Vector3[])[];
}

/** Arc-length samples: back-left end → midline → back-right end. */
function arcSamples(): number[] {
  const samples: number[] = [];
  for (let i = 0; i < RINGS_PER_END; i++) {
    samples.push(-END_LENGTH + ((END_LENGTH - TEETH_LENGTH) * i) / RINGS_PER_END);
  }
  for (let tooth = TOOTH_ORDER.length - 1; tooth >= 0; tooth--) {
    for (let i = 0; i < RINGS_PER_TOOTH; i++) {
      const k = i / RINGS_PER_TOOTH;
      samples.push(-(TOOTH_BOUNDS[tooth + 1] + (TOOTH_BOUNDS[tooth] - TOOTH_BOUNDS[tooth + 1]) * k));
    }
  }
  for (let tooth = 0; tooth < TOOTH_ORDER.length; tooth++) {
    for (let i = 0; i < RINGS_PER_TOOTH; i++) {
      const k = i / RINGS_PER_TOOTH;
      samples.push(TOOTH_BOUNDS[tooth] + (TOOTH_BOUNDS[tooth + 1] - TOOTH_BOUNDS[tooth]) * k);
    }
  }
  for (let i = 0; i <= RINGS_PER_END; i++) {
    samples.push(TEETH_LENGTH + ((END_LENGTH - TEETH_LENGTH) * i) / RINGS_PER_END);
  }
  return samples;
}

/** Point, outward normal on the arch at signed arc length `s`. */
function archFrame(s: number) {
  const x = Math.sign(s) * xAtLength(Math.abs(s));
  const point = new THREE.Vector3(x, 0, arcZ(x));
  const tangent = new THREE.Vector3(1, 0, 2 * ARC_A * x).normalize();
  const normal = new THREE.Vector3(-tangent.z, 0, tangent.x); // points out of the mouth
  return { point, normal };
}

/** Builds one arcade in its local frame, gum line at y = 0. `sign` = +1
 * points the crowns up (lower arcade), -1 down (upper arcade). */
function buildArcade(sign: 1 | -1): Arcade {
  const samples = arcSamples();
  const positions: number[] = [];
  const stripTooth: number[] = [];

  samples.forEach((s, ringIndex) => {
    const { point, normal } = archFrame(s);
    const ring = buildRing(s);
    for (let j = 0; j < RING_SIZE; j++) {
      const n = ring[j * 2];
      const y = ring[j * 2 + 1];
      const px = point.x + normal.x * n;
      const pz = point.z + normal.z * n;
      const jitter = 0.002 * scanNoise(px * 1.3, y * 1.3, pz * 1.3);
      positions.push(px + normal.x * jitter, sign * (y + jitter), pz + normal.z * jitter);
    }
    if (ringIndex < samples.length - 1) {
      const middle = (s + samples[ringIndex + 1]) / 2;
      const located = locateTooth(Math.abs(middle));
      stripTooth.push(located ? globalToothId(middle, located.index) : -1);
    }
  });

  const indices: number[] = [];
  const addTriangle = (a: number, b: number, c: number) => {
    if (sign === 1) indices.push(a, b, c);
    else indices.push(a, c, b); // mirrored in y: flip the winding
  };
  for (let i = 0; i < samples.length - 1; i++) {
    for (let j = 0; j < RING_SIZE; j++) {
      const a = i * RING_SIZE + j;
      const b = (i + 1) * RING_SIZE + j;
      const c = (i + 1) * RING_SIZE + ((j + 1) % RING_SIZE);
      const d = i * RING_SIZE + ((j + 1) % RING_SIZE);
      addTriangle(a, b, c);
      addTriangle(a, c, d);
    }
  }

  // Cap both ends of the arch with a fan around each end ring's centroid.
  const capEnd = (ringIndex: number, facingForward: boolean) => {
    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (let j = 0; j < RING_SIZE; j++) {
      cx += positions[(ringIndex * RING_SIZE + j) * 3];
      cy += positions[(ringIndex * RING_SIZE + j) * 3 + 1];
      cz += positions[(ringIndex * RING_SIZE + j) * 3 + 2];
    }
    const centre = positions.length / 3;
    positions.push(cx / RING_SIZE, cy / RING_SIZE, cz / RING_SIZE);
    for (let j = 0; j < RING_SIZE; j++) {
      const a = ringIndex * RING_SIZE + j;
      const b = ringIndex * RING_SIZE + ((j + 1) % RING_SIZE);
      if (facingForward) addTriangle(centre, a, b);
      else addTriangle(centre, b, a);
    }
  };
  capEnd(0, true);
  capEnd(samples.length - 1, false);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // Dotted outline of each tooth's boundary with the gum (like the app's
  // green segmentation points): along the buccal then the lingual side.
  const toothDots: THREE.Vector3[][] = [];
  for (let id = 0; id < TOOTH_ORDER.length * 2; id++) {
    const sideIndex = id >= 7 ? id - 7 : 6 - id;
    const side = id >= 7 ? 1 : -1;
    const from = TOOTH_BOUNDS[sideIndex];
    const to = TOOTH_BOUNDS[sideIndex + 1];
    const dots: THREE.Vector3[] = [];
    const addDot = (t: number, towardBuccal: number) => {
      const s = side * (from + (to - from) * t);
      const { point, normal } = archFrame(s);
      const base = baseHalfWidth(Math.abs(s));
      const width = base * (0.82 + 0.18 * Math.sin(Math.PI * t)) + 0.012;
      const y = 0.035 * Math.pow(Math.abs(2 * t - 1), 3) + 0.012;
      dots.push(point.clone().addScaledVector(normal, width * towardBuccal).setY(sign * y));
    };
    for (const t of [0.1, 0.26, 0.42, 0.58, 0.74, 0.9]) addDot(t, 1);
    for (const q of [0.6, 0, -0.6]) addDot(0.96, q);
    for (const t of [0.9, 0.74, 0.58, 0.42, 0.26, 0.1]) addDot(t, -1);
    for (const q of [-0.6, 0, 0.6]) addDot(0.04, q);
    toothDots.push(dots);
  }

  return { geometry, stripTooth, toothDots };
}

const DOTS_PER_TOOTH = 18;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const PIVOT_POSITION = new THREE.Vector3(0, 0.05, -0.3);
const UPPER_BASELINE_Y = 0.25;
const LOWER_BASELINE_Y = -0.25; // world Y of the lower arcade's gum line when closed
const OPEN_ANGLE = 0.5; // rad
const OPEN_DURATION = 0.5; // s
const CLICK_TOLERANCE_PX = 5;

/** Relative luminance (sRGB, 0..1) of a "#rrggbb" token. */
function hexLuminance(hex: string): number {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const setupScene: ThreeStageSetup = ({ scene, camera, renderer, colors }) => {
  camera.position.set(0, 1.8, 3.7);
  camera.lookAt(0, 0, 0.3);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.3);
  key.position.set(2, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.45);
  rim.position.set(-3, -1, -2);
  scene.add(rim);

  // "Realistic" scan colour (GUIDE-3D.md #2 exception): the dusty pink of the
  // real app's screenshots, one tone deeper on the light surface.
  const isLightTheme = hexLuminance(colors.surface) > 0.5;
  const scanColor = isLightTheme ? "#dcaab3" : "#d6aab2";
  const scanMaterial = new THREE.MeshStandardMaterial({ color: scanColor, roughness: 0.75, metalness: 0 });

  const dotGeometry = new THREE.SphereGeometry(0.016, 8, 6);
  const dotMaterial = new THREE.MeshBasicMaterial({ color: colors.green });

  const makeArcadeMesh = (sign: 1 | -1) => {
    const arcade = buildArcade(sign);
    const mesh = new THREE.Mesh(arcade.geometry, scanMaterial);
    const dots = new THREE.InstancedMesh(dotGeometry, dotMaterial, DOTS_PER_TOOTH);
    dots.visible = false;
    return { arcade, mesh, dots };
  };

  // Upper arcade: static, crowns point down.
  const upper = makeArcadeMesh(-1);
  const upperGroup = new THREE.Group();
  upperGroup.position.set(0, UPPER_BASELINE_Y, 0);
  upperGroup.add(upper.mesh, upper.dots);
  scene.add(upperGroup);

  // Lower arcade hangs off a pivot group so it swings open around a hinge
  // behind the mouth.
  const lower = makeArcadeMesh(1);
  const pivot = new THREE.Group();
  pivot.position.copy(PIVOT_POSITION);
  const lowerGroup = new THREE.Group();
  lowerGroup.position.set(0, LOWER_BASELINE_Y - PIVOT_POSITION.y, -PIVOT_POSITION.z);
  lowerGroup.add(lower.mesh, lower.dots);
  pivot.add(lowerGroup);
  scene.add(pivot);

  const arcades = [upper, lower];
  const arcadeMeshes = arcades.map((entry) => entry.mesh);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0.3);
  controls.enableZoom = false; // never capture the wheel: the page must keep scrolling
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.minPolarAngle = 0.6;
  controls.maxPolarAngle = 2.2;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;
  const stopAutoRotate = () => {
    controls.autoRotate = false;
  };
  controls.addEventListener("start", stopAutoRotate);

  const canvas = renderer.domElement;
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  const dotMatrix = new THREE.Matrix4();
  let hoveredKey: string | null = null;
  let pointerDown: { x: number; y: number } | null = null;
  let currentElapsed = 0;
  let isOpen = false;
  let animFromAngle = 0;
  let animToAngle = 0;
  let animStart = 0;

  /** Shows the green dotted gum-line outline of one tooth (or none). */
  const setHover = (arcadeIndex: number, toothId: number) => {
    const key = toothId < 0 ? null : `${arcadeIndex}:${toothId}`;
    if (key === hoveredKey) return;
    hoveredKey = key;
    for (const entry of arcades) entry.dots.visible = false;
    canvas.style.cursor = key ? "pointer" : "auto";
    if (!key) return;
    const { arcade, dots } = arcades[arcadeIndex];
    arcade.toothDots[toothId].forEach((position, i) => {
      dotMatrix.makeTranslation(position.x, position.y, position.z);
      dots.setMatrixAt(i, dotMatrix);
    });
    dots.instanceMatrix.needsUpdate = true;
    dots.visible = true;
  };

  const handlePointerMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);
    const hit = raycaster.intersectObjects(arcadeMeshes, false)[0];
    if (!hit || !hit.face) {
      setHover(0, -1);
      return;
    }
    const arcadeIndex = arcadeMeshes.findIndex((mesh) => mesh === hit.object);
    const strip = Math.floor(hit.face.a / RING_SIZE);
    const toothId = arcades[arcadeIndex].arcade.stripTooth[strip] ?? -1;
    setHover(arcadeIndex, toothId);
  };

  const handlePointerLeave = () => setHover(0, -1);

  const handlePointerDown = (event: PointerEvent) => {
    pointerDown = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (!pointerDown) return;
    const dx = event.clientX - pointerDown.x;
    const dy = event.clientY - pointerDown.y;
    pointerDown = null;
    if (Math.hypot(dx, dy) >= CLICK_TOLERANCE_PX) return; // a drag, not a click
    isOpen = !isOpen;
    animFromAngle = pivot.rotation.x;
    animToAngle = isOpen ? OPEN_ANGLE : 0;
    animStart = currentElapsed;
  };

  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerleave", handlePointerLeave);
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointerup", handlePointerUp);

  return {
    update(elapsed, delta) {
      currentElapsed = elapsed;
      controls.update();
      const t = Math.min((elapsed - animStart) / OPEN_DURATION, 1);
      pivot.rotation.x = animFromAngle + (animToAngle - animFromAngle) * easeOutCubic(t);
      void delta;
    },
    dispose() {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.style.cursor = "auto";
      controls.removeEventListener("start", stopAutoRotate);
      controls.dispose();
    },
  };
};

export function QuimesisJawDemo() {
  return <ThreeStage setup={setupScene} fov={35} />;
}
