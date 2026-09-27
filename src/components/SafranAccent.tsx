"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { readThemeColors } from "../theme/useThemeColors";

/**
 * Contextual 3D accent for the Safran project page (PORT-020): a wireframe
 * hub with small satellites orbiting it at different radii and speeds,
 * evoking Safran's aerospace domain. Same rendering approach as
 * `HeroMesh.tsx` (plain three.js, no @react-three/fiber) for consistency
 * and to keep the bundle-size story simple across every accent on the site.
 *
 * Assumes its caller has already gated on viewport/reduced-motion
 * (`useDesktopMotionGate`) - this component does not re-check either.
 */
const SATELLITE_COUNT = 3;
const HUB_RADIUS = 0.9;
const MAX_PIXEL_RATIO = 2;

export function SafranAccent() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const colors = readThemeColors();
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
    camera.position.set(0, 0.6, 4.2);
    camera.lookAt(0, 0, 0);

    const hub = new THREE.Mesh(
      new THREE.SphereGeometry(HUB_RADIUS, 16, 12),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(colors.blue),
        wireframe: true,
        transparent: true,
        opacity: 0.6,
      }),
    );
    scene.add(hub);

    const satellites = Array.from({ length: SATELLITE_COUNT }, (_, i) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 12, 8),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(colors.green) }),
      );
      scene.add(mesh);
      return {
        mesh,
        radius: HUB_RADIUS + 0.5 + i * 0.35,
        speed: 0.4 - i * 0.08,
        tilt: (i * Math.PI) / SATELLITE_COUNT / 1.5,
        phase: (i * Math.PI * 2) / SATELLITE_COUNT,
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
      hub.rotation.y = time * 0.15;

      for (const sat of satellites) {
        const angle = time * sat.speed + sat.phase;
        sat.mesh.position.set(
          Math.cos(angle) * sat.radius,
          Math.sin(angle * 0.7) * sat.radius * Math.sin(sat.tilt),
          Math.sin(angle) * sat.radius,
        );
      }

      renderer.render(scene, camera);
    };
    frameId = window.requestAnimationFrame(renderFrame);

    return () => {
      running = false;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);

      scene.remove(hub);
      hub.geometry.dispose();
      (hub.material as THREE.Material).dispose();
      for (const sat of satellites) {
        scene.remove(sat.mesh);
        sat.mesh.geometry.dispose();
        (sat.mesh.material as THREE.Material).dispose();
      }
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
