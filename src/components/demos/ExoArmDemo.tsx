"use client";

import * as THREE from "three";
import { ThreeStage, type ThreeStageSetup } from "./ThreeStage";

/** Full lift cycle: rise, hold aloft, lower, hold down (seconds). */
const CYCLE_SECONDS = 6;
const RISE_SECONDS = 2.2;
const HOLD_UP_SECONDS = 0.8;
const FALL_SECONDS = 2.2;
const ELBOW_MAX_ANGLE = THREE.MathUtils.degToRad(110);
/** Visible spin while the motor assists (rad/s). */
const MOTOR_SPIN_SPEED = 7;

function easeInOutSine(x: number): number {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

/** Elbow angle (0 = arm hanging straight, ELBOW_MAX_ANGLE = load lifted) and
 * whether the motor is actively assisting, at a point in the loop. */
function liftCycle(elapsed: number): { angle: number; assisting: boolean } {
  const t = elapsed % CYCLE_SECONDS;
  if (t < RISE_SECONDS) {
    return { angle: easeInOutSine(t / RISE_SECONDS) * ELBOW_MAX_ANGLE, assisting: true };
  }
  if (t < RISE_SECONDS + HOLD_UP_SECONDS) {
    return { angle: ELBOW_MAX_ANGLE, assisting: false };
  }
  if (t < RISE_SECONDS + HOLD_UP_SECONDS + FALL_SECONDS) {
    const p = (t - RISE_SECONDS - HOLD_UP_SECONDS) / FALL_SECONDS;
    return { angle: (1 - easeInOutSine(p)) * ELBOW_MAX_ANGLE, assisting: false };
  }
  return { angle: 0, assisting: false };
}

const UPPER_LENGTH = 1.1;
const FOREARM_LENGTH = 1.0;
const LIMB_RADIUS = 0.09;
const BAR_OFFSET = 0.15;
const GAUGE_MAX_HEIGHT = 1.1;
/** Constant low value for the wearer-effort gauge: the motor does the work. */
const WEARER_EFFORT = 0.12;

const setupScene: ThreeStageSetup = ({ scene, camera, colors }) => {
  camera.position.set(3.2, 1.6, 4.2);
  camera.lookAt(0, 0.6, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(3, 5, 4);
  scene.add(sun);

  const skinColor = new THREE.Color(colors.secondText);
  const exoColor = new THREE.Color(colors.green);
  const hardwareColor = new THREE.Color(colors.mainText);
  const boardColor = new THREE.Color(colors.blue);

  const skinMaterial = new THREE.MeshStandardMaterial({
    color: skinColor,
    transparent: true,
    opacity: 0.9,
    roughness: 0.65,
  });
  const exoMaterial = new THREE.MeshStandardMaterial({ color: exoColor, roughness: 0.4, metalness: 0.35 });
  const hardwareMaterial = new THREE.MeshStandardMaterial({ color: hardwareColor, roughness: 0.45, metalness: 0.4 });
  const boardMaterial = new THREE.MeshStandardMaterial({ color: boardColor, roughness: 0.5, metalness: 0.1 });
  const discMaterial = new THREE.MeshStandardMaterial({
    color: boardColor,
    roughness: 0.35,
    metalness: 0.3,
    emissive: exoColor,
    emissiveIntensity: 0,
  });

  // --- Shoulder + upper arm (fixed relative to the frame) ----------------
  const shoulderGroup = new THREE.Group();
  shoulderGroup.position.set(0, 1.8, 0);
  scene.add(shoulderGroup);

  const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), skinMaterial);
  shoulderGroup.add(shoulder);

  const upperArm = new THREE.Mesh(
    new THREE.CapsuleGeometry(LIMB_RADIUS, UPPER_LENGTH - 2 * LIMB_RADIUS, 4, 8),
    skinMaterial,
  );
  upperArm.position.set(0, -UPPER_LENGTH / 2, 0);
  shoulderGroup.add(upperArm);

  const upperBarLength = UPPER_LENGTH - 0.2;
  for (const side of [-1, 1]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, upperBarLength, 0.06), exoMaterial);
    bar.position.set(side * BAR_OFFSET, -UPPER_LENGTH / 2, 0);
    shoulderGroup.add(bar);
  }
  for (const t of [0.22, 0.78]) {
    const strap = new THREE.Mesh(new THREE.TorusGeometry(BAR_OFFSET + 0.03, 0.02, 8, 20), exoMaterial);
    strap.rotation.x = Math.PI / 2;
    strap.position.set(0, -UPPER_LENGTH * t, 0);
    shoulderGroup.add(strap);
  }

  // --- Elbow motor: housing fixed to the frame, disc spins while working -
  const elbowPoint = new THREE.Vector3(0, -UPPER_LENGTH, 0);

  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.24, 16), hardwareMaterial);
  motor.rotation.z = Math.PI / 2; // axis of the cylinder = axis of the elbow
  motor.position.copy(elbowPoint);
  shoulderGroup.add(motor);

  const discPivot = new THREE.Group();
  discPivot.rotation.z = Math.PI / 2; // aligns the pivot's local Y with the elbow axis
  discPivot.position.copy(elbowPoint);
  shoulderGroup.add(discPivot);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 24), discMaterial);
  disc.position.y = 0.14;
  discPivot.add(disc);

  // --- Control board + flexible cable to the motor ------------------------
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.3), boardMaterial);
  board.rotation.z = Math.PI / 2; // mounted upright against the arm bar
  board.position.set(BAR_OFFSET + 0.03, -UPPER_LENGTH * 0.35, 0);
  shoulderGroup.add(board);

  const cablePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(BAR_OFFSET + 0.03, -UPPER_LENGTH * 0.35, 0.05),
    new THREE.Vector3(BAR_OFFSET + 0.1, -UPPER_LENGTH * 0.6, 0.1),
    elbowPoint.clone().add(new THREE.Vector3(BAR_OFFSET * 0.6, 0.05, 0.05)),
  ]);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(cablePath, 16, 0.012, 6, false), hardwareMaterial);
  shoulderGroup.add(cable);

  // --- Forearm, rotates around the elbow ----------------------------------
  const elbowGroup = new THREE.Group();
  elbowGroup.position.copy(elbowPoint);
  shoulderGroup.add(elbowGroup);

  const forearm = new THREE.Mesh(
    new THREE.CapsuleGeometry(LIMB_RADIUS, FOREARM_LENGTH - 2 * LIMB_RADIUS, 4, 8),
    skinMaterial,
  );
  forearm.position.set(0, -FOREARM_LENGTH / 2, 0);
  elbowGroup.add(forearm);

  const forearmBarLength = FOREARM_LENGTH - 0.2;
  for (const side of [-1, 1]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, forearmBarLength, 0.06), exoMaterial);
    bar.position.set(side * BAR_OFFSET, -FOREARM_LENGTH / 2, 0);
    elbowGroup.add(bar);
  }
  for (const t of [0.2, 0.75]) {
    const strap = new THREE.Mesh(new THREE.TorusGeometry(BAR_OFFSET + 0.03, 0.02, 8, 20), exoMaterial);
    strap.rotation.x = Math.PI / 2;
    strap.position.set(0, -FOREARM_LENGTH * t, 0);
    elbowGroup.add(strap);
  }

  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), skinMaterial);
  hand.scale.set(1, 0.6, 1);
  hand.position.set(0, -FOREARM_LENGTH, 0);
  elbowGroup.add(hand);

  // --- Load: a dumbbell held in the hand, follows the forearm -------------
  const loadBar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.34, 12), hardwareMaterial);
  loadBar.rotation.z = Math.PI / 2;
  loadBar.position.set(0, -FOREARM_LENGTH, 0);
  elbowGroup.add(loadBar);
  for (const side of [-1, 1]) {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 20), hardwareMaterial);
    plate.rotation.z = Math.PI / 2;
    plate.position.set(side * 0.16, -FOREARM_LENGTH, 0);
    elbowGroup.add(plate);
  }

  // --- Effort gauges: colour tells the story, no 3D text -------------------
  const gaugeGeometry = new THREE.BoxGeometry(0.12, 1, 0.12);
  gaugeGeometry.translate(0, 0.5, 0); // pivot at the base so scale.y grows upward
  const motorGaugeMaterial = new THREE.MeshStandardMaterial({ color: exoColor, roughness: 0.5 });
  const wearerGaugeMaterial = new THREE.MeshStandardMaterial({ color: boardColor, roughness: 0.5 });

  const motorGauge = new THREE.Mesh(gaugeGeometry, motorGaugeMaterial);
  motorGauge.position.set(1.15, -0.1, 0.15);
  scene.add(motorGauge);

  const wearerGauge = new THREE.Mesh(gaugeGeometry, wearerGaugeMaterial);
  wearerGauge.position.set(1.4, -0.1, 0.15);
  wearerGauge.scale.y = Math.max(WEARER_EFFORT, 0.04) * GAUGE_MAX_HEIGHT;
  scene.add(wearerGauge);

  return {
    update(elapsed, delta) {
      const { angle, assisting } = liftCycle(elapsed);
      elbowGroup.rotation.x = -angle;

      discMaterial.emissiveIntensity = assisting ? 0.4 : 0;
      if (assisting) {
        disc.rotation.y += MOTOR_SPIN_SPEED * delta;
      }

      const assistFraction = angle / ELBOW_MAX_ANGLE;
      motorGauge.scale.y = Math.max(assistFraction, 0.04) * GAUGE_MAX_HEIGHT;
    },
  };
};

export function ExoArmDemo() {
  return <ThreeStage setup={setupScene} fov={38} />;
}
