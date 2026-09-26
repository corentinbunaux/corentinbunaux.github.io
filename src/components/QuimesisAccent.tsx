"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Contextual 3D accent for the Quimesis project page (PORT-020): a loose
 * cluster of separated wireframe fragments, each rotating independently,
 * evoking 3D segmentation (the real project used VTK.js to segment teeth
 * from a scan).
 *
 * **Deviation from the original arbitrage, documented in PORT-020's
 * ticket**: this uses three.js, not `@kitware/vtk.js`. VTK.js needs real
 * volumetric/mesh scan data to render anything meaningful, and this repo has
 * none - building one from scratch for a purely decorative accent, on a
 * ~14 MB library never used here before, was judged too much risk for too
 * little payoff in this session. Reusing three.js keeps the bundle-size
 * story identical to the hero and Safran accents (one library, already
 * proven) instead of adding a second, much heavier one for a single page.
 */
const FRAGMENT_COUNT = 7;
const MAX_PIXEL_RATIO = 2;

export function QuimesisAccent() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0.3, 4.5);
    camera.lookAt(0, 0, 0);

    const material = new THREE.MeshBasicMaterial({
      color: 0x81a3a7,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });

    // Fragments laid out on a loose arc (evokes a segmented row rather than
    // a random cloud), each with its own slow spin so no two read as copies.
    const fragments = Array.from({ length: FRAGMENT_COUNT }, (_, i) => {
      const t = i / (FRAGMENT_COUNT - 1) - 0.5; // -0.5..0.5
      const geometry = new THREE.TetrahedronGeometry(0.32 + (i % 2) * 0.08, 0);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(t * 2.6, Math.sin(t * Math.PI) * 0.5, -Math.abs(t) * 0.4);
      scene.add(mesh);
      return {
        mesh,
        spinSpeed: 0.2 + (i % 3) * 0.1,
        bobPhase: i,
      };
    });

    const handleResize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    let frameId = 0;
    let running = true;

    const renderFrame = (now: number) => {
      if (!running) return;
      frameId = window.requestAnimationFrame(renderFrame);

      const time = now * 0.001;
      for (const frag of fragments) {
        frag.mesh.rotation.x = time * frag.spinSpeed;
        frag.mesh.rotation.y = time * frag.spinSpeed * 0.7;
        frag.mesh.position.y += Math.sin(time + frag.bobPhase) * 0.0006;
      }

      renderer.render(scene, camera);
    };
    frameId = window.requestAnimationFrame(renderFrame);

    return () => {
      running = false;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);

      for (const frag of fragments) {
        scene.remove(frag.mesh);
        frag.mesh.geometry.dispose();
      }
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
