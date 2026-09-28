"use client";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ThreeStage, type ThreeStageSetup } from "./ThreeStage";

/**
 * Quimesis demo (PORT-049, feedback #11): an interactive procedural jaw next
 * to the existing `QuimesisFragmentsDemo`. No scan, no downloaded model — a
 * simplified arcade built from three's own geometries only, so the caption
 * can honestly say "modele simplifie, genere par le code".
 */

// Both arcades follow the same parabola in the XZ plane.
const ARC_A = -0.55;
const ARC_C = 0.9;
const ARC_HALF_WIDTH = 1.2;
const arcZ = (x: number) => ARC_A * x * x + ARC_C;
const arcTangent = (x: number) => new THREE.Vector3(1, 0, 2 * ARC_A * x).normalize();

type ToothType = "incisor" | "canine" | "premolar" | "molar";
/** Front-to-back order for one side (7 teeth: the other side mirrors it). */
const TOOTH_ORDER: readonly ToothType[] = ["incisor", "incisor", "canine", "premolar", "premolar", "molar", "molar"];
const TOOTH_HEIGHTS: Readonly<Record<ToothType, number>> = {
  incisor: 0.3,
  canine: 0.34,
  premolar: 0.26,
  molar: 0.24,
};

/** 7 x-positions (0..ARC_HALF_WIDTH), regularly spaced along the curve's
 * arc length rather than along x, so teeth don't bunch up where the
 * parabola flattens out. */
function computeToothXPositions(count: number): readonly number[] {
  const SAMPLES = 400;
  const xs: number[] = [0];
  const cumulative: number[] = [0];
  const previous = new THREE.Vector3(0, 0, arcZ(0));
  const current = new THREE.Vector3();
  for (let i = 1; i <= SAMPLES; i++) {
    const x = (i / SAMPLES) * ARC_HALF_WIDTH;
    current.set(x, 0, arcZ(x));
    cumulative.push(cumulative[i - 1] + current.distanceTo(previous));
    previous.copy(current);
    xs.push(x);
  }
  const total = cumulative[SAMPLES];

  const xAtLength = (targetLength: number): number => {
    let i = 1;
    while (i < SAMPLES && cumulative[i] < targetLength) i++;
    const span = cumulative[i] - cumulative[i - 1] || 1;
    const t = (targetLength - cumulative[i - 1]) / span;
    return xs[i - 1] + (xs[i] - xs[i - 1]) * t;
  };

  return Array.from({ length: count }, (_, i) => xAtLength(((i + 0.5) / count) * total));
}

const TOOTH_X_POSITIONS = computeToothXPositions(TOOTH_ORDER.length);

/** A little below each tooth's root end, in the arcade's local frame. */
class GumCurve extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super();
  }

  getPoint(t: number, target = new THREE.Vector3()) {
    const x = -ARC_HALF_WIDTH + t * 2 * ARC_HALF_WIDTH;
    return target.set(x, -0.03, arcZ(x));
  }
}

function buildToothGeometries(): Readonly<Record<ToothType, THREE.BufferGeometry>> {
  return {
    incisor: new RoundedBoxGeometry(0.07, 0.3, 0.14, 2, 0.02),
    canine: new THREE.CapsuleGeometry(0.06, 0.34 - 0.06 * 2, 4, 8),
    premolar: new THREE.CapsuleGeometry(0.08, 0.26 - 0.08 * 2, 4, 8),
    molar: new RoundedBoxGeometry(0.22, 0.24, 0.24, 2, 0.03),
  };
}

/** Builds one arcade's 14 teeth in its own local frame: baseline at y = 0,
 * `sign` = -1 hangs teeth down from the baseline (upper), +1 stands them up
 * (lower). */
function buildArcadeTeeth(sign: 1 | -1, material: THREE.MeshStandardMaterial): THREE.Mesh[] {
  const geometries = buildToothGeometries();
  const teeth: THREE.Mesh[] = [];
  for (const side of [1, -1] as const) {
    TOOTH_X_POSITIONS.forEach((absX, i) => {
      const type = TOOTH_ORDER[i];
      const x = absX * side;
      const mesh = new THREE.Mesh(geometries[type], material.clone());
      mesh.position.set(x, (sign * TOOTH_HEIGHTS[type]) / 2, arcZ(absX));
      mesh.lookAt(mesh.position.clone().add(arcTangent(x)));
      teeth.push(mesh);
    });
  }
  return teeth;
}

function buildGum(material: THREE.MeshStandardMaterial): THREE.Mesh {
  const geometry = new THREE.TubeGeometry(new GumCurve(), 64, 0.12, 8, false);
  return new THREE.Mesh(geometry, material);
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const PIVOT_POSITION = new THREE.Vector3(0, 0.05, -0.3);
const UPPER_BASELINE_Y = 0.25;
const LOWER_BASELINE_Y = -0.25; // world Y of the lower arcade's baseline when closed
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
  camera.position.set(0, 1.2, 5);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(2, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.4);
  rim.position.set(-3, -1, -2);
  scene.add(rim);

  // Ivory reads fine on the dark surface but washes out on the light one:
  // swap for a warmer, darker pair when the theme is light (GUIDE-3D.md #2).
  const isLightTheme = hexLuminance(colors.surface) > 0.5;
  const toothColor = isLightTheme ? "#8a7361" : "#f1ece2";
  const gumColor = isLightTheme ? "#a85c63" : "#c98a8f";

  const toothMaterial = new THREE.MeshStandardMaterial({
    color: toothColor,
    roughness: 0.4,
    emissive: 0x000000,
    emissiveIntensity: 0.5,
  });
  const gumMaterial = new THREE.MeshStandardMaterial({ color: gumColor, roughness: 0.6 });

  // Upper arcade: static, teeth hang down from its baseline.
  const upperGroup = new THREE.Group();
  upperGroup.position.set(0, UPPER_BASELINE_Y, 0);
  const upperTeeth = buildArcadeTeeth(-1, toothMaterial);
  upperGroup.add(buildGum(gumMaterial.clone()), ...upperTeeth);
  scene.add(upperGroup);

  // Lower arcade: teeth stand up from its baseline, the whole arcade hangs
  // off a pivot group so it swings open around a hinge behind the mouth.
  const pivot = new THREE.Group();
  pivot.position.copy(PIVOT_POSITION);
  const lowerArcade = new THREE.Group();
  lowerArcade.position.set(0, LOWER_BASELINE_Y - PIVOT_POSITION.y, -PIVOT_POSITION.z);
  const lowerTeeth = buildArcadeTeeth(1, toothMaterial);
  lowerArcade.add(buildGum(gumMaterial.clone()), ...lowerTeeth);
  pivot.add(lowerArcade);
  scene.add(pivot);

  const allTeeth = [...upperTeeth, ...lowerTeeth];

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
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
  let hovered: THREE.Mesh | null = null;
  let pointerDown: { x: number; y: number } | null = null;
  let currentElapsed = 0;
  let isOpen = false;
  let animFromAngle = 0;
  let animToAngle = 0;
  let animStart = 0;

  const setHover = (mesh: THREE.Mesh | null) => {
    if (hovered === mesh) return;
    if (hovered) (hovered.material as THREE.MeshStandardMaterial).emissive.set(0x000000);
    if (mesh) (mesh.material as THREE.MeshStandardMaterial).emissive.set(colors.green);
    hovered = mesh;
    canvas.style.cursor = mesh ? "pointer" : "auto";
  };

  const handlePointerMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);
    const hits = raycaster.intersectObjects(allTeeth, false);
    setHover(hits.length > 0 ? (hits[0].object as THREE.Mesh) : null);
  };

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
