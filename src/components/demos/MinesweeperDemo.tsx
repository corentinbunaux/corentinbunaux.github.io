"use client";

import { useEffect, useRef, useState } from "react";
import { Bomb, Flag } from "lucide-react";
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

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));
}

export function MinesweeperDemo() {
  const t = useTranslation();
  const [board, setBoard] = useState<Board>(emptyBoard());
  const [status, setStatus] = useState<GameStatus>("ready");
  const [flagMode, setFlagMode] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
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
              className={`flex h-8 w-8 select-none items-center justify-center text-sm font-bold sm:h-9 sm:w-9 ${
                cell.revealed
                  ? cell.mine
                    ? "bg-my-green text-main"
                    : "bg-surface text-main-text"
                  : "bg-surface-raised text-my-green hover:bg-surface"
              }`}
            >
              {cell.flagged && !cell.revealed && <Flag aria-hidden="true" className="h-4 w-4" />}
              {cell.revealed && cell.mine && <Bomb aria-hidden="true" className="h-4 w-4" />}
              {cell.revealed && !cell.mine && cell.adjacent > 0 && cell.adjacent}
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
