"use client";

import * as THREE from "three";
import { ThreeStage, type ThreeStageSetup } from "./ThreeStage";

const UP = new THREE.Vector3(0, 1, 0);

/** Control points of the loop, in the XZ plane, forming an irregular
 * hippodrome shape (~10 x 5 units) with a slight rise (y up to 0.4) on the
 * right/back side. */
const TRACK_POINTS = [
  new THREE.Vector3(-3.6, 0, -2.4),
  new THREE.Vector3(-1.2, 0, -2.55),
  new THREE.Vector3(1.5, 0.05, -2.3),
  new THREE.Vector3(3.9, 0.2, -0.9),
  new THREE.Vector3(4.6, 0.4, 1.1),
  new THREE.Vector3(1.6, 0.35, 2.5),
  new THREE.Vector3(-1.9, 0.15, 2.25),
  new THREE.Vector3(-4.4, 0, 0.15),
];

/** Curvilinear position (0..1) of the station platform: the flat, roughly
 * straight segment between the first two control points. */
const STATION_U = 0.06;
/** How far apart the four train elements are, in curvilinear abscissa
 * (arc-length units, not fractions of the loop). */
const TRAIN_SPACING = 0.95;
/** Cruise speed, in loop-fractions per second: ~13 s/lap before accounting
 * for the braking/accelerating slowdown and the stop. */
const CRUISE_SPEED = 1 / 13;
/** u/s^2: brings the train from cruise speed to a stop in ~1.5 s. */
const BRAKE_DECEL = CRUISE_SPEED / 1.5;
const ACCEL = CRUISE_SPEED / 1.5;
const STOP_SECONDS = 2;
/** Small forward step (in u) used to sample a look-at target for orientation. */
const ORIENTATION_EPSILON = 0.001;
/** Camera orbits once every 90 s, at constant height and radius. */
const CAMERA_ORBIT_SECONDS = 90;

type TrainState = "rolling" | "braking" | "stopped" | "accelerating";

function wrap01(value: number): number {
  return ((value % 1) + 1) % 1;
}

/** Forward distance (0..1) from `current` to the station, going the way u increases. */
function distanceToStation(current: number): number {
  return wrap01(STATION_U - current);
}

/** One step of the train's speed profile: roll at cruise speed, brake to a
 * stop at the platform, wait, accelerate back to cruise. Pure function of
 * its own state so it can be exercised without a renderer. */
function stepTrain(
  state: { u: number; speed: number; phase: TrainState; stopTimer: number },
  delta: number,
): void {
  switch (state.phase) {
    case "rolling": {
      const brakingDistance = (state.speed * state.speed) / (2 * BRAKE_DECEL);
      if (distanceToStation(state.u) <= brakingDistance) {
        state.phase = "braking";
      }
      state.u = wrap01(state.u + state.speed * delta);
      break;
    }
    case "braking": {
      state.speed = Math.max(0, state.speed - BRAKE_DECEL * delta);
      const distance = distanceToStation(state.u);
      const step = state.speed * delta;
      if (state.speed <= 0.0005 || step >= distance) {
        state.u = STATION_U;
        state.speed = 0;
        state.phase = "stopped";
        state.stopTimer = 0;
      } else {
        state.u = wrap01(state.u + step);
      }
      break;
    }
    case "stopped": {
      state.stopTimer += delta;
      if (state.stopTimer >= STOP_SECONDS) {
        state.phase = "accelerating";
      }
      break;
    }
    case "accelerating": {
      state.speed = Math.min(CRUISE_SPEED, state.speed + ACCEL * delta);
      state.u = wrap01(state.u + state.speed * delta);
      if (state.speed >= CRUISE_SPEED) {
        state.phase = "rolling";
      }
      break;
    }
  }
}

/** Samples `curve` at `count` arc-length-spaced points, offset sideways by
 * `offset` (perpendicular to the tangent, in the curve's local plane). */
function offsetPoints(curve: THREE.CatmullRomCurve3, offset: number, count: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const u = i / count;
    const point = curve.getPointAt(u);
    const tangent = curve.getTangentAt(u);
    const side = new THREE.Vector3().crossVectors(tangent, UP).normalize().multiplyScalar(offset);
    points.push(point.clone().add(side));
  }
  return points;
}

