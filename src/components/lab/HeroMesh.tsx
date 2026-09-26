"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * PORT-003 spike — cursor-reactive mesh for the hero (Canva mockup, zone 1).
 *
 * Deliberately plain three.js, no @react-three/fiber: the point of the spike is
 * to measure the floor cost of three.js itself, not that of a React renderer on
 * top of it.
 *
 * This component assumes its caller has already decided it should run (viewport
 * >= 1024px, no `prefers-reduced-motion`). It does not re-check that itself, so
 * that the module is never even imported when the guard says no.
 */

type HeroMeshProps = {
  /** Called once per rendered frame with the rAF timestamp, to drive the FPS meter. */
  onFrame?: (now: number) => void;
};

/** Grid resolution. 64x64 gives 4225 vertices and ~8192 triangles. */
const SEGMENTS = 64;
const PLANE_SIZE = 10;
/** Retina displays quadruple the pixel count for no visible gain past 2x. */
const MAX_PIXEL_RATIO = 2;
const INFLUENCE_RADIUS = 3.2;
const PEAK_HEIGHT = 1.35;

export function HeroMesh({ onFrame }: HeroMeshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Kept in a ref so the rAF loop reads the latest callback without restarting.
  const onFrameRef = useRef(onFrame);

  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 5.5, 7.5);
    camera.lookAt(0, 0, 0);

    const geometry = new THREE.PlaneGeometry(
      PLANE_SIZE,
      PLANE_SIZE,
      SEGMENTS,
      SEGMENTS,
    );
    geometry.rotateX(-Math.PI / 2);

    // Snapshot the rest positions once; every frame recomputes displacement
    // from this baseline instead of accumulating drift.
    const position = geometry.attributes.position as THREE.BufferAttribute;
    const restPositions = Float32Array.from(position.array);
    const vertexCount = position.count;

    // A wireframe material draws the triangle edges straight from this same
    // geometry, so the displaced vertices need no second buffer to stay in sync.
    const meshMaterial = new THREE.MeshBasicMaterial({
      color: 0x4f8cff,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const mesh = new THREE.Mesh(geometry, meshMaterial);
    scene.add(mesh);

    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x9ec5ff,
      size: 0.045,
    });
    const points = new THREE.Points(geometry, pointsMaterial);
    scene.add(points);

    // Cursor position projected onto the plane, in world units.
    const cursor = new THREE.Vector2(0, 0);
    const targetCursor = new THREE.Vector2(0, 0);

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      targetCursor.set((nx * PLANE_SIZE) / 2, (ny * PLANE_SIZE) / 2);
    };

    const handleResize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    container.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("resize", handleResize);

    let frameId = 0;
    let running = true;

    const renderFrame = (now: number) => {
      if (!running) return;
      frameId = window.requestAnimationFrame(renderFrame);

      // Ease the cursor so a fast flick produces a wave, not a jump.
      cursor.lerp(targetCursor, 0.12);

      const time = now * 0.001;
      const array = position.array as Float32Array;

      for (let i = 0; i < vertexCount; i += 1) {
        const offset = i * 3;
        const x = restPositions[offset];
        const z = restPositions[offset + 2];

        const dx = x - cursor.x;
        const dz = z - cursor.y;
        const distance = Math.sqrt(dx * dx + dz * dz);

        // Cursor bump: a cosine falloff, zero outside the influence radius.
        const falloff =
          distance < INFLUENCE_RADIUS
            ? 0.5 * (1 + Math.cos((distance / INFLUENCE_RADIUS) * Math.PI))
            : 0;
        const bump = falloff * PEAK_HEIGHT;

        // Ambient swell so the mesh is alive even when the cursor is still.
        const swell = Math.sin(x * 0.6 + time) * Math.cos(z * 0.6 + time) * 0.12;

        array[offset + 1] = bump + swell;
      }

      position.needsUpdate = true;

      renderer.render(scene, camera);
      onFrameRef.current?.(now);
    };

    frameId = window.requestAnimationFrame(renderFrame);

    return () => {
      running = false;
      window.cancelAnimationFrame(frameId);
      container.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);

      scene.remove(mesh);
      scene.remove(points);
      geometry.dispose();
      meshMaterial.dispose();
      pointsMaterial.dispose();
      renderer.dispose();
      // forceContextLoss releases the GPU context immediately instead of
      // waiting for GC; without it, repeated navigation exhausts the browser's
      // WebGL context budget.
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
