"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "../../i18n/dictionary";

/** Fictional line: station name and distance from A in km. */
const STATIONS = [
  { name: "A", km: 0 },
  { name: "B", km: 18 },
  { name: "C", km: 35 },
  { name: "D", km: 60 },
  { name: "E", km: 78 },
  { name: "F", km: 100 },
] as const;

type Point = readonly [minutes: number, stationIndex: number];

/** Each train: [time, station] points; two consecutive points at the same station are a stop. */
const TRAINS: readonly { id: string; stopping: boolean; points: readonly Point[] }[] = [
  { id: "1", stopping: true, points: [[0, 0], [14, 1], [16, 1], [29, 2], [31, 2], [50, 3], [52, 3], [65, 4], [67, 4], [84, 5]] },
  { id: "2", stopping: false, points: [[20, 0], [70, 5]] },
  { id: "3", stopping: true, points: [[10, 5], [40, 3], [42, 3], [72, 1], [74, 1], [90, 0]] },
  { id: "4", stopping: true, points: [[45, 0], [59, 1], [61, 1], [74, 2], [76, 2], [95, 3], [97, 3], [110, 4], [112, 4], [118, 5]] },
  { id: "5", stopping: false, points: [[60, 5], [108, 0]] },
];

const DURATION_MIN = 120;
const SWEEP_MS = 12000;
const HOLD_MS = 2000;

const W = 640;
const H = 360;
const LEFT = 48;
const RIGHT = 16;
const TOP = 16;
const BOTTOM = 40;

const x = (minutes: number) => LEFT + (minutes / DURATION_MIN) * (W - LEFT - RIGHT);
const y = (stationIndex: number) => TOP + (STATIONS[stationIndex].km / 100) * (H - TOP - BOTTOM);

/** The part of a train's path up to `now`, plus its current position if it is running. */
function clip(points: readonly Point[], now: number): { path: [number, number][]; head: [number, number] | null } {
  const path: [number, number][] = [];
  for (let i = 0; i < points.length; i++) {
    const [t, s] = points[i];
    if (t <= now) {
      path.push([x(t), y(s)]);
      continue;
    }
    if (i > 0) {
      const [t0, s0] = points[i - 1];
      const ratio = (now - t0) / (t - t0);
      const head: [number, number] = [x(now), y(s0) + (y(s) - y(s0)) * ratio];
      path.push(head);
      return { path, head };
    }
    return { path, head: null };
  }
  return { path, head: null };
}

function useSweep(): number {
  const [now, setNow] = useState(DURATION_MIN);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const start = performance.now();
    const tick = (time: number) => {
      const cycle = (time - start) % (SWEEP_MS + HOLD_MS);
      setNow(Math.min(cycle / SWEEP_MS, 1) * DURATION_MIN);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  return now;
}

export function SpaceTimeDemo() {
  const t = useTranslation();
  const now = useSweep();
  const colors = ["var(--my-green)", "var(--my-blue)"];

  return (
    <figure className="mx-auto max-w-3xl">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.demos.spaceTime.chartLabel} className="h-auto w-full">
        {STATIONS.map((station, i) => (
          <g key={station.name}>
            <line x1={LEFT} x2={W - RIGHT} y1={y(i)} y2={y(i)} stroke="var(--border)" strokeWidth={1} />
            <text x={LEFT - 12} y={y(i) + 4} textAnchor="end" fontSize={13} fill="var(--second-text)">
              {station.name}
            </text>
          </g>
        ))}
        {[0, 20, 40, 60, 80, 100, 120].map((minutes) => (
          <g key={minutes}>
            <line x1={x(minutes)} x2={x(minutes)} y1={TOP} y2={H - BOTTOM} stroke="var(--border)" strokeWidth={1} strokeDasharray="2 4" />
            <text x={x(minutes)} y={H - BOTTOM + 18} textAnchor="middle" fontSize={12} fill="var(--second-text)">
              {minutes} {t.demos.spaceTime.timeAxis}
            </text>
          </g>
        ))}
        {TRAINS.map((train) => {
          const { path, head } = clip(train.points, now);
          const color = train.stopping ? colors[0] : colors[1];
          return (
            <g key={train.id}>
              {path.length > 1 && (
                <polyline
                  points={path.map(([px, py]) => `${px},${py}`).join(" ")}
                  fill="none"
                  stroke={color}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeDasharray={train.stopping ? undefined : "8 4"}
                />
              )}
              {head && <circle cx={head[0]} cy={head[1]} r={5} fill={color} />}
            </g>
          );
        })}
        {now < DURATION_MIN && (
          <line x1={x(now)} x2={x(now)} y1={TOP} y2={H - BOTTOM} stroke="var(--main-text)" strokeOpacity={0.4} strokeWidth={1} />
        )}
      </svg>
      <ul className="mt-2 flex flex-wrap justify-center gap-6 text-xs text-second-text" aria-hidden="true">
        <li className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-6 bg-my-green" />
          {t.demos.spaceTime.stopping}
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-6 border-t-2 border-dashed border-my-blue" />
          {t.demos.spaceTime.nonStop}
        </li>
      </ul>
    </figure>
  );
}
