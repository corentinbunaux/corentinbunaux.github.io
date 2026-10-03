import * as THREE from "three";
import { act } from "@testing-library/react";
import { HeroGlobe } from "../../../../src/components/hero/HeroGlobe";
import { HERO_ICONS, HERO_ICONS_LIGHT_THEME } from "../../../../src/components/hero/heroIcons";
import { mountStage } from "../../test-utils/stage";
import { frames } from "../../test-utils/browser";
import { findAll } from "../../test-utils/three";

function sprites(scene: THREE.Scene) {
  return findAll<THREE.Sprite>(scene, (o) => o instanceof THREE.Sprite);
}

describe("HeroGlobe", () => {
  it("orbits the 15 hobby icons on two rings", () => {
    const load = jest.spyOn(THREE.TextureLoader.prototype, "load");
    const { scene, camera } = mountStage(<HeroGlobe />);
    expect(camera.fov).toBe(40);
    expect(sprites(scene)).toHaveLength(15);
    expect(load).toHaveBeenCalledTimes(15);
    const urls = load.mock.calls.map(([url]) => url);
    expect(urls).toEqual(Object.values(HERO_ICONS));
  });

  it("dark theme: tints every icon with the main text colour except the two-tone drawings", () => {
    const { scene } = mountStage(<HeroGlobe />, { theme: "dark" });
    const colors = sprites(scene).map((s) => (s.material as THREE.SpriteMaterial).color.getHexString());
    expect(colors.filter((c) => c === "ffffff")).toHaveLength(2); // groot, bRabbit
    expect(colors.filter((c) => c === new THREE.Color("#f5f5f5").getHexString())).toHaveLength(13);
  });

  it("light theme: swaps Groot and B-Rabbit for their outlined variants", () => {
    const load = jest.spyOn(THREE.TextureLoader.prototype, "load");
    mountStage(<HeroGlobe />, { theme: "light" });
    const urls = load.mock.calls.map(([url]) => url);
    expect(urls).toContain(HERO_ICONS_LIGHT_THEME.groot);
    expect(urls).toContain(HERO_ICONS_LIGHT_THEME.bRabbit);
    expect(urls).not.toContain(HERO_ICONS.groot);
  });

  it("spins the rings, fades icons behind the avatar and tilts toward the pointer", () => {
    const { scene } = mountStage(<HeroGlobe />);
    const opacities = sprites(scene).map((s) => (s.material as THREE.SpriteMaterial).opacity);
    opacities.forEach((o) => {
      expect(o).toBeGreaterThanOrEqual(0.35);
      expect(o).toBeLessThanOrEqual(1);
    });
    expect(new Set(opacities.map((o) => o.toFixed(2))).size).toBeGreaterThan(1);

    const positionsBefore = sprites(scene).map((s) => s.getWorldPosition(new THREE.Vector3()));
    frames.run(5, 100);
    const positionsAfter = sprites(scene).map((s) => s.getWorldPosition(new THREE.Vector3()));
    expect(positionsAfter[0].distanceTo(positionsBefore[0])).toBeGreaterThan(0);

    const tiltGroup = scene.children.find((c) => c.type === "Group")!;
    expect(tiltGroup.rotation.y).toBeCloseTo(0);
    act(() => {
      window.dispatchEvent(new MouseEvent("pointermove", { clientX: window.innerWidth, clientY: 0 }));
    });
    frames.run(30, 100);
    // pointer at the top-right corner: target tilt (+0.25 x, +0.25 y)
    expect(tiltGroup.rotation.y).toBeCloseTo(0.25, 2);
    expect(tiltGroup.rotation.x).toBeCloseTo(0.25, 2);
  });

  it("stops listening to the pointer on unmount", () => {
    const { unmount } = mountStage(<HeroGlobe />);
    const removed = jest.spyOn(window, "removeEventListener");
    unmount();
    expect(removed).toHaveBeenCalledWith("pointermove", expect.any(Function));
  });
});
