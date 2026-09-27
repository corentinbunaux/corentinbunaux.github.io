"use client";

import * as THREE from "three";
import { ThreeStage, type ThreeStageSetup } from "../demos/ThreeStage";
import { HERO_ICONS } from "./heroIcons";

/** Max tilt applied to the globe + rings group when following the pointer. */
const MAX_TILT_RADIANS = 0.25;
/** Smoothing rate for the pointer tilt: current += (target - current) * min(1, delta * SMOOTHING). */
const TILT_SMOOTHING = 3;

const GLOBE_RADIUS = 1.1;
const GLOBE_SPIN_SPEED = 0.12;

interface RingSpec {
  radius: number;
  inclinationDeg: number;
  speed: number;
  icons: string[];
}

const iconKeys = Object.keys(HERO_ICONS);
const RINGS: readonly RingSpec[] = [
  { radius: 1.75, inclinationDeg: 20, speed: 0.18, icons: iconKeys.slice(0, 8) },
  { radius: 2.05, inclinationDeg: -35, speed: -0.12, icons: iconKeys.slice(8, 15) },
];

interface OrbitIcon {
  sprite: THREE.Sprite;
}

const setupGlobe: ThreeStageSetup = ({ scene, camera, colors }) => {
  camera.position.set(0, 0.4, 5.2);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);

  // The globe center never moves (the tilt group only rotates around the
  // origin), so its camera-space depth is constant: compute it once.
  const globeCenterCamZ = new THREE.Vector3(0, 0, 0).applyMatrix4(camera.matrixWorldInverse).z;

  const tiltGroup = new THREE.Group();
  scene.add(tiltGroup);

  const globeGeometry = new THREE.WireframeGeometry(
    new THREE.SphereGeometry(GLOBE_RADIUS, 18, 12),
  );
  const globeMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color(colors.blue),
    transparent: true,
    opacity: 0.55,
  });
  const globe = new THREE.LineSegments(globeGeometry, globeMaterial);
  tiltGroup.add(globe);

  const loader = new THREE.TextureLoader();
  const orbitIcons: OrbitIcon[] = [];
  const ringSpins: { group: THREE.Group; speed: number }[] = [];

  for (const ring of RINGS) {
    const ringTilt = new THREE.Group();
    ringTilt.rotation.x = THREE.MathUtils.degToRad(ring.inclinationDeg);
    tiltGroup.add(ringTilt);

    const ringSpin = new THREE.Group();
    ringTilt.add(ringSpin);
    ringSpins.push({ group: ringSpin, speed: ring.speed });

    const count = ring.icons.length;
    ring.icons.forEach((key, index) => {
      const dataUrl = HERO_ICONS[key as keyof typeof HERO_ICONS];
      const texture = loader.load(dataUrl);
      texture.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(material);
      sprite.scale.setScalar(0.32);

      const angle = (index / count) * Math.PI * 2;
      sprite.position.set(ring.radius * Math.cos(angle), 0, ring.radius * Math.sin(angle));

      ringSpin.add(sprite);
      orbitIcons.push({ sprite });
    });
  }

  let pointerX = 0;
  let pointerY = 0;
  const onPointerMove = (event: PointerEvent) => {
    pointerX = (event.clientX / window.innerWidth) * 2 - 1;
    pointerY = (event.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onPointerMove);

  const worldPosition = new THREE.Vector3();

  return {
    update(elapsed, delta) {
      globe.rotation.y = elapsed * GLOBE_SPIN_SPEED;

      for (const { group, speed } of ringSpins) {
        group.rotation.y = elapsed * speed;
      }

      const smoothing = Math.min(1, delta * TILT_SMOOTHING);
      const targetX = -pointerY * MAX_TILT_RADIANS;
      const targetY = pointerX * MAX_TILT_RADIANS;
      tiltGroup.rotation.x += (targetX - tiltGroup.rotation.x) * smoothing;
      tiltGroup.rotation.y += (targetY - tiltGroup.rotation.y) * smoothing;

      for (const { sprite } of orbitIcons) {
        sprite.getWorldPosition(worldPosition);
        const camZ = worldPosition.applyMatrix4(camera.matrixWorldInverse).z;
        const depth = THREE.MathUtils.clamp((camZ - globeCenterCamZ) / RINGS[1].radius, -1, 1);
        (sprite.material as THREE.SpriteMaterial).opacity = THREE.MathUtils.lerp(
          0.35,
          1,
          (depth + 1) / 2,
        );
      }
    },
    dispose() {
      window.removeEventListener("pointermove", onPointerMove);
    },
  };
};

export function HeroGlobe() {
  return <ThreeStage setup={setupGlobe} fov={40} />;
}
