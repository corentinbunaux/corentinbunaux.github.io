"use client";

import * as THREE from "three";
import { ThreeStage, type ThreeStageSetup } from "./ThreeStage";

/**
 * Safran demo (PORT-045, feedback #9): a textured Earth (NASA Blue Marble),
 * a small constellation of visible satellites on inclined orbits, and a
 * late, unbranded delta-wing fighter that passes by every so often.
 */

const EARTH_RADIUS = 1.4;
const ATMOSPHERE_RADIUS = 1.47;
const EARTH_TILT = THREE.MathUtils.degToRad(23.4);
const EARTH_SPIN_SPEED = 0.06; // rad/s

const STAR_COUNT = 600;
const STAR_FIELD_RADIUS = 40;
const STAR_SIZE = 0.08;

interface OrbitDef {
  readonly radius: number;
  readonly inclination: number; // radians
  readonly speed: number; // rad/s
}

/** Three inclined orbits, two satellites per orbit (in opposition). */
const ORBITS: readonly OrbitDef[] = [
  { radius: 1.9, inclination: THREE.MathUtils.degToRad(15), speed: 0.35 },
  { radius: 2.3, inclination: THREE.MathUtils.degToRad(-40), speed: 0.25 },
  { radius: 2.7, inclination: THREE.MathUtils.degToRad(65), speed: 0.18 },
];

const FIGHTER_FIRST_AT = 20; // s
const FIGHTER_INTERVAL = 45; // s
const FIGHTER_PASS_DURATION = 11; // s - slow enough to be read (PORT-066)
const FIGHTER_RADIUS = 2.4; // closer to the camera than the 3.2 of PORT-054
const FIGHTER_SCALE = 2; // the ~0.5-unit model read as a dot at display size
const FIGHTER_BANK = 1.2; // weight of "towards the camera" in the fighter's up vector
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const FIGHTER_START_ANGLE = THREE.MathUtils.degToRad(-20);

/** Point on a circular orbit of `radius`, tilted by `inclination` around the X axis. */
function orbitPosition(radius: number, inclination: number, angle: number, out: THREE.Vector3) {
  const x = radius * Math.cos(angle);
  const zLocal = radius * Math.sin(angle);
  return out.set(x, -zLocal * Math.sin(inclination), zLocal * Math.cos(inclination));
}

/** Tangent (unnormalized, direction of increasing `angle`) of the same orbit. */
function orbitTangent(radius: number, inclination: number, angle: number, out: THREE.Vector3) {
  const dx = -radius * Math.sin(angle);
  const dzLocal = radius * Math.cos(angle);
  return out.set(dx, -dzLocal * Math.sin(inclination), dzLocal * Math.cos(inclination));
}

/** The starfighter's own arc: a flattened loop that crosses the frame roughly
 * left-to-right, in front of the Earth, starting and ending outside the field. */
function fighterPosition(angle: number, out: THREE.Vector3) {
  const x = FIGHTER_RADIUS * Math.cos(angle);
  const y = 0.5 + 0.8 * Math.sin(angle);
  const z = FIGHTER_RADIUS * 0.5 * Math.sin(angle);
  return out.set(x, y, z);
}

function fighterTangent(angle: number, out: THREE.Vector3) {
  const dx = -FIGHTER_RADIUS * Math.sin(angle);
  const dy = 0.8 * Math.cos(angle);
  const dz = FIGHTER_RADIUS * 0.5 * Math.cos(angle);
  return out.set(dx, dy, dz);
}

function buildOrbitLine(orbit: OrbitDef, color: THREE.ColorRepresentation) {
  const segments = 128;
  const points: THREE.Vector3[] = [];
  const p = new THREE.Vector3();
  for (let i = 0; i < segments; i++) {
    orbitPosition(orbit.radius, orbit.inclination, (i / segments) * Math.PI * 2, p);
    points.push(p.clone());
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 });
  return new THREE.LineLoop(geometry, material);
}

