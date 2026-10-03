"use client";

import { useEffect, useRef, useState } from "react";
import type { SVGProps } from "react";
import { Flag } from "lucide-react";
import { useTheme } from "../../theme/ThemeContext";
import { useTranslation } from "../../i18n/dictionary";
import {
  COLS,
  MINES,
  emptyBoard,
  isWon,
  placeMines,
  reveal,
  revealAllMines,
  toggleFlag,
  type Board,
  type GameStatus,
} from "./minesweeperLogic";

const LONG_PRESS_MS = 450;

/** Classic minesweeper number colours — one set per theme, both verified at
 * >=5:1 contrast against --surface. Not a design-token violation: this is a
 * universally recognised game convention, the same documented exception as
 * the tennis player's skin tone or the jaw demo's teeth. */
const NUMBER_COLORS: Record<"dark" | "light", Record<number, string>> = {
  dark: { 1: "#5b9bff", 2: "#6fcf6f", 3: "#ff6b6b", 4: "#8f7bff", 5: "#e08a4f", 6: "#5fd0d0", 7: "#e6e6e6", 8: "#9a9a9a" },
  light: { 1: "#1857c4", 2: "#1f7d1f", 3: "#c62828", 4: "#3a2fa0", 5: "#8a3b17", 6: "#0f7a7a", 7: "#1a1a1a", 8: "#5c5c5c" },
};

function MineIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      {[0, 45, 90, 135].map((deg) => (
        <rect key={deg} x="11" y="2" width="2" height="20" rx="1" transform={`rotate(${deg} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="7" />
      <circle cx="9.5" cy="9.5" r="1.6" fill="var(--surface)" fillOpacity="0.6" />
    </svg>
  );
}

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));
}

export function MinesweeperDemo() {
  const t = useTranslation();
  const { theme } = useTheme();
  const [board, setBoard] = useState<Board>(emptyBoard());
  const [status, setStatus] = useState<GameStatus>("ready");
  const [flagMode, setFlagMode] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [explodedIndex, setExplodedIndex] = useState<number | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const longPressFired = useRef(false);

  useEffect(() => {
    if (status !== "playing" || startedAt === null) return;
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
    return () => window.clearInterval(id);
  }, [status, startedAt]);

  const finished = status === "won" || status === "lost";
  const flags = board.filter((cell) => cell.flagged).length;

  const newGame = () => {
    setBoard(emptyBoard());
    setStatus("ready");
    setStartedAt(null);
    setElapsed(0);
    setExplodedIndex(null);
  };

  const flagAt = (index: number) => {
    if (finished) return;
    setBoard((current) => toggleFlag(current, index));
  };

  const revealAt = (index: number) => {
    if (finished || board[index].flagged) return;
    let current = board;
    if (status === "ready") {
      current = placeMines(current, index);
      // eslint-disable-next-line react-hooks/purity -- Date.now() is called in event handler, not during render
      const now = Date.now();
      setStartedAt(now);
      setStatus("playing");
    }
    const next = reveal(current, index);
    if (next[index].mine) {
      setExplodedIndex(index);
      setBoard(revealAllMines(next));
      setStatus("lost");
      return;
    }
    setBoard(next);
    if (isWon(next)) setStatus("won");
  };

  const onCellClick = (index: number) => {
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    if (flagMode) flagAt(index);
    else revealAt(index);
  };

  const startLongPress = (index: number, pointerType: string) => {
    if (pointerType !== "touch") return;
    longPressFired.current = false;
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      flagAt(index);
    }, LONG_PRESS_MS);
  };
  const cancelLongPress = () => {
    if (longPressTimer.current !== null) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  };

  return (
    <div className="mx-auto flex w-fit flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between gap-4 text-sm text-main-text">
        <span>
          {t.minesweeper.minesLeft} : <strong className="tabular-nums">{MINES - flags}</strong>
        </span>
        <span>
          {t.minesweeper.time} : <strong className="tabular-nums">{elapsed} s</strong>
        </span>
      </div>

      <div
        role="grid"
        aria-label={t.minesweeper.gridLabel}
        className="grid gap-0.5 rounded-lg bg-second p-0.5"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {board.map((cell, index) => {
          const row = Math.floor(index / COLS) + 1;
          const col = (index % COLS) + 1;
          const label = cell.flagged
            ? fill(t.minesweeper.cellFlagged, { row, col })
            : !cell.revealed
              ? fill(t.minesweeper.cellHidden, { row, col })
              : cell.mine
                ? fill(t.minesweeper.cellMine, { row, col })
                : fill(t.minesweeper.cellEmpty, { row, col, count: cell.adjacent });
          return (
            <button
              key={index}
              type="button"
              role="gridcell"
              aria-label={label}
              disabled={finished && !cell.mine}
              onClick={() => onCellClick(index)}
              onContextMenu={(event) => {
                event.preventDefault();
                flagAt(index);
              }}
              onKeyDown={(event) => {
                if (event.key === "f" || event.key === "F") {
                  event.preventDefault();
                  flagAt(index);
                }
              }}
              onPointerDown={(event) => startLongPress(index, event.pointerType)}
              onPointerUp={cancelLongPress}
              onPointerLeave={cancelLongPress}
              // Mobile overflow fix (found by PORT-069's E2E): column 9 stuck
              // out of the grid by 4-8px at 360-390px wide. Two causes:
              // - app.css gives every <button> `margin: 0 0.5rem` under 768px,
              //   shifting each cell 8px right inside its track -> `m-0`;
              // - fixed 2rem cells don't fit a 360px screen. Below `sm`, a
              //   cell is at most 2rem but shrinks so 9 always fit: 86px =
              //   page gutters (2x16) + frame padding (2x16) + frame border
              //   (2) + grid padding (4) + 8 gaps (16).
              className={`m-0 flex h-[min(2rem,calc((100vw_-_86px)/9))] w-[min(2rem,calc((100vw_-_86px)/9))] select-none items-center justify-center text-sm font-bold sm:h-9 sm:w-9 border-t border-l border-b border-r ${
                cell.revealed
                  ? cell.mine
                    ? index === explodedIndex
                      ? "bg-[#c62828] text-white border-transparent"
                      : "bg-my-green text-main border-transparent"
                    : "bg-surface text-main-text border-transparent"
                  : `bg-surface-raised hover:bg-surface border-t-[color:var(--main-text)]/20 border-l-[color:var(--main-text)]/20 border-b-[color:var(--main)]/40 border-r-[color:var(--main)]/40 ${
                      cell.flagged ? "text-my-blue" : "text-my-green"
                    }`
              }`}
            >
              {cell.flagged && !cell.revealed && <Flag aria-hidden="true" className="h-4 w-4" />}
              {cell.revealed && cell.mine && <MineIcon aria-hidden="true" className="h-4 w-4" />}
              {cell.revealed && !cell.mine && cell.adjacent > 0 && (
                <span style={{ color: NUMBER_COLORS[theme][cell.adjacent] }}>{cell.adjacent}</span>
              )}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="min-h-[1.5rem] text-sm font-semibold text-main-text">
        {status === "won" && fill(t.minesweeper.won, { seconds: elapsed })}
        {status === "lost" && t.minesweeper.lost}
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          aria-pressed={flagMode}
          onClick={() => setFlagMode((value) => !value)}
          className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm ${
            flagMode ? "border-my-green bg-my-green text-main" : "border-second text-main-text"
          }`}
        >
          <Flag aria-hidden="true" className="h-4 w-4" />
          {t.minesweeper.flagMode}
        </button>
        <button
          type="button"
          onClick={newGame}
          className="rounded-full border border-second px-4 py-1.5 text-sm text-main-text hover:bg-surface-raised"
        >
          {t.minesweeper.newGame}
        </button>
      </div>
    </div>
  );
}
