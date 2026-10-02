"use client";

import * as THREE from "three";
import { ThreeStage, type ThreeStageSetup } from "./ThreeStage";

/**
 * Scan + return in an L path (PORT-060, second of the two real embedded
 * systems demos — see recette-utilisateur-2.md point 9): the robot scans its
 * surroundings, then the visitor can drag it anywhere on the ground; once
 * released it walks back to its exact start position along two perpendicular
 * segments (never a diagonal), rotating to face each segment before moving
 * along it, exactly like a differential-drive robot would.
 *
 * Fixed camera, no OrbitControls (GUIDE-3D.md / the ticket): a plane
 * raycast against the ground gives the drag point directly in world space,
 * so there is no camera rotation to disambiguate from a drag.
 */

const ROBOT_LENGTH = 1;
const ROBOT_WIDTH = 0.6;
const ROBOT_BODY_HEIGHT = 0.35;
const WHEEL_RADIUS = 0.14;
const WHEEL_WIDTH = 0.09;
const WHEEL_TRACK = ROBOT_WIDTH + 0.03;
const RIDE_HEIGHT = WHEEL_RADIUS;

/** How far from home the robot can be dragged, in world units. */
const DRAG_LIMIT = 2.6;
const SCAN_DURATION = 1.5;
const PAUSE_DURATION = 0.5;
const LINEAR_SPEED = 1.1; // units/s
const ANGULAR_SPEED = Math.PI / 0.9; // rad/s
const MIN_STEP_DURATION = 0.25;
/** Drop offsets on one axis below this are treated as "already aligned":
 * that segment (and its rotation) is skipped entirely. */
const AXIS_EPSILON = 0.02;

type Phase = "scan" | "idle" | "dragging" | "paused" | "returning";

interface RotateStep {
  readonly kind: "rotate";
  readonly from: number;
  readonly to: number;
  readonly duration: number;
}
interface MoveStep {
  readonly kind: "move";
  readonly axis: "x" | "z";
  readonly from: number;
  readonly to: number;
  /** World coordinate on the other axis, held constant through the move. */
  readonly fixed: number;
  readonly duration: number;
}
type ReturnStep = RotateStep | MoveStep;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Shortest-path rotation between two headings, so the robot never spins the
 * long way round between two of the four cardinal headings it ever takes. */
