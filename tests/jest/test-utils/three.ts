/**
 * Helpers for the three.js component tests. `three` is replaced by
 * `__mocks__/three.ts` (real three.js except WebGLRenderer). Excluded from
 * coverage (jest.config.mjs).
 */
import * as THREE from "three";
import type { FakeWebGLRenderer } from "../../../__mocks__/three";
import { frames } from "./browser";

type FakeRendererClass = typeof FakeWebGLRenderer;

export function fakeRendererClass(): FakeRendererClass {
  // The manual mock is what `import "three"` resolves to; jest.requireMock()
  // would hand back a separate instance from the mock registry.
  return (THREE as unknown as { FakeWebGLRenderer: FakeRendererClass }).FakeWebGLRenderer;
}

export function resetRenderers() {
  fakeRendererClass().instances.length = 0;
}

export function renderers(): FakeWebGLRenderer[] {
  return fakeRendererClass().instances;
}

export function lastRenderer(): FakeWebGLRenderer {
  const all = renderers();
  if (all.length === 0) throw new Error("No WebGLRenderer was created.");
  return all[all.length - 1];
}

/** Scene and camera of the latest rendered frame. */
export function lastFrame(renderer: FakeWebGLRenderer = lastRenderer()) {
  const frame = renderer.renders[renderer.renders.length - 1];
  if (!frame) throw new Error("Nothing has been rendered yet.");
  return frame as { scene: THREE.Scene; camera: THREE.PerspectiveCamera };
}

/** ThreeStage clamps each frame's delta to 0.1 s: advance `seconds` of
 * animation time in 100 ms frames. */
export function advanceSeconds(seconds: number) {
  frames.run(Math.round(seconds * 10), 100);
}

/** Gives every element a non-zero layout box (jsdom lays nothing out). */
export function fakeLayout(width = 400, height = 300) {
  const spies = [
    jest.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(width),
    jest.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(height),
    jest.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      width,
      height,
      toJSON: () => ({}),
    } as DOMRect),
  ];
  return { width, height, restore: () => spies.forEach((s) => s.mockRestore()) };
}

/** Client coordinates (in a `width` x `height` box at 0,0) of a world point. */
export function toClient(point: THREE.Vector3, camera: THREE.Camera, width = 400, height = 300) {
  camera.updateMatrixWorld(true);
  const ndc = point.clone().project(camera);
  return { clientX: ((ndc.x + 1) / 2) * width, clientY: ((1 - ndc.y) / 2) * height };
}

export function findAll<T extends THREE.Object3D>(root: THREE.Object3D, predicate: (o: THREE.Object3D) => boolean): T[] {
  const found: T[] = [];
  root.traverse((o) => {
    if (predicate(o)) found.push(o as T);
  });
  return found;
}

/** Fires a PointerEvent (jsdom may lack the constructor: falls back to MouseEvent + fields). */
export function pointer(
  target: EventTarget,
  type: string,
  init: { clientX?: number; clientY?: number; pointerId?: number; button?: number; pointerType?: string } = {},
) {
  const { pointerId = 1, pointerType = "mouse", ...rest } = init;
  const Ctor = (typeof window.PointerEvent === "function" ? window.PointerEvent : window.MouseEvent) as typeof MouseEvent;
  const event = new Ctor(type, { bubbles: true, cancelable: true, button: 0, ...rest });
  Object.defineProperty(event, "pointerId", { value: pointerId });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  target.dispatchEvent(event);
  return event;
}
