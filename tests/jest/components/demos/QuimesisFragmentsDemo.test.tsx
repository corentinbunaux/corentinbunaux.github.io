import * as THREE from "three";
import { QuimesisFragmentsDemo } from "../../../../src/components/demos/QuimesisFragmentsDemo";
import { renderWithProviders } from "../../test-utils/render";
import { frames } from "../../test-utils/browser";
import { fakeLayout, lastFrame, lastRenderer, resetRenderers } from "../../test-utils/three";

function mount() {
  resetRenderers();
  fakeLayout(400, 300);
  const view = renderWithProviders(<QuimesisFragmentsDemo />);
  const renderer = lastRenderer();
  frames.step(1000);
  const { scene, camera } = lastFrame(renderer);
  return { ...view, renderer, scene, camera };
}

describe("QuimesisFragmentsDemo (QuimesisAccent)", () => {
  it("renders seven green wireframe fragments", () => {
    const { scene, renderer, container } = mount();
    const meshes = scene.children.filter((c): c is THREE.Mesh => c instanceof THREE.Mesh);
    expect(meshes).toHaveLength(7);
    const material = meshes[0].material as THREE.MeshBasicMaterial;
    expect(material.wireframe).toBe(true);
    expect(material.color.equals(new THREE.Color("#81a3a7"))).toBe(true);
    expect(container.contains(renderer.domElement)).toBe(true);
  });

  it("spins each fragment over time", () => {
    const { scene } = mount();
    const fragment = scene.children.find((c) => c instanceof THREE.Mesh)!;
    const before = fragment.rotation.x;
    frames.step(1000);
    expect(fragment.rotation.x).not.toBe(before);
  });

  it("follows window resizes, ignoring a collapsed container", () => {
    const { renderer, camera } = mount();
    fakeLayout(600, 300);
    window.dispatchEvent(new Event("resize"));
    expect(renderer.size).toEqual({ width: 600, height: 300 });
    expect(camera.aspect).toBe(2);

    fakeLayout(0, 300);
    window.dispatchEvent(new Event("resize"));
    expect(renderer.size).toEqual({ width: 600, height: 300 });
  });

  it("stops the loop and frees GPU resources on unmount", () => {
    const { scene, renderer, unmount } = mount();
    const fragment = scene.children.find((c): c is THREE.Mesh => c instanceof THREE.Mesh)!;
    const geometryDispose = jest.spyOn(fragment.geometry, "dispose");
    const materialDispose = jest.spyOn(fragment.material as THREE.Material, "dispose");
    const removed = jest.spyOn(window, "removeEventListener");
    unmount();
    expect(geometryDispose).toHaveBeenCalled();
    expect(materialDispose).toHaveBeenCalled();
    expect(removed).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(renderer.disposed && renderer.contextLost).toBe(true);
    expect(renderer.domElement.parentNode).toBeNull();
    expect(frames.pending()).toBe(0);
    expect(scene.children.filter((c) => c instanceof THREE.Mesh)).toHaveLength(0);
  });
});