function buildSatellite(bodyColor: THREE.ColorRepresentation, panelColor: THREE.ColorRepresentation) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.1, 0.16),
    new THREE.MeshStandardMaterial({ color: bodyColor }),
  );
  group.add(body);

  const panelGeometry = new THREE.BoxGeometry(0.28, 0.01, 0.1);
  const panelMaterial = new THREE.MeshStandardMaterial({ color: panelColor });
  const panelLeft = new THREE.Mesh(panelGeometry, panelMaterial);
  panelLeft.position.x = -0.19;
  const panelRight = new THREE.Mesh(panelGeometry, panelMaterial);
  panelRight.position.x = 0.19;
  group.add(panelLeft, panelRight);

  return group;
}

const WING_ANHEDRAL = THREE.MathUtils.degToRad(10);

/** Flat triangular wing (planform in the model's X/Y plane, thin along Z),
 * root against the fuselage, tip swept back. `side` = 1 right, -1 left. */
function buildDeltaWing(side: 1 | -1, material: THREE.Material) {
  const shape = new THREE.Shape();
  shape.moveTo(side * 0.02, 0.12); // root, leading edge
  shape.lineTo(side * 0.32, -0.16); // tip
  shape.lineTo(side * 0.3, -0.2);
  shape.lineTo(side * 0.02, -0.2); // root, trailing edge
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.016, bevelEnabled: false });
  geometry.translate(0, 0, -0.008); // centre the thickness on the wing plane
  const wing = new THREE.Mesh(geometry, material);
  wing.position.z = -0.012; // slightly under the fuselage axis
  wing.rotation.y = side * WING_ANHEDRAL; // tip tilted down (anhedral)
  return wing;
}

/** A generic delta-wing interceptor, ~0.55 units long before `FIGHTER_SCALE`,
 * built from primitives only (no franchise names, logos or colours). PORT-066:
 * replaces the four thin X wings of PORT-045/054, which read as a cross (or as
 * one more satellite) at display size; one pair of wide flat wings, a tinted
 * cockpit bubble and two glowing engines read as "a ship" much more easily. */
function buildFighter(
  hullColor: THREE.ColorRepresentation,
  glowColor: THREE.ColorRepresentation,
  canopyColor: THREE.ColorRepresentation,
) {
  const group = new THREE.Group();
  // Every part below is built with "forward" along +Y and "top" along +Z,
  // then remapped once so forward is +Z (Object3D.lookAt points a mesh's +Z
  // at its target) and top stays world-up - see the end of this function.
  const model = new THREE.Group();
  const hullMaterial = new THREE.MeshStandardMaterial({ color: hullColor });
  const glowMaterial = new THREE.MeshBasicMaterial({ color: glowColor });

  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.05, 0.38, 12), hullMaterial);
  fuselage.position.y = -0.01;
  model.add(fuselage);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.16, 12), hullMaterial);
  nose.position.y = 0.26;
  model.add(nose);

  model.add(buildDeltaWing(1, hullMaterial), buildDeltaWing(-1, hullMaterial));

  // Cockpit bubble: a stretched, flattened sphere on top of the front fuselage.
  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(0.034, 16, 10),
    new THREE.MeshStandardMaterial({ color: canopyColor, transparent: true, opacity: 0.85 }),
  );
  canopy.scale.set(1, 2.2, 0.9);
  canopy.position.set(0, 0.09, 0.03);
  model.add(canopy);

  // Two glowing engines at the back, at the root of each wing.
  for (const side of [1, -1] as const) {
    const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.06, 12), glowMaterial);
    engine.position.set(side * 0.06, -0.19, -0.01);
    model.add(engine);
  }

  // +Y (forward) -> +Z, then half-turn around forward so +Z (top) -> world +Y.
  // PORT-054 used rotation.x = -PI/2, which flew the fighter tail first.
  model.rotation.x = Math.PI / 2;
  model.rotateY(Math.PI);
  model.scale.setScalar(FIGHTER_SCALE);
  group.add(model);
  group.visible = false;
  return group;
}

