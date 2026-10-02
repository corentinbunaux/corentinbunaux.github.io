"use client";

import * as THREE from "three";
import { ThreeStage, type ThreeStageSetup } from "./ThreeStage";

/**
 * Sweep + approach (PORT-060, replaces the wrong "self-parking" reading of
 * this embedded systems project — see recette-utilisateur-2.md point 9): the
 * robot itself rotates back and forth scanning with its front sensor; when
 * an obstacle falls in the sensor's cone, it stops sweeping and drives
 * straight at the obstacle, pauses, then backs off and resumes the sweep.
 */

const ROBOT_LENGTH = 1;
const ROBOT_WIDTH = 0.6;
const ROBOT_BODY_HEIGHT = 0.35;
const WHEEL_RADIUS = 0.16;
const WHEEL_WIDTH = 0.1;
const WHEEL_TRACK = ROBOT_WIDTH + 0.04;
const RIDE_HEIGHT = WHEEL_RADIUS;

const SWEEP_AMPLITUDE = Math.PI / 2; // 90 degrees either side => 180 degrees total
const SWEEP_PERIOD = 4.5; // seconds for a full left-right-left cycle
const SENSOR_HALF_ANGLE = (12 * Math.PI) / 180; // detection cone half-angle
const SENSOR_RANGE = 3.2;

const OBSTACLE_DISTANCE = 2.2;
// Placed at the same bearing formula as `forward` below (sin, cos), so it
// only enters the sensor cone near one extreme of the arc, not at rest.
const OBSTACLE_ANGLE = SWEEP_AMPLITUDE * 0.82;
const OBSTACLE_X = Math.sin(OBSTACLE_ANGLE) * OBSTACLE_DISTANCE;
const OBSTACLE_Z = Math.cos(OBSTACLE_ANGLE) * OBSTACLE_DISTANCE;

const APPROACH_STANDOFF = 0.55; // gap left between robot front and obstacle
const APPROACH_SPEED = 0.9; // units/s
const APPROACH_PAUSE = 0.6;

type Phase = "sweep" | "approach" | "pause" | "retreat";

function buildWheel(color: THREE.ColorRepresentation): THREE.Mesh {
  // Cylinder axis is Y by default; the robot drives along local +Z, so the
  // axle (perpendicular to travel, horizontal) must lie along X. Baking that
  // tilt into the geometry (not the mesh's own rotation) leaves `rotation.x`
  // free to drive the rolling spin.
  const geometry = new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH, 12);
  geometry.rotateZ(Math.PI / 2);
  return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.9 }));
}

