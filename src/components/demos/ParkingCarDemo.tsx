"use client";

import * as THREE from "three";
import { ThreeStage, type ThreeStageSetup } from "./ThreeStage";
import {
  CAR_LENGTH,
  CAR_WIDTH,
  CURB_Z,
  PARKED_CAR_X,
  PARKED_Z,
  ROAD_DEPTH,
  ROAD_LENGTH,
  ROBOT_LENGTH,
  ROBOT_WIDTH,
  WHEELBASE,
  WHEEL_RADIUS,
  getParkingFrame,
} from "./parkingCarLogic";

const WHEEL_WIDTH = 0.12;
const WHEEL_TRACK = ROBOT_WIDTH - WHEEL_WIDTH; // outer face flush with the body sides
const ROBOT_BODY_HEIGHT = 0.4;
const ROBOT_RIDE_HEIGHT = WHEEL_RADIUS;
const PARKED_BODY_HEIGHT = 0.45;

function buildWheel(color: THREE.ColorRepresentation): { pivot: THREE.Group; spinMesh: THREE.Mesh } {
  // Cylinder axis is Y by default; bake a 90 degree tilt into the geometry
  // (not the mesh's own rotation) so the axle lies along Z and the mesh's
  // `rotation.y` is free to drive the rolling spin without Euler-order
  // interaction between the two rotations.
  const geometry = new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH, 12);
  geometry.rotateX(Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.9 }));
  const pivot = new THREE.Group();
  pivot.add(mesh);
  return { pivot, spinMesh: mesh };
}

function buildParkedCar(color: string): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(CAR_LENGTH, PARKED_BODY_HEIGHT, CAR_WIDTH), material);
  body.position.y = PARKED_BODY_HEIGHT / 2;
  const cabinHeight = PARKED_BODY_HEIGHT * 0.7;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(CAR_LENGTH * 0.55, cabinHeight, CAR_WIDTH * 0.82), material);
  cabin.position.set(-CAR_LENGTH * 0.05, PARKED_BODY_HEIGHT + cabinHeight / 2, 0);
  group.add(body, cabin);
  return group;
}

