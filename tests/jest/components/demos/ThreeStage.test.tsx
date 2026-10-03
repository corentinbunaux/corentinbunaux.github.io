import { render } from "@testing-library/react";
import * as THREE from "three";
import { ThreeStage, type ThreeStageContext, type ThreeStageSetup } from "../../../../src/components/demos/ThreeStage";
import { DARK_TOKENS, installThemeTokens } from "../../test-utils/render";
import { FakeIntersectionObserver, FakeResizeObserver, frames } from "../../test-utils/browser";
import { fakeLayout, lastRenderer, renderers, resetRenderers } from "../../test-utils/three";

beforeEach(() => {
  resetRenderers();
  installThemeTokens(DARK_TOKENS);
});

function trackingSetup() {
  const update = jest.fn();
  const dispose = jest.fn();
  let context: ThreeStageContext | null = null;
  const setup: ThreeStageSetup = jest.fn((ctx) => {
    context = ctx;
    return { update, dispose };
  });
  return { setup, update, dispose, context: () => context as ThreeStageContext };
}

describe("ThreeStage", () => {
  it("creates a renderer sized to its container and hands setup the scene, camera and theme colours", () => {
    fakeLayout(400, 200);
    const t = trackingSetup();
    const { container } = render(<ThreeStage setup={t.setup} fov={30} className="stage" />);

    const renderer = lastRenderer();
    const stage = container.querySelector("div.stage") as HTMLDivElement;
    expect(stage.contains(renderer.domElement)).toBe(true);
    expect(renderer.size).toEqual({ width: 400, height: 200 });
    expect(renderer.options).toEqual({ antialias: true, alpha: true });

    expect(t.setup).toHaveBeenCalledTimes(1);
    const ctx = t.context();
    expect(ctx.scene).toBeInstanceOf(THREE.Scene);
    expect(ctx.camera.fov).toBe(30);
    expect(ctx.camera.aspect).toBe(2);
    expect(ctx.container).toBe(stage);
    expect(ctx.renderer).toBe(renderer);
    expect(ctx.colors).toEqual({
      main: "#1a1a1a",
      surface: "#202020",
      surfaceRaised: "#2a2a2a",
      border: "#2f2f2f",
      mainText: "#f5f5f5",
      secondText: "#999999",
      green: "#81a3a7",
      blue: "#a7bcc7",
    });
  });

  it("caps the pixel ratio at 2", () => {
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 3 });
    render(<ThreeStage setup={trackingSetup().setup} />);
    expect(lastRenderer().pixelRatio).toBe(2);
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 1 });
  });

  it("uses the default fov and guards against a zero-height container", () => {
    const t = trackingSetup();
    const { container } = render(<ThreeStage setup={t.setup} />);
    expect(container.firstElementChild).toHaveClass("h-full", "w-full");
    expect(t.context().camera.fov).toBe(45);
    expect(t.context().camera.aspect).toBe(0); // 0 / max(0, 1)
  });

  it("runs update with clamped deltas, renders each frame, and pauses while off-screen", () => {
    const t = trackingSetup();
    render(<ThreeStage setup={t.setup} />);
    const renderer = lastRenderer();

    frames.step(50);
    expect(t.update).toHaveBeenLastCalledWith(expect.closeTo(0.05), expect.closeTo(0.05));
    frames.step(5000); // a long pause is clamped to 0.1 s
    expect(t.update).toHaveBeenLastCalledWith(expect.closeTo(0.15), expect.closeTo(0.1));
    expect(renderer.renders).toHaveLength(2);

    const io = FakeIntersectionObserver.instances[0];
    io.trigger(false);
    frames.step(50);
    expect(t.update).toHaveBeenCalledTimes(2);
    expect(renderer.renders).toHaveLength(2);
    expect(frames.pending()).toBe(1); // the loop keeps scheduling, just skips work

    io.trigger(true);
    frames.step(50);
    expect(t.update).toHaveBeenCalledTimes(3);
    // elapsed did not advance while hidden
    expect(t.update).toHaveBeenLastCalledWith(expect.closeTo(0.2), expect.closeTo(0.05));
  });

  it("resizes renderer and camera on container resize, ignoring a collapsed box", () => {
    const layout = fakeLayout(400, 200);
    const t = trackingSetup();
    render(<ThreeStage setup={t.setup} />);
    const renderer = lastRenderer();
    const ro = FakeResizeObserver.instances[0];

    layout.restore();
    fakeLayout(300, 300);
    ro.trigger();
    expect(renderer.size).toEqual({ width: 300, height: 300 });
    expect(t.context().camera.aspect).toBe(1);

    layout.restore();
    fakeLayout(0, 300);
    ro.trigger();
    expect(renderer.size).toEqual({ width: 300, height: 300 });
  });

  it("disposes everything reachable from the scene on unmount", () => {
    const texture = new THREE.Texture();
    const textureDispose = jest.spyOn(texture, "dispose");
    const geometry = new THREE.BoxGeometry();
    const geometryDispose = jest.spyOn(geometry, "dispose");
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const materialDispose = jest.spyOn(material, "dispose");
    const multiA = new THREE.MeshBasicMaterial();
    const multiB = new THREE.MeshBasicMaterial();
    const multiDispose = [jest.spyOn(multiA, "dispose"), jest.spyOn(multiB, "dispose")];
    const dispose = jest.fn();

    const setup: ThreeStageSetup = ({ scene }) => {
      scene.add(new THREE.Mesh(geometry, material));
      scene.add(new THREE.Mesh(new THREE.BoxGeometry(), [multiA, multiB]));
      scene.add(new THREE.Group()); // no geometry, no material
      return { update: jest.fn(), dispose };
    };

    const { unmount } = render(<ThreeStage setup={setup} />);
    const renderer = lastRenderer();
    const ro = FakeResizeObserver.instances[0];
    const io = FakeIntersectionObserver.instances[0];
    unmount();

    expect(dispose).toHaveBeenCalled();
    expect(geometryDispose).toHaveBeenCalled();
    expect(materialDispose).toHaveBeenCalled();
    expect(textureDispose).toHaveBeenCalled();
    multiDispose.forEach((spy) => expect(spy).toHaveBeenCalled());
    expect(renderer.disposed).toBe(true);
    expect(renderer.contextLost).toBe(true);
    expect(renderer.domElement.parentNode).toBeNull();
    expect(ro.disconnected && io.disconnected).toBe(true);
    expect(frames.pending()).toBe(0);
  });

  it("works with a scene that has no dispose hook, and skips removing a canvas moved elsewhere", () => {
    const setup: ThreeStageSetup = () => ({ update: jest.fn() });
    const { unmount } = render(<ThreeStage setup={setup} />);
    const renderer = lastRenderer();
    const elsewhere = document.createElement("div");
    elsewhere.appendChild(renderer.domElement);
    expect(() => unmount()).not.toThrow();
    expect(renderer.domElement.parentNode).toBe(elsewhere);
    expect(renderers()).toHaveLength(1);
  });

  it("fails loudly when a design token is missing", () => {
    document.documentElement.style.removeProperty("--my-blue");
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ThreeStage setup={trackingSetup().setup} />)).toThrow(
      "Design token --my-blue is not defined.",
    );
  });
});
