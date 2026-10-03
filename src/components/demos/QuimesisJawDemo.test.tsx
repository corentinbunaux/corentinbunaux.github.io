import * as THREE from "three";
import { act } from "@testing-library/react";
import { QuimesisJawDemo } from "./QuimesisJawDemo";
import { mountStage } from "../../test-utils/stage";
import { advanceSeconds, findAll, pointer } from "../../test-utils/three";

function setup(theme: "dark" | "light" = "dark") {
  const stage = mountStage(<QuimesisJawDemo />, { theme });
  const groups = stage.scene.children.filter((c) => c.type === "Group");
  const pivot = groups.find((g) => Math.abs(g.position.z + 0.3) < 1e-9) as THREE.Group;
  const arcades = findAll<THREE.Mesh>(
    stage.scene,
    (o) => o instanceof THREE.Mesh && !(o instanceof THREE.InstancedMesh),
  );
  const dots = findAll<THREE.InstancedMesh>(stage.scene, (o) => o instanceof THREE.InstancedMesh);
  const fire = (type: string, clientX: number, clientY: number) =>
    act(() => {
      pointer(stage.canvas, type, { clientX, clientY });
    });
  return { ...stage, pivot, arcades, dots, fire };
}

/** Scans the canvas on a grid for a point over a tooth. */
function findToothPixel(s: ReturnType<typeof setup>) {
  for (let y = 30; y < 300; y += 15) {
    for (let x = 20; x < 400; x += 15) {
      s.fire("pointermove", x, y);
      if (s.canvas.style.cursor === "pointer") return { x, y };
    }
  }
  return null;
}

describe("QuimesisJawDemo", () => {
  it("builds two arcades as single vertex-coloured surfaces, with hidden outline dots", () => {
    const s = setup();
    expect(s.camera.fov).toBe(35);
    expect(s.arcades).toHaveLength(2);
    for (const arcade of s.arcades) {
      expect(arcade.geometry.getAttribute("color")).toBeDefined();
      expect(arcade.geometry.index!.count % 3).toBe(0);
    }
    expect(s.dots).toHaveLength(2);
    s.dots.forEach((d) => expect(d.visible).toBe(false));
  });

  it.each([
    ["dark", "#f1ece2"],
    ["light", "#dcd6c8"],
  ] as const)("paints the enamel for the %s theme", (theme, enamel) => {
    const s = setup(theme);
    const colors = s.arcades[0].geometry.getAttribute("color");
    // Vertex colours are the raw sRGB channels (no colour-management conversion).
    const target = {
      r: parseInt(enamel.slice(1, 3), 16) / 255,
      g: parseInt(enamel.slice(3, 5), 16) / 255,
      b: parseInt(enamel.slice(5, 7), 16) / 255,
    };
    let found = false;
    for (let i = 0; i < colors.count && !found; i++) {
      found =
        Math.abs(colors.getX(i) - target.r) < 1e-3 &&
        Math.abs(colors.getY(i) - target.g) < 1e-3 &&
        Math.abs(colors.getZ(i) - target.b) < 1e-3;
    }
    expect(found).toBe(true);
  });

  it("outlines the hovered tooth with green dots and a pointer cursor, and clears it on leave", () => {
    const s = setup();
    const hit = findToothPixel(s);
    expect(hit).not.toBeNull();
    expect(s.dots.filter((d) => d.visible)).toHaveLength(1);

    s.fire("pointermove", hit!.x, hit!.y); // same tooth again: no change
    expect(s.dots.filter((d) => d.visible)).toHaveLength(1);

    s.fire("pointermove", 1, 1); // empty corner
    expect(s.canvas.style.cursor).toBe("auto");
    expect(s.dots.every((d) => !d.visible)).toBe(true);

    findToothPixel(s);
    act(() => {
      pointer(s.canvas, "pointerleave");
    });
    expect(s.canvas.style.cursor).toBe("auto");
  });

  it("opens the jaw on a click and closes it on the next one", () => {
    const s = setup();
    expect(s.pivot.rotation.x).toBe(0);
    s.fire("pointerdown", 200, 150);
    s.fire("pointerup", 202, 151);
    advanceSeconds(0.6);
    expect(s.pivot.rotation.x).toBeCloseTo(0.5);

    s.fire("pointerdown", 200, 150);
    s.fire("pointerup", 200, 150);
    advanceSeconds(0.2);
    expect(s.pivot.rotation.x).toBeGreaterThan(0);
    expect(s.pivot.rotation.x).toBeLessThan(0.5);
    advanceSeconds(0.4);
    expect(s.pivot.rotation.x).toBeCloseTo(0);
  });

  it("does not toggle on a drag (that rotates the view instead) or a stray pointerup", () => {
    const s = setup();
    s.fire("pointerup", 200, 150);
    s.fire("pointerdown", 200, 150);
    s.fire("pointerup", 260, 150);
    advanceSeconds(0.6);
    expect(s.pivot.rotation.x).toBe(0);
  });

  it("auto-rotates the view until the visitor grabs it", () => {
    const s = setup();
    const before = s.camera.position.clone();
    advanceSeconds(1);
    const autoRotateStep = s.camera.position.distanceTo(before);
    expect(autoRotateStep).toBeGreaterThan(0);

    s.fire("pointerdown", 200, 150); // OrbitControls "start": auto-rotate stops
    s.fire("pointerup", 200, 150);
    advanceSeconds(10); // let the damping decay
    const settled = s.camera.position.clone();
    advanceSeconds(1);
    expect(s.camera.position.distanceTo(settled)).toBeLessThan(autoRotateStep / 20);
  });

  it("removes its listeners and resets the cursor on unmount", () => {
    const s = setup();
    findToothPixel(s);
    const removed = jest.spyOn(s.canvas, "removeEventListener");
    s.unmount();
    expect(removed.mock.calls.map(([type]) => type)).toEqual(
      expect.arrayContaining(["pointermove", "pointerleave", "pointerdown", "pointerup"]),
    );
    expect(s.canvas.style.cursor).toBe("auto");
  });
});