function rotateStep(from: number, to: number): RotateStep {
  let delta = to - from;
  delta = (((delta + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  const duration = Math.max(Math.abs(delta) / ANGULAR_SPEED, MIN_STEP_DURATION);
  return { kind: "rotate", from, to: from + delta, duration };
}

function moveStep(axis: "x" | "z", from: number, to: number, fixed: number): MoveStep {
  const duration = Math.max(Math.abs(to - from) / LINEAR_SPEED, MIN_STEP_DURATION);
  return { kind: "move", axis, from, to, fixed, duration };
}

/**
 * Builds the L-shaped return path from a drop point back to the origin: an
 * X-axis correction, then a Z-axis correction, each preceded by a rotation
 * to face that segment — two perpendicular segments, never a diagonal.
 * Heading convention: `rotation.y = h` faces world direction
 * (sin h, cos h) in the XZ plane, so h = 0 faces +Z, h = ±PI/2 faces -X/+X.
 * Assumes the robot's heading is 0 at drop time, which holds here: nothing
 * ever rotates it before this call (idle and dragging both leave it at rest).
 */
function buildReturnSteps(dropX: number, dropZ: number): ReturnStep[] {
  const steps: ReturnStep[] = [];
  let heading = 0;
  let x = dropX;
  const z = dropZ;

  if (Math.abs(x) > AXIS_EPSILON) {
    const targetHeading = x > 0 ? -Math.PI / 2 : Math.PI / 2;
    steps.push(rotateStep(heading, targetHeading));
    heading = targetHeading;
    steps.push(moveStep("x", x, 0, z));
    x = 0;
  }

  if (Math.abs(z) > AXIS_EPSILON) {
    const targetHeading = z > 0 ? Math.PI : 0;
    if (Math.abs(targetHeading - heading) > 1e-3) {
      steps.push(rotateStep(heading, targetHeading));
      heading = targetHeading;
    }
    steps.push(moveStep("z", z, 0, x));
  }

  if (Math.abs(heading) > 1e-3) {
    steps.push(rotateStep(heading, 0));
  }

  return steps;
}

const setupScene: ThreeStageSetup = ({ scene, camera, colors, container }) => {
  camera.position.set(0, 6.3, 3.2);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(3, 6, 4);
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshStandardMaterial({ color: colors.surfaceRaised, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Discrete grid: here (unlike other demos) it is a useful visual cue,
  // since the whole point of this device is the precision of its return.
  const grid = new THREE.GridHelper(7, 14, colors.border, colors.border);
  scene.add(grid);

  // Thin ring left at the origin, visible throughout the drag/return so the
  // visitor can see the robot come back to exactly the same spot.
  const homeMarker = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.48, 40),
    new THREE.MeshBasicMaterial({ color: colors.green, transparent: true, opacity: 0.7, side: THREE.DoubleSide }),
  );
  homeMarker.rotation.x = -Math.PI / 2;
  homeMarker.position.y = 0.005;
  scene.add(homeMarker);

  // --- Robot -----------------------------------------------------------------
  const robot = new THREE.Group();
  scene.add(robot);

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: colors.green, roughness: 0.6 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(ROBOT_WIDTH, ROBOT_BODY_HEIGHT, ROBOT_LENGTH), bodyMaterial);
  body.position.y = RIDE_HEIGHT + ROBOT_BODY_HEIGHT / 2;
  robot.add(body);

  // Small nose cone marking the front (+Z at rest), so the sweep/return
  // orientation reads clearly even from the top-down camera.
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.22, 12),
    new THREE.MeshStandardMaterial({ color: colors.mainText, roughness: 0.5 }),
  );
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, RIDE_HEIGHT + ROBOT_BODY_HEIGHT / 2, ROBOT_LENGTH / 2 + 0.08);
  robot.add(nose);

  function buildWheel(): THREE.Mesh {
    // Cylinder axis is Y by default; the robot drives along local +Z, so the
    // axle (horizontal, perpendicular to travel) must lie along X.
    const geometry = new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH, 12);
    geometry.rotateZ(Math.PI / 2);
    return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: colors.mainText, roughness: 0.9 }));
  }
  const wheelOffsets = [
    { x: WHEEL_TRACK / 2, z: ROBOT_LENGTH / 2 - 0.14 },
    { x: -WHEEL_TRACK / 2, z: ROBOT_LENGTH / 2 - 0.14 },
    { x: WHEEL_TRACK / 2, z: -ROBOT_LENGTH / 2 + 0.14 },
    { x: -WHEEL_TRACK / 2, z: -ROBOT_LENGTH / 2 + 0.14 },
  ];
  for (const offset of wheelOffsets) {
    const wheel = buildWheel();
    wheel.position.set(offset.x, RIDE_HEIGHT, offset.z);
    robot.add(wheel);
  }

  // Scan feedback: a ring that expands from the robot and fades out.
  const scanMaterial = new THREE.MeshBasicMaterial({
    color: colors.green,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });
  const scanRing = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 40), scanMaterial);
  scanRing.rotation.x = -Math.PI / 2;
  scanRing.position.y = 0.01;
  robot.add(scanRing);

  // Generously sized, fully transparent hit target: still raycastable
  // (Object3D.visible stays true; only the material is invisible) and much
  // easier to grab than the body mesh alone.
  const grabZone = new THREE.Mesh(
    new THREE.BoxGeometry(ROBOT_LENGTH * 1.6, 0.7, ROBOT_LENGTH * 1.6),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
  );
  grabZone.position.y = RIDE_HEIGHT + ROBOT_BODY_HEIGHT / 2;
  robot.add(grabZone);

  // --- Interaction state -------------------------------------------------
  let phase: Phase = "scan";
  let phaseStart = 0;
  let currentElapsed = 0;
  let dropX = 0;
  let dropZ = 0;
  let returnSteps: ReturnStep[] = [];
  let returnIndex = 0;
  let stepStart = 0;
  let hovering = false;
  let activePointerId: number | null = null;

  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const dragPoint = new THREE.Vector3();

  const setNdcFromEvent = (event: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  const handlePointerMove = (event: PointerEvent) => {
    setNdcFromEvent(event);
    raycaster.setFromCamera(pointerNdc, camera);
    if (phase === "dragging") {
      if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) {
        robot.position.set(
          THREE.MathUtils.clamp(dragPoint.x, -DRAG_LIMIT, DRAG_LIMIT),
          0,
          THREE.MathUtils.clamp(dragPoint.z, -DRAG_LIMIT, DRAG_LIMIT),
        );
      }
      return;
    }
    if (phase === "idle") {
      const hit = raycaster.intersectObject(grabZone, false).length > 0;
      if (hit !== hovering) {
        hovering = hit;
        container.style.cursor = hit ? "grab" : "auto";
      }
    }
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (phase !== "idle") return;
    setNdcFromEvent(event);
    raycaster.setFromCamera(pointerNdc, camera);
    if (raycaster.intersectObject(grabZone, false).length === 0) return;
    phase = "dragging";
    activePointerId = event.pointerId;
    container.setPointerCapture(event.pointerId);
    container.style.cursor = "grabbing";
  };

  const endDrag = (event: PointerEvent) => {
    if (phase !== "dragging" || event.pointerId !== activePointerId) return;
    phase = "paused";
    phaseStart = currentElapsed;
    dropX = robot.position.x;
    dropZ = robot.position.z;
    hovering = false;
    container.style.cursor = "auto";
    if (container.hasPointerCapture(event.pointerId)) container.releasePointerCapture(event.pointerId);
    activePointerId = null;
  };

  container.addEventListener("pointermove", handlePointerMove);
  container.addEventListener("pointerdown", handlePointerDown);
  container.addEventListener("pointerup", endDrag);
  container.addEventListener("pointercancel", endDrag);

  return {
    update(elapsed) {
      currentElapsed = elapsed;

      if (phase === "scan") {
        const t = Math.min((elapsed - phaseStart) / SCAN_DURATION, 1);
        scanRing.scale.setScalar(0.03 + t * 1.1);
        scanMaterial.opacity = Math.sin(Math.PI * t) * 0.7;
        if (t >= 1) {
          scanMaterial.opacity = 0;
          phase = "idle";
        }
      } else if (phase === "paused") {
        if (elapsed - phaseStart >= PAUSE_DURATION) {
          const steps = buildReturnSteps(dropX, dropZ);
          if (steps.length === 0) {
            phase = "scan";
            phaseStart = elapsed;
          } else {
            returnSteps = steps;
            returnIndex = 0;
            stepStart = elapsed;
            phase = "returning";
          }
        }
      } else if (phase === "returning") {
        const step = returnSteps[returnIndex];
        const t = Math.min((elapsed - stepStart) / step.duration, 1);
        const eased = easeInOutCubic(t);
        if (step.kind === "rotate") {
          robot.rotation.y = THREE.MathUtils.lerp(step.from, step.to, eased);
        } else {
          const value = THREE.MathUtils.lerp(step.from, step.to, eased);
          if (step.axis === "x") robot.position.set(value, 0, step.fixed);
          else robot.position.set(step.fixed, 0, value);
        }
        if (t >= 1) {
          returnIndex += 1;
          if (returnIndex >= returnSteps.length) {
            robot.position.set(0, 0, 0);
            robot.rotation.y = 0;
            phase = "scan";
            phaseStart = elapsed;
          } else {
            stepStart = elapsed;
          }
        }
      }
    },
    dispose() {
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointerup", endDrag);
      container.removeEventListener("pointercancel", endDrag);
      container.style.cursor = "auto";
    },
  };
};

export function EmbeddedReturnDemo() {
  return <ThreeStage setup={setupScene} fov={40} />;
}
