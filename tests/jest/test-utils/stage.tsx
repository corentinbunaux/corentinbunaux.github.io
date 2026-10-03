/**
 * Mounts a ThreeStage-based demo the way DemoSection does (inside the theme
 * and language providers, with the design tokens defined) and returns handles
 * on what the stage created. Excluded from coverage (jest.config.mjs).
 */
import type { ReactElement } from "react";
import type * as THREE from "three";
import { frames } from "./browser";
import { renderWithProviders } from "./render";
import { fakeLayout, lastFrame, lastRenderer, resetRenderers } from "./three";

export function mountStage(ui: ReactElement, { theme = "dark" as "dark" | "light", width = 400, height = 300 } = {}) {
  resetRenderers();
  fakeLayout(width, height);
  const view = renderWithProviders(ui, { theme });
  const renderer = lastRenderer();
  frames.step(100); // first frame: elapsed = 0.1 s
  const { scene, camera } = lastFrame(renderer);
  const container = renderer.domElement.parentElement as HTMLDivElement;
  return { ...view, renderer, scene: scene as THREE.Scene, camera, container, canvas: renderer.domElement };
}
