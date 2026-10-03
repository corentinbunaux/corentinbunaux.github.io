import * as THREE from "three";
import { EmbeddedSweepDemo } from "../../../../src/components/demos/EmbeddedSweepDemo";
import { mountStage } from "../../test-utils/stage";
import { frames } from "../../test-utils/browser";
import { findAll } from "../../test-utils/three";

function handles(scene: THREE.Scene) {
  const robot = scene.children.find((c) => c.type === "Group") as THREE.Group;
  const cone = findAll<THREE.Mesh>(robot, (o) => o instanceof THREE.Mesh && o.geometry instanceof THREE.ConeGeometry)[0];
  const obstacle = scene.children.find(
    (c) => c instanceof THREE.Mesh && c.geometry instanceof THREE.CylinderGeometry,
  ) as THREE.Mesh;
  return { robot, coneMaterial: cone.material as THREE.MeshBasicMaterial, obstacle };
}

describe("EmbeddedSweepDemo", () => {
  it("sweeps, detects the obstacle, drives at it, pauses, backs off and sweeps again", () => {
    const { scene } = mountStage(<EmbeddedSweepDemo />);
    const { robot, coneMaterial, obstacle } = handles(scene);
    const blue = new THREE.Color("#a7bcc7");
    const green = new THREE.Color("#81a3a7");

    // Sweeping in place: heading changes, position does not, cone is blue.
    expect(robot.position.length()).toBe(0);
    expect(coneMaterial.color.equals(blue)).toBe(true);
    const heading0 = robot.rotation.y;
    frames.step(100);
    expect(robot.rotation.y).not.toBe(heading0);

    // Run until the robot starts moving: the obstacle entered the sensor cone.
    let steps = 0;
    while (robot.position.length() === 0 && steps < 100) {
      frames.step(100);
      steps++;
    }
    expect(steps).toBeLessThan(100);
    expect(coneMaterial.color.equals(green)).toBe(true);
    const heading = robot.rotation.y;
    // The heading points at the obstacle (within the 12 deg sensor half-angle).
    const bearing = Math.atan2(obstacle.position.x, obstacle.position.z);
    expect(Math.abs(heading - bearing)).toBeLessThan((12 * Math.PI) / 180);

    // Approach, pause, retreat: one straight line along the stopped heading,
    // never closer than the standoff, until the robot is home again.
    let maxDistance = 0;
    const trace: number[] = [];
    for (let i = 0; i < 80; i++) {
      frames.step(100);
      const d = robot.position.length();
      trace.push(d);
      if (d === 0) break;
      maxDistance = Math.max(maxDistance, d);
      expect(robot.rotation.y).toBe(heading);
      expect(robot.position.x / d).toBeCloseTo(Math.sin(heading));
    }
    const distanceToObstacle = obstacle.position.length();
    expect(maxDistance).toBeGreaterThan(0.5);
    expect(maxDistance).toBeLessThan(distanceToObstacle - 0.5);
    // The pause: the same max distance held for several frames.
    expect(trace.filter((d) => d === maxDistance).length).toBeGreaterThan(3);
    // Home again, back to the sweep with a blue cone.
    expect(trace[trace.length - 1]).toBe(0);
    expect(coneMaterial.color.equals(blue)).toBe(true);
  });

  it("rolls the wheels while driving", () => {
    const { scene } = mountStage(<EmbeddedSweepDemo />);
    const { robot } = handles(scene);
    const wheel = robot.children.find(
      (c) => c instanceof THREE.Mesh && c.geometry instanceof THREE.CylinderGeometry,
    ) as THREE.Mesh;
    let steps = 0;
    while (robot.position.length() === 0 && steps < 100) {
      frames.step(100);
      steps++;
    }
    frames.step(100);
    expect(wheel.rotation.x).toBeCloseTo(robot.position.length() / 0.16);
  });
});
