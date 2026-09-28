"use client";

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ThreeStage, type ThreeStageContext, type ThreeStageSetup } from "../demos/ThreeStage";
import type { TrackKind } from "./TrackIcon";

/**
 * Small 3D emblems for the Parcours tracks (PORT-050, feedback #6): a
 * graduation cap for Formation, a briefcase for Expérience. Desktop only —
 * see TrackIcon.tsx for the lucide fallback and the motion gate.
 */

const BASE_SPIN_SPEED = 0.5; // rad/s
const HOVER_SPIN_MULTIPLIER = 3;
const ROCK_AMPLITUDE = 0.15; // rad
const ROCK_SPEED = 0.6; // rad/s

/** Camera framing + lighting shared by both icons. */
function setStageBasics({ camera, scene }: ThreeStageContext) {
  camera.position.set(0, 0.6, 3.2);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(2, 3, 4);
  scene.add(sun);
}

/** Rotates `group` around Y (faster while `hovered()` is true) with a slight rock on X. */
function spinAndRock(group: THREE.Object3D, elapsed: number, delta: number, hovered: () => boolean) {
  const speed = hovered() ? BASE_SPIN_SPEED * HOVER_SPIN_MULTIPLIER : BASE_SPIN_SPEED;
  group.rotation.y += speed * delta;
  group.rotation.x = Math.sin(elapsed * ROCK_SPEED) * ROCK_AMPLITUDE;
}

/** Tracks hover on the stage container; returns the cleanup for `dispose()`. */
function attachHoverListeners(container: HTMLDivElement, onChange: (hovered: boolean) => void) {
  const onEnter = () => onChange(true);
  const onLeave = () => onChange(false);
  container.addEventListener("pointerenter", onEnter);
  container.addEventListener("pointerleave", onLeave);
  return () => {
    container.removeEventListener("pointerenter", onEnter);
    container.removeEventListener("pointerleave", onLeave);
  };
}

const setupCap: ThreeStageSetup = (context) => {
  const { scene, container, colors } = context;
  setStageBasics(context);

  const group = new THREE.Group();
  scene.add(group);

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: colors.mainText, roughness: 0.6 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: colors.green, roughness: 0.4 });

  // Flared skull cap, sitting under the board.
  const calotte = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.5, 0.45, 24), bodyMaterial);
  calotte.position.y = 0.08;
  group.add(calotte);

  // Square board, worn as a diamond (rotated 45deg around Y).
  const plate = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 1.3), bodyMaterial);
  plate.position.y = 0.35;
  plate.rotation.y = Math.PI / 4;
  group.add(plate);

  // Button at the centre of the board.
  const button = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), accentMaterial);
  button.position.y = 0.44;
  group.add(button);

  // Tassel: a curved cord from the button, draped over a corner, plus its tip.
  const cordCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.44, 0),
    new THREE.Vector3(0.55, 0.4, 0.1),
    new THREE.Vector3(0.75, 0.15, 0.15),
    new THREE.Vector3(0.68, -0.05, 0.15),
  ]);
  const cord = new THREE.Mesh(new THREE.TubeGeometry(cordCurve, 20, 0.02, 8, false), accentMaterial);
  group.add(cord);

  const tasselTip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 8), accentMaterial);
  tasselTip.position.set(0.68, -0.15, 0.15);
  group.add(tasselTip);

  let hovered = false;
  const detachHover = attachHoverListeners(container, (value) => {
    hovered = value;
  });

  return {
    update(elapsed, delta) {
      spinAndRock(group, elapsed, delta, () => hovered);
    },
    dispose() {
      detachHover();
    },
  };
};

const setupBriefcase: ThreeStageSetup = (context) => {
  const { scene, container, colors } = context;
  setStageBasics(context);

  const group = new THREE.Group();
  scene.add(group);

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: colors.mainText, roughness: 0.5 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: colors.green, roughness: 0.4 });

  const body = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.9, 0.4, 3, 0.07), bodyMaterial);
  group.add(body);

  // Handle: a half-torus arching above the case.
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.035, 8, 24, Math.PI), bodyMaterial);
  handle.position.y = 0.45;
  group.add(handle);

  // Band across the front.
  const band = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.16, 0.06), accentMaterial);
  band.position.z = 0.21;
  group.add(band);

  // Two clasps either side of the band.
  const claspGeometry = new THREE.BoxGeometry(0.12, 0.12, 0.06);
  for (const x of [-0.28, 0.28]) {
    const clasp = new THREE.Mesh(claspGeometry, accentMaterial);
    clasp.position.set(x, 0.02, 0.22);
    group.add(clasp);
  }

  let hovered = false;
  const detachHover = attachHoverListeners(container, (value) => {
    hovered = value;
  });

  return {
    update(elapsed, delta) {
      spinAndRock(group, elapsed, delta, () => hovered);
    },
    dispose() {
      detachHover();
    },
  };
};

export function TrackIcon3D({ kind }: { kind: TrackKind }) {
  return <ThreeStage setup={kind === "experience" ? setupBriefcase : setupCap} fov={30} />;
}
