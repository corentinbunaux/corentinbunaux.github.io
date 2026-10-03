import * as THREE from "three";
import { ExoArmDemo } from "../../../../src/components/demos/ExoArmDemo";
import { mountStage } from "../../test-utils/stage";
import { advanceSeconds, findAll } from "../../test-utils/three";

const GAUGE_MAX = 1.1;
const GAUGE_MIN = 0.04 * GAUGE_MAX;

function handles(scene: THREE.Scene) {
  const meshes = scene.children.filter((c): c is THREE.Mesh => c instanceof THREE.Mesh);
  const motorGauge = meshes.find((m) => m.position.x === 1.15)!;
  const wearerGauge = meshes.find((m) => m.position.x === 1.4)!;
  const disc = findAll<THREE.Mesh>(
    scene,
    (o) => o instanceof THREE.Mesh && (o.material as THREE.MeshStandardMaterial).emissiveIntensity !== 1,
  )[0];
  return { motorGauge, wearerGauge, disc, discMaterial: disc.material as THREE.MeshStandardMaterial };
}

describe("ExoArmDemo", () => {
  it("builds the arm, the motor and two effort gauges from the theme colours", () => {
    const { scene, camera } = mountStage(<ExoArmDemo />);
    expect(camera.fov).toBe(38);
    const { motorGauge, wearerGauge, disc } = handles(scene);
    expect(motorGauge).toBeDefined();
    expect(disc).toBeDefined();
    // Wearer effort is constant and low: the motor does the work.
    expect(wearerGauge.scale.y).toBeCloseTo(0.12 * GAUGE_MAX);
    const green = new THREE.Color("#81a3a7");
    expect((motorGauge.material as THREE.MeshStandardMaterial).color.equals(green)).toBe(true);
  });

  it("plays the lift cycle: motor assists while rising, then holds, lowers and rests", () => {
    const { scene } = mountStage(<ExoArmDemo />);
    const { motorGauge, wearerGauge, disc, discMaterial } = handles(scene);

    // t = 0.1 s: rising, gauge barely above its floor, motor glowing.
    expect(motorGauge.scale.y).toBeLessThan(0.1);
    expect(discMaterial.emissiveIntensity).toBe(0.4);
    const spinBefore = disc.rotation.y;
    advanceSeconds(1.0); // t = 1.1 s, mid-rise
    expect(disc.rotation.y).toBeGreaterThan(spinBefore);
    expect(motorGauge.scale.y).toBeCloseTo(GAUGE_MAX / 2, 1);

    advanceSeconds(1.4); // t = 2.5 s, held aloft
    expect(motorGauge.scale.y).toBeCloseTo(GAUGE_MAX);
    expect(discMaterial.emissiveIntensity).toBe(0);
    const heldSpin = disc.rotation.y;
    advanceSeconds(0.3);
    expect(disc.rotation.y).toBe(heldSpin); // no spin when not assisting

    advanceSeconds(1.3); // t = 4.1 s, lowering
    expect(motorGauge.scale.y).toBeGreaterThan(GAUGE_MIN);
    expect(motorGauge.scale.y).toBeLessThan(GAUGE_MAX);

    advanceSeconds(1.5); // t = 5.6 s, resting
    expect(motorGauge.scale.y).toBeCloseTo(GAUGE_MIN);

    advanceSeconds(1.0); // t = 6.6 s, next cycle rising again
    expect(discMaterial.emissiveIntensity).toBe(0.4);
    expect(wearerGauge.scale.y).toBeCloseTo(0.12 * GAUGE_MAX);
  });
});
