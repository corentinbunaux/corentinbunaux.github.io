"use client";

import * as THREE from "three";
import { ThreeStage, type ThreeStageSetup } from "../demos/ThreeStage";
import { HERO_ICONS, HERO_ICONS_LIGHT_THEME } from "./heroIcons";

/** Max tilt applied to the rings group when following the pointer. */
const MAX_TILT_RADIANS = 0.25;
/** Smoothing rate for the pointer tilt: current += (target - current) * min(1, delta * SMOOTHING). */
const TILT_SMOOTHING = 3;

interface RingSpec {
  radius: number;
  inclinationDeg: number;
  speed: number;
  icons: string[];
}

const iconKeys = Object.keys(HERO_ICONS);
// Radii nudged up from the old globe-orbit values (1.75 / 2.05) now that the
// rings orbit the avatar circle instead: increasing them much further makes
// icons swing outside the camera frustum at the sides (verified by
// screenshot — the frame's visible half-width at this camera distance/fov
// is ~1.9 world units), so the increase stays modest (PORT-052).
const RINGS: readonly RingSpec[] = [
  { radius: 1.9, inclinationDeg: 20, speed: 0.18, icons: iconKeys.slice(0, 8) },
  { radius: 2.2, inclinationDeg: -35, speed: -0.12, icons: iconKeys.slice(8, 15) },
];

interface OrbitIcon {
  sprite: THREE.Sprite;
}

const setupGlobe: ThreeStageSetup = ({ scene, camera, colors }) => {
  camera.position.set(0, 0.4, 5.2);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);

  // The orbit center never moves (the tilt group only rotates around the
  // origin, which lines up with the avatar's center), so its camera-space
  // depth is constant: compute it once.
  const orbitCenterCamZ = new THREE.Vector3(0, 0, 0).applyMatrix4(camera.matrixWorldInverse).z;

  const tiltGroup = new THREE.Group();
  scene.add(tiltGroup);

  const loader = new THREE.TextureLoader();
  const orbitIcons: OrbitIcon[] = [];
  const ringSpins: { group: THREE.Group; speed: number }[] = [];

  const isLightTheme = colors.mainText.toLowerCase() !== "#f5f5f5";
  const TWO_TONE_ICONS = new Set(["groot", "bRabbit"]);

  for (const ring of RINGS) {
    const ringTilt = new THREE.Group();
    ringTilt.rotation.x = THREE.MathUtils.degToRad(ring.inclinationDeg);
    tiltGroup.add(ringTilt);

    const ringSpin = new THREE.Group();
    ringTilt.add(ringSpin);
    ringSpins.push({ group: ringSpin, speed: ring.speed });

    const count = ring.icons.length;
    ring.icons.forEach((key, index) => {
      const isTwoTone = TWO_TONE_ICONS.has(key);
      const dataUrl = isTwoTone && isLightTheme
        ? HERO_ICONS_LIGHT_THEME[key as keyof typeof HERO_ICONS_LIGHT_THEME]
        : HERO_ICONS[key as keyof typeof HERO_ICONS];
      const texture = loader.load(dataUrl);
      texture.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        // Groot/B-Rabbit (PORT-063) are two-tone drawings, not plain silhouettes:
        // tinting them would crush their internal contrast, so they keep their
        // own colours instead of the theme tint every other icon gets. Their
        // light-theme variant (PORT-068) is not a colour inversion — it's the
        // same white-fill artwork as dark theme, with a black outline ring
        // added around the silhouette so it still reads against a white page.
        color: isTwoTone ? 0xffffff : new THREE.Color(colors.mainText),
      });
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
        const depth = THREE.MathUtils.clamp((camZ - orbitCenterCamZ) / RINGS[1].radius, -1, 1);
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