export const setupParkingCarScene: ThreeStageSetup = ({ scene, camera, colors }) => {
  camera.position.set(-1, 6, 7);
  camera.lookAt(1, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(3, 8, 4);
  scene.add(sun);

  // --- Decor -----------------------------------------------------------
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(ROAD_LENGTH, ROAD_DEPTH),
    new THREE.MeshStandardMaterial({ color: colors.surfaceRaised, roughness: 1 }),
  );
  road.rotation.x = -Math.PI / 2;
  scene.add(road);

  const sidewalk = new THREE.Mesh(
    new THREE.BoxGeometry(ROAD_LENGTH, 0.12, 1),
    new THREE.MeshStandardMaterial({ color: colors.border, roughness: 1 }),
  );
  sidewalk.position.set(0, 0.06, CURB_Z);
  scene.add(sidewalk);

  const markingMaterial = new THREE.MeshBasicMaterial({ color: colors.secondText });
  const markingGeometry = new THREE.BoxGeometry(0.05, 0.01, 1.1);
  // One line at each parked car's leading edge, plus one closing the row.
  const markingXs = [
    ...PARKED_CAR_X.map((x) => x - CAR_LENGTH / 2),
    PARKED_CAR_X[PARKED_CAR_X.length - 1] + CAR_LENGTH / 2,
  ];
  for (const x of markingXs) {
    const mark = new THREE.Mesh(markingGeometry, markingMaterial);
    mark.position.set(x, 0.006, PARKED_Z);
    scene.add(mark);
  }

  for (const x of PARKED_CAR_X) {
    const car = buildParkedCar(colors.secondText);
    car.position.set(x, 0, PARKED_Z);
    scene.add(car);
  }

  // --- Robot -------------------------------------------------------------
  const robot = new THREE.Group();
  scene.add(robot);

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: colors.green, roughness: 0.6 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(ROBOT_LENGTH, ROBOT_BODY_HEIGHT, ROBOT_WIDTH), bodyMaterial);
  body.position.y = ROBOT_RIDE_HEIGHT + ROBOT_BODY_HEIGHT / 2;
  robot.add(body);

  const wheelOffsets: Array<{ x: number; z: number; steer: boolean }> = [
    { x: WHEELBASE / 2, z: WHEEL_TRACK / 2, steer: true },
    { x: WHEELBASE / 2, z: -WHEEL_TRACK / 2, steer: true },
    { x: -WHEELBASE / 2, z: WHEEL_TRACK / 2, steer: false },
    { x: -WHEELBASE / 2, z: -WHEEL_TRACK / 2, steer: false },
  ];
  const steerPivots: THREE.Group[] = [];
  const spinMeshes: THREE.Mesh[] = [];
  for (const offset of wheelOffsets) {
    const { pivot, spinMesh } = buildWheel(colors.mainText);
    pivot.position.set(offset.x, ROBOT_RIDE_HEIGHT, offset.z);
    robot.add(pivot);
    spinMeshes.push(spinMesh);
    if (offset.steer) steerPivots.push(pivot);
  }

  // Sensor + beam, mounted on the kerb-facing side (+Z, "right flank" as the
  // robot drives forward scanning the parked row).
  const sensor = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.1, 0.06),
    new THREE.MeshStandardMaterial({ color: colors.mainText }),
  );
  sensor.position.set(ROBOT_LENGTH / 2 - 0.15, ROBOT_RIDE_HEIGHT + ROBOT_BODY_HEIGHT * 0.8, ROBOT_WIDTH / 2);
  robot.add(sensor);

  const beamPivot = new THREE.Group();
  beamPivot.position.copy(sensor.position);
  robot.add(beamPivot);
  const beamLength = CURB_Z - ROBOT_WIDTH / 2;
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: colors.blue,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(new THREE.ConeGeometry(0.35, beamLength, 12, 1, true), beamMaterial);
  // Cone points +Y (apex) by default; lay it along local +Z so the narrow
  // apex stays at the sensor and the wide base reaches toward the kerb.
  beam.rotation.x = -Math.PI / 2;
  beam.position.set(0, 0, beamLength / 2);
  beamPivot.add(beam);

  const tailLights: THREE.Mesh[] = [-1, 1].map((side) => {
    const material = new THREE.MeshStandardMaterial({
      color: colors.mainText,
      emissive: new THREE.Color(0xff2222),
      emissiveIntensity: 0,
    });
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.14), material);
    light.position.set(
      -ROBOT_LENGTH / 2 + 0.02,
      ROBOT_RIDE_HEIGHT + ROBOT_BODY_HEIGHT * 0.6,
      side * (ROBOT_WIDTH / 2 - 0.08),
    );
    robot.add(light);
    return light;
  });

  return {
    update(elapsed) {
      const frame = getParkingFrame(elapsed);

      robot.position.set(frame.pose.x, 0, frame.pose.z);
      robot.rotation.y = -frame.pose.heading;
      robot.visible = frame.opacity > 0.01;
      bodyMaterial.opacity = frame.opacity;
      bodyMaterial.transparent = frame.opacity < 1;

      for (const pivot of steerPivots) pivot.rotation.y = -frame.steerAngle;
      // The tilt that lays the cylinder on its side is baked into the
      // geometry (see buildWheel), so the axle is local Z: spin around Z.
      for (const mesh of spinMeshes) mesh.rotation.z = frame.wheelSpin;

      beamPivot.rotation.y = -frame.beamSweep;
      beam.visible = frame.beamVisible;
      beamMaterial.opacity = frame.beamOpacity * frame.opacity;
      beamMaterial.color.set(frame.beamColor === "green" ? colors.green : colors.blue);

      for (const light of tailLights) {
        const material = light.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = frame.tailLightsOn ? 1.5 : 0;
      }
    },
  };
};

export function ParkingCarDemo() {
  return <ThreeStage setup={setupParkingCarScene} fov={40} />;
}