function createCarGeometry(): THREE.CapsuleGeometry {
  // Lying on its side: rotate the (default vertical) capsule so its length
  // runs along local Z, which is what Object3D.lookAt aligns to the target.
  const geometry = new THREE.CapsuleGeometry(0.14, 0.6, 4, 8);
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

function createNoseGeometry(): THREE.ConeGeometry {
  // 4-sided cone = a beveled, low-poly nose. Apex toward local -Z (forward).
  const geometry = new THREE.ConeGeometry(0.15, 0.35, 4);
  geometry.rotateX(-Math.PI / 2);
  geometry.rotateY(Math.PI / 4); // face-align the 4 sides instead of an edge
  return geometry;
}

const setupScene: ThreeStageSetup = ({ scene, camera, colors }) => {
  camera.fov = 38;
  camera.position.set(0, 5.5, 9);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  const cameraRadius = Math.hypot(camera.position.x, camera.position.z);
  const cameraHeight = camera.position.y;

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(4, 8, 5);
  scene.add(sun);

  const trackCurve = new THREE.CatmullRomCurve3(TRACK_POINTS, true, "catmullrom", 0.5);
  trackCurve.arcLengthDivisions = 200;
  const trackLength = trackCurve.getLength();

  // Ground.
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 10),
    new THREE.MeshStandardMaterial({ color: colors.surfaceRaised }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  scene.add(ground);

  const grid = new THREE.GridHelper(16, 16, colors.border, colors.border);
  grid.position.y = 0;
  scene.add(grid);

  // Rails: two tubes along curves offset +-0.18 from the track centreline.
  const railMaterial = new THREE.MeshStandardMaterial({ color: colors.secondText });
  for (const offset of [0.18, -0.18]) {
    const railCurve = new THREE.CatmullRomCurve3(offsetPoints(trackCurve, offset, 200), true);
    const railGeometry = new THREE.TubeGeometry(railCurve, 200, 0.025, 8, true);
    scene.add(new THREE.Mesh(railGeometry, railMaterial));
  }

  // Sleepers, every 0.25 units of arc length along the track.
  const sleeperCount = Math.max(1, Math.round(trackLength / 0.25));
  const sleeperGeometry = new THREE.BoxGeometry(0.5, 0.04, 0.08);
  const sleeperMaterial = new THREE.MeshStandardMaterial({ color: colors.border });
  const sleepers = new THREE.InstancedMesh(sleeperGeometry, sleeperMaterial, sleeperCount);
  const sleeperMatrix = new THREE.Matrix4();
  for (let i = 0; i < sleeperCount; i++) {
    const u = i / sleeperCount;
    const point = trackCurve.getPointAt(u);
    const tangent = trackCurve.getTangentAt(u);
    const right = new THREE.Vector3().crossVectors(tangent, UP).normalize();
    const localUp = new THREE.Vector3().crossVectors(right, tangent).normalize();
    sleeperMatrix.makeBasis(right, localUp, tangent);
    sleeperMatrix.setPosition(point.x, point.y - 0.02, point.z);
    sleepers.setMatrixAt(i, sleeperMatrix);
  }
  sleepers.instanceMatrix.needsUpdate = true;
  scene.add(sleepers);

  // Station: a platform + a simple shelter, on the flat straight near STATION_U.
  const stationPoint = trackCurve.getPointAt(STATION_U);
  const stationTangent = trackCurve.getTangentAt(STATION_U);
  const stationRight = new THREE.Vector3().crossVectors(stationTangent, UP).normalize();
  const stationUp = new THREE.Vector3().crossVectors(stationRight, stationTangent).normalize();

  const platformGroup = new THREE.Group();
  platformGroup.position.copy(stationPoint).addScaledVector(stationRight, 0.75);
  platformGroup.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(stationTangent, stationUp, stationRight));
  scene.add(platformGroup);

  const platformMaterial = new THREE.MeshStandardMaterial({ color: colors.surface });
  const platform = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.15, 0.5), platformMaterial);
  platform.position.y = 0.075;
  platformGroup.add(platform);

  const shelterMaterial = new THREE.MeshStandardMaterial({ color: colors.secondText });
  const postGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6);
  for (const [x, z] of [
    [-0.85, -0.15],
    [-0.85, 0.15],
    [0.85, -0.15],
    [0.85, 0.15],
  ]) {
    const post = new THREE.Mesh(postGeometry, shelterMaterial);
    post.position.set(x, 0.15 + 0.3, z);
    platformGroup.add(post);
  }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 0.5), platformMaterial);
  roof.position.y = 0.15 + 0.6 + 0.025;
  platformGroup.add(roof);

  // Train: a loco (green, beveled nose) + 3 cars (mainText, blue window band).
  const carGeometry = createCarGeometry();
  const locoMaterial = new THREE.MeshStandardMaterial({ color: colors.green });
  const carMaterial = new THREE.MeshStandardMaterial({ color: colors.mainText });
  const windowMaterial = new THREE.MeshStandardMaterial({ color: colors.blue });
  const noseGeometry = createNoseGeometry();

  const carGroups: THREE.Group[] = [];
  for (let i = 0; i < 4; i++) {
    const isLoco = i === 0;
    const group = new THREE.Group();
    const body = new THREE.Mesh(carGeometry, isLoco ? locoMaterial : carMaterial);
    group.add(body);
    if (isLoco) {
      const nose = new THREE.Mesh(noseGeometry, locoMaterial);
      nose.position.z = -0.44 - 0.12;
      group.add(nose);
    } else {
      const windowBand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.32), windowMaterial);
      windowBand.position.y = 0.06;
      group.add(windowBand);
    }
    scene.add(group);
    carGroups.push(group);
  }

  const trainState = { u: STATION_U + 0.35, speed: CRUISE_SPEED, phase: "rolling" as TrainState, stopTimer: 0 };
  const trainSpacingU = TRAIN_SPACING / trackLength;
  const carHeightOffset = 0.16;

  return {
    update(elapsed, delta) {
      stepTrain(trainState, delta);

      for (let i = 0; i < carGroups.length; i++) {
        const u = wrap01(trainState.u - i * trainSpacingU);
        const point = trackCurve.getPointAt(u).clone();
        point.y += carHeightOffset;
        const target = trackCurve.getPointAt(wrap01(u + ORIENTATION_EPSILON)).clone();
        target.y += carHeightOffset;
        const group = carGroups[i];
        group.position.copy(point);
        group.lookAt(target);
      }

      const angle = (elapsed / CAMERA_ORBIT_SECONDS) * Math.PI * 2;
      camera.position.set(Math.sin(angle) * cameraRadius, cameraHeight, Math.cos(angle) * cameraRadius);
      camera.lookAt(0, 0, 0);
    },
  };
};

export function SncfTrainDemo() {
  return <ThreeStage setup={setupScene} fov={38} />;
}
