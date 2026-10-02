"use client";

import * as THREE from "three";
import { ThreeStage, type ThreeStageSetup } from "./ThreeStage";

/**
 * Safran demo (PORT-045, feedback #9): a textured Earth (NASA Blue Marble),
 * a small constellation of visible satellites on inclined orbits, and a
 * late, unbranded four-winged starfighter that passes by every so often.
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
const FIGHTER_PASS_DURATION = 7; // s
const FIGHTER_RADIUS = 3.2;
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

const WING_ANGLES_DEG = [45, 135, 225, 315] as const;

/** A generic four-winged starfighter, ~0.5 units long, built from primitives
 * only (no franchise names, logos or colours - a stylised nod, not a copy). */
function buildFighter(hullColor: THREE.ColorRepresentation, glowColor: THREE.ColorRepresentation) {
  const group = new THREE.Group();
  // Every part below is built with "forward" along +Y, then remapped to -Z
  // once (Object3D.lookAt points -Z at its target) via `model.rotation.x`.
  const model = new THREE.Group();
  const hullMaterial = new THREE.MeshStandardMaterial({ color: hullColor });
  const glowMaterial = new THREE.MeshBasicMaterial({ color: glowColor });

  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.05, 0.32, 8), hullMaterial);
  model.add(fuselage);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.14, 8), hullMaterial);
  nose.position.y = 0.23;
  model.add(nose);

  const WING_ROOT = 0.05; // distance fuselage -> racine de l'aile
  const WING_LENGTH = 0.3; // longueur de l'aile, vers l'exterieur
  const WING_THICKNESS = 0.02;
  const WING_CHORD = 0.09; // largeur (corde) de l'aile

  for (const deg of WING_ANGLES_DEG) {
    const rad = THREE.MathUtils.degToRad(deg);
    // Upper pair (45/315) fans up, lower pair (135/225) fans down: an X-wing silhouette.
    const tilt = (deg === 45 || deg === 315 ? 1 : -1) * THREE.MathUtils.degToRad(20);
    const centerDist = WING_ROOT + WING_LENGTH / 2;

    // Local box: long axis on X (radial), thin on Y, chord on Z - built flat,
    // then rotated so its own X axis points outward at angle `rad` in the XZ
    // plane, then fanned up/down by `tilt` around that same outward axis.
    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(WING_LENGTH, WING_THICKNESS, WING_CHORD),
      hullMaterial,
    );
    const outward = new THREE.Vector3(Math.cos(rad), 0, Math.sin(rad));
    wing.position.copy(outward).multiplyScalar(centerDist);
    wing.position.y -= 0.02;
    // Point local +X along `outward`, keeping local Y roughly vertical, then
    // fan the wing up/down around that same outward axis.
    const wingUp = new THREE.Vector3(0, 1, 0);
    const m = new THREE.Matrix4().makeBasis(
      outward,
      wingUp.clone().sub(outward.clone().multiplyScalar(wingUp.dot(outward))).normalize(),
      new THREE.Vector3().crossVectors(outward, wingUp).normalize(),
    );
    wing.quaternion.setFromRotationMatrix(m);
    wing.rotateX(tilt); // fan around the wing's own (now radial) local X axis
    model.add(wing);

    const cannon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8),
      hullMaterial,
    );
    cannon.position.copy(outward).multiplyScalar(WING_ROOT + WING_LENGTH + 0.05);
    cannon.position.y -= 0.02;
    cannon.quaternion.copy(wing.quaternion);
    cannon.rotateZ(Math.PI / 2); // cylinder's own axis (Y) -> along the wing's radial X
    model.add(cannon);

    const reactor = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 8), glowMaterial);
    reactor.position.copy(outward).multiplyScalar(WING_ROOT + WING_LENGTH * 0.35);
    reactor.position.y -= 0.02 + 0.03 * Math.sign(tilt);
    model.add(reactor);
  }

  model.rotation.x = -Math.PI / 2;
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
  const fighter = buildFighter(0x9a9a9a, colors.green);
  scene.add(fighter);
  let fighterActive = false;
  let nextFighterStart = FIGHTER_FIRST_AT;

  const position = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();

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
          fighter.lookAt(lookTarget.copy(position).add(tangent));
        }
      }
    },
  };
};

export function SafranEarthDemo() {
  return <ThreeStage setup={setupScene} fov={40} />;
}