const setupScene: ThreeStageSetup = ({ scene, camera, colors }) => {
  camera.position.set(0, 4.3, 5);
  camera.lookAt(0, 0, 0.3);

  scene.add(new THREE.AmbientLight(0xffffff, 0.65));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(3, 5, 4);
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 9),
    new THREE.MeshStandardMaterial({ color: colors.surfaceRaised, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // --- Robot ---------------------------------------------------------------
  const robot = new THREE.Group();
  scene.add(robot);

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: colors.green, roughness: 0.6 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(ROBOT_WIDTH, ROBOT_BODY_HEIGHT, ROBOT_LENGTH), bodyMaterial);
  body.position.y = RIDE_HEIGHT + ROBOT_BODY_HEIGHT / 2;
  robot.add(body);

  const wheelOffsets = [
    { x: WHEEL_TRACK / 2, z: ROBOT_LENGTH / 2 - 0.15 },
    { x: -WHEEL_TRACK / 2, z: ROBOT_LENGTH / 2 - 0.15 },
    { x: WHEEL_TRACK / 2, z: -ROBOT_LENGTH / 2 + 0.15 },
    { x: -WHEEL_TRACK / 2, z: -ROBOT_LENGTH / 2 + 0.15 },
  ];
  const spinMeshes: THREE.Mesh[] = [];
  for (const offset of wheelOffsets) {
    const wheel = buildWheel(colors.mainText);
    wheel.position.set(offset.x, RIDE_HEIGHT, offset.z);
    robot.add(wheel);
    spinMeshes.push(wheel);
  }

  // Front sensor: a translucent cone pointing along the robot's forward axis (+Z).
  const sensorMount = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.1, 0.08),
    new THREE.MeshStandardMaterial({ color: colors.mainText }),
  );
  sensorMount.position.set(0, RIDE_HEIGHT + ROBOT_BODY_HEIGHT * 0.85, ROBOT_LENGTH / 2);
  robot.add(sensorMount);

  const coneMaterial = new THREE.MeshBasicMaterial({
    color: colors.blue,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const coneRadius = Math.tan(SENSOR_HALF_ANGLE) * SENSOR_RANGE;
  const cone = new THREE.Mesh(new THREE.ConeGeometry(coneRadius, SENSOR_RANGE, 16, 1, true), coneMaterial);
  // Cone apex points +Y by default; rotate so the apex sits at the sensor and
  // the cone opens along local +Z (the robot's forward direction).
  cone.rotation.x = -Math.PI / 2;
  cone.position.set(0, 0, SENSOR_RANGE / 2);
  sensorMount.add(cone);

  // --- Obstacle --------------------------------------------------------------
  const obstacle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.5, 16),
    new THREE.MeshStandardMaterial({ color: colors.secondText, roughness: 0.7 }),
  );
  obstacle.position.set(OBSTACLE_X, 0.25, OBSTACLE_Z);
  scene.add(obstacle);

  // --- State -----------------------------------------------------------------
  let phase: Phase = "sweep";
  let phaseStart = 0;
  let stopHeading = 0; // robot heading (relative to rest) when it stopped sweeping
  let approachStartDistance = 0;

  const restToObstacle = Math.hypot(OBSTACLE_X, OBSTACLE_Z) - ROBOT_LENGTH / 2 - 0.11 - APPROACH_STANDOFF;

  return {
    update(elapsed) {
      if (phase === "sweep") {
        const heading = SWEEP_AMPLITUDE * Math.sin((2 * Math.PI * elapsed) / SWEEP_PERIOD);
        robot.rotation.y = heading;

        // Vector from sensor to obstacle, in world space, compared with the
        // robot's current forward direction (local +Z rotated by `heading`).
        const forward = new THREE.Vector2(Math.sin(heading), Math.cos(heading));
        const toObstacle = new THREE.Vector2(OBSTACLE_X, OBSTACLE_Z).normalize();
        const angleToObstacle = Math.acos(THREE.MathUtils.clamp(forward.dot(toObstacle), -1, 1));

        if (angleToObstacle < SENSOR_HALF_ANGLE) {
          phase = "approach";
          phaseStart = elapsed;
          stopHeading = heading;
          approachStartDistance = 0;
          coneMaterial.color.set(colors.green);
        } else {
          coneMaterial.color.set(colors.blue);
        }
      } else if (phase === "approach") {
        robot.rotation.y = stopHeading;
        const t = elapsed - phaseStart;
        const traveled = Math.min(APPROACH_SPEED * t, restToObstacle);
        approachStartDistance = traveled;
        robot.position.set(Math.sin(stopHeading) * traveled, 0, Math.cos(stopHeading) * traveled);
        for (const mesh of spinMeshes) mesh.rotation.x = traveled / WHEEL_RADIUS;
        if (traveled >= restToObstacle) {
          phase = "pause";
          phaseStart = elapsed;
        }
      } else if (phase === "pause") {
        if (elapsed - phaseStart >= APPROACH_PAUSE) {
          phase = "retreat";
          phaseStart = elapsed;
        }
      } else {
        const t = elapsed - phaseStart;
        const traveled = Math.max(approachStartDistance - APPROACH_SPEED * t, 0);
        robot.position.set(Math.sin(stopHeading) * traveled, 0, Math.cos(stopHeading) * traveled);
        for (const mesh of spinMeshes) mesh.rotation.x = traveled / WHEEL_RADIUS;
        if (traveled <= 0) {
          robot.position.set(0, 0, 0);
          phase = "sweep";
          coneMaterial.color.set(colors.blue);
        }
      }
    },
  };
};

export function EmbeddedSweepDemo() {
  return <ThreeStage setup={setupScene} fov={42} />;
}