const setupScene: ThreeStageSetup = ({ scene, camera, colors }) => {
  camera.position.set(0, 1.2, 6.5);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(5, 3, 5);
  scene.add(sun);

  // Earth: NASA Blue Marble texture, axis tilted 23.4deg, slow self-rotation.
  const texture = new THREE.TextureLoader().load("/img/earth-blue-marble.webp");
  texture.colorSpace = THREE.SRGBColorSpace;
  const earthGroup = new THREE.Group();
  earthGroup.rotation.z = EARTH_TILT;
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS, 64, 48),
    new THREE.MeshStandardMaterial({ map: texture }),
  );
  earthGroup.add(earth);
  scene.add(earthGroup);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(ATMOSPHERE_RADIUS, 32, 24),
    new THREE.MeshBasicMaterial({
      color: colors.blue,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    }),
  );
  scene.add(atmosphere);

  // Fixed starfield.
  const starPositions = new Float32Array(STAR_COUNT * 3);
  const direction = new THREE.Vector3();
  for (let i = 0; i < STAR_COUNT; i++) {
    direction
      .set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
      .normalize()
      .multiplyScalar(STAR_FIELD_RADIUS);
    starPositions[i * 3] = direction.x;
    starPositions[i * 3 + 1] = direction.y;
    starPositions[i * 3 + 2] = direction.z;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({ color: colors.secondText, size: STAR_SIZE }),
  );
  scene.add(stars);

  // Orbits (traced) and satellites (two per orbit, in opposition).
  for (const orbit of ORBITS) {
    scene.add(buildOrbitLine(orbit, colors.green));
  }
  const satellites = ORBITS.flatMap((orbit) =>
    [0, 1].map((slot) => {
      const mesh = buildSatellite(colors.mainText, colors.blue);
      scene.add(mesh);
      return { mesh, orbit, phase: slot * Math.PI };
    }),
  );

  // Late, occasional starfighter pass (feedback #9's "last resort").
  const fighter = buildFighter(0x9a9a9a, colors.green, colors.blue);
  scene.add(fighter);
  let fighterActive = false;
  let nextFighterStart = FIGHTER_FIRST_AT;

  const position = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();
  const toCamera = new THREE.Vector3();

  return {
    update(elapsed) {
      earth.rotation.y = elapsed * EARTH_SPIN_SPEED;

      for (const satellite of satellites) {
        const angle = satellite.phase + elapsed * satellite.orbit.speed;
        orbitPosition(satellite.orbit.radius, satellite.orbit.inclination, angle, position);
        satellite.mesh.position.copy(position);
        orbitTangent(satellite.orbit.radius, satellite.orbit.inclination, angle, tangent);
        satellite.mesh.lookAt(lookTarget.copy(position).add(tangent));
      }

      if (!fighterActive && elapsed >= nextFighterStart) {
        fighterActive = true;
        fighter.visible = true;
      }
      if (fighterActive) {
        const t = elapsed - nextFighterStart;
        if (t >= FIGHTER_PASS_DURATION) {
          fighterActive = false;
          fighter.visible = false;
          nextFighterStart += FIGHTER_INTERVAL;
        } else {
          const angle = FIGHTER_START_ANGLE + (t / FIGHTER_PASS_DURATION) * Math.PI;
          fighterPosition(angle, position);
          fighter.position.copy(position);
          fighterTangent(angle, tangent);
          // Bank towards the camera so the flat delta planform is seen from
          // above instead of edge-on (the arc is almost at eye level).
          toCamera.copy(camera.position).sub(position).normalize();
          fighter.up.copy(WORLD_UP).addScaledVector(toCamera, FIGHTER_BANK).normalize();
          fighter.lookAt(lookTarget.copy(position).add(tangent));
        }
      }
    },
  };
};

export function SafranEarthDemo() {
  return <ThreeStage setup={setupScene} fov={40} />;
}
