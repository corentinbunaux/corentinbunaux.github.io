"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { readThemeColors, type ThemeColors } from "../../theme/useThemeColors";

const MAX_PIXEL_RATIO = 2;
/** Clamp for the per-frame delta, so a long pause does not teleport objects. */
const MAX_DELTA_SECONDS = 0.1;

export interface ThreeStageContext {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  /** The element the canvas lives in (for pointer listeners). */
  readonly container: HTMLDivElement;
  /** Design tokens resolved for the current theme (the stage remounts on theme change). */
  readonly colors: ThemeColors;
}

export interface ThreeStageScene {
  /** Called once per rendered frame, in seconds. `elapsed` does not advance
   * while the stage is scrolled out of view (rendering is paused). */
  update(elapsed: number, delta: number): void;
  /** Extra cleanup: event listeners, controls. Geometries, materials and
   * textures reachable from `scene` are disposed by the stage itself. */
  dispose?(): void;
}

/** Builds the scene. Must be a stable reference (module-level function). */
export type ThreeStageSetup = (context: ThreeStageContext) => ThreeStageScene;

export interface ThreeStageProps {
  setup: ThreeStageSetup;
  fov?: number;
  className?: string;
}

/**
 * Shared renderer/camera/loop for every 3D demo (PORT-031): sizes to its
 * container, pauses when off-screen, disposes everything on unmount.
 * Does NOT gate on viewport/reduced motion — DemoSection does that.
 */
export function ThreeStage({ setup, fov = 45, className = "h-full w-full" }: ThreeStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const colors = readThemeColors();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      fov,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      200,
    );
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0, 0);

    const stage = setup({ scene, camera, renderer, container, colors });

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let visible = true;
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersectionObserver.observe(container);

    let elapsed = 0;
    let last = performance.now();
    let frameId = 0;
    const loop = (now: number) => {
      frameId = window.requestAnimationFrame(loop);
      const delta = Math.min((now - last) / 1000, MAX_DELTA_SECONDS);
      last = now;
      if (!visible) return;
      elapsed += delta;
      stage.update(elapsed, delta);
      renderer.render(scene, camera);
    };
    frameId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      stage.dispose?.();
      scene.traverse((object) => {
        const { geometry, material } = object as THREE.Mesh;
        geometry?.dispose();
        const materials = Array.isArray(material) ? material : material ? [material] : [];
        for (const item of materials) {
          for (const value of Object.values(item)) {
            if (value instanceof THREE.Texture) value.dispose();
          }
          item.dispose();
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [setup, fov]);

  return <div ref={containerRef} className={className} />;
}
