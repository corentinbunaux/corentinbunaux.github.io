import * as THREE from "three";
import { SafranEarthDemo } from "../../../../src/components/demos/SafranEarthDemo";
import { mountStage } from "../../test-utils/stage";
import { advanceSeconds } from "../../test-utils/three";

/** The fighter is the only top-level group whose model is scaled x2. */
function fighterOf(scene: THREE.Scene) {
  return scene.children.find((c) => c.type === "Group" && c.children[0]?.scale.x === 2) as THREE.Group;
}

function satellitesOf(scene: THREE.Scene) {
  return scene.children.filter(
    (c) => c.type === "Group" && c.children.length === 3 && c.children.every((m) => m instanceof THREE.Mesh),
  );
}

describe("SafranEarthDemo", () => {
  it("builds the textured Earth, a starfield, three orbits and six satellites", () => {
    const load = jest.spyOn(THREE.TextureLoader.prototype, "load");
    const { scene, camera } = mountStage(<SafranEarthDemo />);
    expect(camera.fov).toBe(40);
    expect(load).toHaveBeenCalledWith("/img/earth-blue-marble.webp");

    const stars = scene.children.find((c) => c instanceof THREE.Points) as THREE.Points;
    expect(stars.geometry.getAttribute("position").count).toBe(600);
    expect(scene.children.filter((c) => c instanceof THREE.LineLoop)).toHaveLength(3);
    expect(satellitesOf(scene)).toHaveLength(6);
  });

  it("keeps satellites on their orbit radius while they move", () => {
    const { scene } = mountStage(<SafranEarthDemo />);
    const sats = satellitesOf(scene);
    const before = sats.map((s) => s.position.clone());
    advanceSeconds(1);
    sats.forEach((s, i) => {
      expect(s.position.distanceTo(before[i])).toBeGreaterThan(0);
      expect(s.position.length()).toBeCloseTo(before[i].length(), 5);
    });
    expect(sats[0].position.length()).toBeCloseTo(1.9);
  });

  it("sends the fighter across at 20 s for 11 s, then every 45 s", () => {
    const { scene } = mountStage(<SafranEarthDemo />);
    const fighter = fighterOf(scene);
    expect(fighter.visible).toBe(false);

    advanceSeconds(19.8); // t = 19.9 s
    expect(fighter.visible).toBe(false);

    advanceSeconds(0.2); // t = 20.1 s
    expect(fighter.visible).toBe(true);
    const start = fighter.position.clone();
    advanceSeconds(5);
    expect(fighter.visible).toBe(true);
    expect(fighter.position.x).toBeLessThan(start.x); // crossing the frame
    expect(fighter.up.length()).toBeCloseTo(1);

    advanceSeconds(6); // t = 31.1 s: pass over
    expect(fighter.visible).toBe(false);

    advanceSeconds(33.7); // t = 64.8 s
    expect(fighter.visible).toBe(false);
    advanceSeconds(0.3); // t = 65.1 s
    expect(fighter.visible).toBe(true);
  });
});
