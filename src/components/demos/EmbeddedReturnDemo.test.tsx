import * as THREE from "three";
import { act } from "@testing-library/react";
import { EmbeddedReturnDemo } from "./EmbeddedReturnDemo";
import { mountStage } from "../../test-utils/stage";
import { frames } from "../../test-utils/browser";
import { advanceSeconds, pointer, toClient } from "../../test-utils/three";

function setup() {
  const stage = mountStage(<EmbeddedReturnDemo />);
  const robot = stage.scene.children.find((c) => c.type === "Group") as THREE.Group;
  const scanRing = robot.children.find(
    (c) => c instanceof THREE.Mesh && c.geometry instanceof THREE.RingGeometry,
  ) as THREE.Mesh;
  const at = (x: number, y: number, z: number) => toClient(new THREE.Vector3(x, y, z), stage.camera);
  const fire = (type: string, point: { clientX: number; clientY: number }, pointerId = 1) =>
    act(() => {
      pointer(stage.container, type, { ...point, pointerId });
    });
  return { ...stage, robot, scanMaterial: scanRing.material as THREE.MeshBasicMaterial, at, fire };
}

/** Lets the opening scan finish (1.5 s): the robot becomes draggable. */
function finishScan() {
  advanceSeconds(1.5);
}

function drag(s: ReturnType<typeof setup>, to: { x: number; z: number }, pointerId = 1) {
  s.fire("pointerdown", s.at(0, 0.3, 0), pointerId);
  s.fire("pointermove", s.at(to.x, 0, to.z), pointerId);
  s.fire("pointerup", s.at(to.x, 0, to.z), pointerId);
}

/** Runs the pause + L-shaped return, checking every frame stays on one of the two legs. */
function runReturn(s: ReturnType<typeof setup>, drop: { x: number; z: number }) {
  for (let i = 0; i < 120; i++) {
    frames.step(100);
    const { x, z } = s.robot.position;
    const onFirstLeg = Math.abs(z - drop.z) < 1e-9;
    const onSecondLeg = Math.abs(x) < 1e-9;
    expect(onFirstLeg || onSecondLeg).toBe(true); // never a diagonal
  }
}

describe("EmbeddedReturnDemo", () => {
  it("opens with an expanding, fading scan ring, ignoring grabs until it ends", () => {
    const s = setup();
    expect(s.scanMaterial.opacity).toBeGreaterThan(0);
    s.fire("pointerdown", s.at(0, 0.3, 0));
    expect(s.container.style.cursor).not.toBe("grabbing");
    finishScan();
    expect(s.scanMaterial.opacity).toBe(0);
  });

  it("shows a grab cursor over the robot only", () => {
    const s = setup();
    finishScan();
    s.fire("pointermove", s.at(0, 0.3, 0));
    expect(s.container.style.cursor).toBe("grab");
    s.fire("pointermove", s.at(0, 0.3, 0)); // unchanged hover: no-op
    expect(s.container.style.cursor).toBe("grab");
    s.fire("pointermove", s.at(2.5, 0, 2.5));
    expect(s.container.style.cursor).toBe("auto");
  });

  it("ignores a press on the empty ground", () => {
    const s = setup();
    finishScan();
    s.fire("pointerdown", s.at(2.5, 0, -2.5));
    s.fire("pointermove", s.at(1, 0, 1));
    expect(s.robot.position.length()).toBe(0);
  });

  it("drags the robot on the ground, clamped to the arena, under pointer capture", () => {
    const s = setup();
    finishScan();
    s.fire("pointerdown", s.at(0, 0.3, 0), 7);
    expect(s.container.style.cursor).toBe("grabbing");
    expect(s.container.hasPointerCapture(7)).toBe(true);

    s.fire("pointermove", s.at(1.2, 0, -0.8), 7);
    expect(s.robot.position.x).toBeCloseTo(1.2);
    expect(s.robot.position.z).toBeCloseTo(-0.8);

    s.fire("pointermove", s.at(6, 0, 0.5), 7);
    expect(s.robot.position.x).toBeCloseTo(2.6);

    s.fire("pointerup", s.at(6, 0, 0.5), 99); // another pointer: ignored
    expect(s.container.style.cursor).toBe("grabbing");
    s.fire("pointerup", s.at(6, 0, 0.5), 7);
    expect(s.container.style.cursor).toBe("auto");
    expect(s.container.hasPointerCapture(7)).toBe(false);
  });

  it.each([
    { x: 1.5, z: 1.0 },
    { x: -1.2, z: -1.4 },
    { x: 1.4, z: 0 },
    { x: 0, z: 1.6 },
    { x: 0, z: -1.6 },
  ])("walks back home from (%p) along an L path and rescans", (drop) => {
    const s = setup();
    finishScan();
    drag(s, drop);
    expect(s.robot.position.x).toBeCloseTo(drop.x);
    expect(s.robot.position.z).toBeCloseTo(drop.z);
    const dropped = { x: s.robot.position.x, z: s.robot.position.z };

    advanceSeconds(0.3); // still pausing
    expect(s.robot.position.x).toBe(dropped.x);

    runReturn(s, dropped);
    expect(s.robot.position.length()).toBe(0);
    expect(s.robot.rotation.y).toBe(0);
  });

  it("rescans straight away when released at home", () => {
    const s = setup();
    finishScan();
    drag(s, { x: 0, z: 0 });
    advanceSeconds(0.6);
    expect(s.scanMaterial.opacity).toBeGreaterThan(0);
    expect(s.robot.position.length()).toBeCloseTo(0);
  });

  it("treats pointercancel like a release", () => {
    const s = setup();
    finishScan();
    s.fire("pointerdown", s.at(0, 0.3, 0));
    s.fire("pointermove", s.at(1, 0, 1));
    act(() => {
      pointer(s.container, "pointercancel", { pointerId: 1 });
    });
    expect(s.container.style.cursor).toBe("auto");
  });

  it("removes its listeners and resets the cursor on unmount", () => {
    const s = setup();
    finishScan();
    s.fire("pointermove", s.at(0, 0.3, 0));
    const removed = jest.spyOn(s.container, "removeEventListener");
    s.unmount();
    expect(removed.mock.calls.map(([type]) => type)).toEqual(
      expect.arrayContaining(["pointermove", "pointerdown", "pointerup", "pointercancel"]),
    );
    expect(s.container.style.cursor).toBe("auto");
  });
});
