import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { TrackIcon3D } from "../../../../src/components/journey/TrackIcon3D";
import { mountStage } from "../../test-utils/stage";
import { frames } from "../../test-utils/browser";
import { findAll, pointer } from "../../test-utils/three";

function iconGroup(scene: THREE.Scene) {
  return scene.children.find((c) => c.type === "Group") as THREE.Group;
}

describe("TrackIcon3D", () => {
  it("draws a briefcase (rounded box body) for experience", () => {
    const { scene, camera } = mountStage(<TrackIcon3D kind="experience" />);
    expect(camera.fov).toBe(30);
    const meshes = findAll<THREE.Mesh>(scene, (o) => o instanceof THREE.Mesh);
    expect(meshes.some((m) => m.geometry instanceof RoundedBoxGeometry)).toBe(true);
    expect(meshes.some((m) => m.geometry instanceof THREE.TubeGeometry)).toBe(false);
  });

  it("draws a graduation cap (with its tassel cord) for education", () => {
    const { scene } = mountStage(<TrackIcon3D kind="education" />);
    const meshes = findAll<THREE.Mesh>(scene, (o) => o instanceof THREE.Mesh);
    expect(meshes.some((m) => m.geometry instanceof THREE.TubeGeometry)).toBe(true);
    expect(meshes.some((m) => m.geometry instanceof RoundedBoxGeometry)).toBe(false);
  });

  it.each(["experience", "education"] as const)(
    "%s: spins three times faster while hovered, and rocks on X",
    (kind) => {
      const { scene, container } = mountStage(<TrackIcon3D kind={kind} />);
      const group = iconGroup(scene);

      let before = group.rotation.y;
      frames.step(100);
      const idleStep = group.rotation.y - before;
      expect(idleStep).toBeCloseTo(0.05);
      expect(group.rotation.x).not.toBe(0);

      pointer(container, "pointerenter");
      before = group.rotation.y;
      frames.step(100);
      expect(group.rotation.y - before).toBeCloseTo(idleStep * 3);

      pointer(container, "pointerleave");
      before = group.rotation.y;
      frames.step(100);
      expect(group.rotation.y - before).toBeCloseTo(idleStep);
    },
  );

  it("removes its hover listeners on unmount", () => {
    const { container, unmount } = mountStage(<TrackIcon3D kind="education" />);
    const removed = jest.spyOn(container, "removeEventListener");
    unmount();
    const types = removed.mock.calls.map(([type]) => type);
    expect(types).toEqual(expect.arrayContaining(["pointerenter", "pointerleave"]));
  });
});
