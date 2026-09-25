"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Rolling FPS meter for the PORT-003 spike.
 *
 * The caller drives it: call `tick()` once per rendered frame from inside the
 * existing `requestAnimationFrame` loop, so the meter measures the render loop
 * itself rather than a second loop competing with it.
 *
 * `min` deliberately ignores the first second of samples: the very first frames
 * include shader compilation and texture upload, which are startup costs, not
 * steady-state frame times.
 */
export type FpsStats = {
  current: number;
  average: number;
  min: number;
  samples: number;
};

const WARMUP_MS = 1000;
const PUBLISH_INTERVAL_MS = 250;

export function useFpsMeter() {
  const [stats, setStats] = useState<FpsStats>({
    current: 0,
    average: 0,
    min: 0,
    samples: 0,
  });

  const startRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const lastPublishRef = useRef(0);
  const frameCountRef = useRef(0);
  const elapsedRef = useRef(0);
  const minRef = useRef(Number.POSITIVE_INFINITY);
  const currentRef = useRef(0);

  const reset = useCallback(() => {
    startRef.current = null;
    lastFrameRef.current = null;
    lastPublishRef.current = 0;
    frameCountRef.current = 0;
    elapsedRef.current = 0;
    minRef.current = Number.POSITIVE_INFINITY;
    currentRef.current = 0;
    setStats({ current: 0, average: 0, min: 0, samples: 0 });
  }, []);

  const tick = useCallback((now: number) => {
    if (startRef.current === null) {
      startRef.current = now;
      lastFrameRef.current = now;
      lastPublishRef.current = now;
      return;
    }

    const last = lastFrameRef.current ?? now;
    const delta = now - last;
    lastFrameRef.current = now;

    // A zero or negative delta cannot be turned into a frame rate. It happens
    // when two rAF callbacks land in the same millisecond; skip the sample
    // rather than dividing by zero.
    if (delta <= 0) return;

    const instantFps = 1000 / delta;
    currentRef.current = instantFps;

    const sinceStart = now - startRef.current;
    if (sinceStart >= WARMUP_MS) {
      frameCountRef.current += 1;
      elapsedRef.current += delta;
      if (instantFps < minRef.current) minRef.current = instantFps;
    }

    // Publishing to React state on every frame would make React the bottleneck
    // and corrupt the measurement, so publish four times a second.
    if (now - lastPublishRef.current >= PUBLISH_INTERVAL_MS) {
      lastPublishRef.current = now;
      const frames = frameCountRef.current;
      const elapsed = elapsedRef.current;
      setStats({
        current: currentRef.current,
        average: elapsed > 0 ? (frames * 1000) / elapsed : 0,
        min: Number.isFinite(minRef.current) ? minRef.current : 0,
        samples: frames,
      });
    }
  }, []);

  return { stats, tick, reset };
}
