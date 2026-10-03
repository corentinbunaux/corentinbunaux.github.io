"use client";

import { useMemo, useState } from "react";
import { Eye, Target } from "lucide-react";
import { useTranslation } from "../../i18n/dictionary";
import { CELL_COUNT, SIZE, TARGETS, coveredBy, kindAt, optimalGuards } from "./guardsLogic";

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));
}

export function GuardsDemo() {
  const t = useTranslation();
  const [guards, setGuards] = useState<ReadonlySet<number>>(new Set());
  const [showSolution, setShowSolution] = useState(false);
  const optimum = useMemo(() => optimalGuards(), []);

  const displayed = showSolution ? new Set(optimum) : guards;
  const covered = coveredBy(displayed);
  const coveredTargets = TARGETS.filter((i) => covered.has(i)).length;
  const allCovered = coveredTargets === TARGETS.length;

  const toggle = (index: number) => {
    if (showSolution || kindAt(index) === "wall") return;
    setGuards((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="mx-auto flex w-fit flex-col items-center gap-4">
      <div className="flex w-full flex-wrap justify-between gap-4 text-sm text-main-text">
        <span>
          {t.guards.guardsCount} : <strong className="tabular-nums">{displayed.size}</strong>
        </span>
        <span>
          {t.guards.targetsCovered} :{" "}
          <strong className="tabular-nums">
            {coveredTargets} / {TARGETS.length}
          </strong>
        </span>
      </div>

      <div
        role="grid"
        aria-label={t.guards.gridLabel}
        className="grid gap-0.5 rounded-lg bg-second p-0.5"
        style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: CELL_COUNT }, (_, index) => {
          const kind = kindAt(index);
          const hasGuard = displayed.has(index);
          const isCovered = covered.has(index);
          const kindLabel =
            kind === "wall" ? t.guards.kindWall : kind === "target" ? t.guards.kindTarget : t.guards.kindEmpty;
          const label =
            fill(t.guards.cellLabel, { row: Math.floor(index / SIZE) + 1, col: (index % SIZE) + 1, kind: kindLabel }) +
            (hasGuard ? t.guards.withGuard : "") +
            (kind === "target" && isCovered ? t.guards.covered : "");

          let className = "bg-surface-raised text-my-green hover:bg-surface";
          if (kind === "wall") className = "bg-main-text";
          else if (hasGuard) className = "bg-my-blue text-main";
          else if (kind === "target" && isCovered) className = "bg-my-green text-main";
          else if (isCovered) className = "bg-surface text-my-blue";

          return (
            <button
              key={index}
              type="button"
              role="gridcell"
              aria-label={label}
              aria-selected={kind === "wall" ? undefined : hasGuard}
              disabled={kind === "wall"}
              onClick={() => toggle(index)}
              // Mobile overflow fix (PORT-069 E2E): column 10 stuck out of the
              // grid at 360-390px. `m-0` cancels app.css's `button { margin:
              // 0 0.5rem }` under 768px; below `sm` a cell shrinks so 10 fit:
              // 88px = gutters (32) + frame padding (32) + border (2) + grid
              // padding (4) + 9 gaps (18).
              className={`m-0 flex h-[min(1.75rem,calc((100vw_-_88px)/10))] w-[min(1.75rem,calc((100vw_-_88px)/10))] items-center justify-center sm:h-9 sm:w-9 ${className}`}
            >
              {hasGuard && <Eye aria-hidden="true" className="h-4 w-4" />}
              {!hasGuard && kind === "target" && <Target aria-hidden="true" className="h-4 w-4" />}
              {!hasGuard && kind === "empty" && isCovered && <span aria-hidden="true">·</span>}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="min-h-[1.5rem] text-center text-sm font-semibold text-main-text">
        {allCovered &&
          (displayed.size === optimum.length
            ? fill(t.guards.optimalReached, { best: optimum.length })
            : fill(t.guards.allCovered, { count: displayed.size, best: optimum.length }))}
      </p>

      <ul className="flex gap-4 text-xs text-second-text" aria-hidden="true">
        <li className="flex items-center gap-1"><span className="inline-block h-3 w-3 bg-main-text" />{t.guards.legendWall}</li>
        <li className="flex items-center gap-1"><Target className="h-3 w-3 text-my-green" />{t.guards.legendTarget}</li>
        <li className="flex items-center gap-1"><Eye className="h-3 w-3 text-my-blue" />{t.guards.legendGuard}</li>
      </ul>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          aria-pressed={showSolution}
          onClick={() => setShowSolution((value) => !value)}
          className="rounded-full border border-second px-4 py-1.5 text-sm text-main-text hover:bg-surface-raised"
        >
          {showSolution ? t.guards.hideSolution : t.guards.showSolution}
        </button>
        <button
          type="button"
          onClick={() => {
            setGuards(new Set());
            setShowSolution(false);
          }}
          className="rounded-full border border-second px-4 py-1.5 text-sm text-main-text hover:bg-surface-raised"
        >
          {t.guards.reset}
        </button>
      </div>
    </div>
  );
}
