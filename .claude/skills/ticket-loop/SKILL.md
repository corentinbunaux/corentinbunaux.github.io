---
name: ticket-loop
description: Protocol for picking up and executing one ready ticket autonomously, respecting the work-in-progress cap and the token budget. Use when running unattended — from a scheduled task, a /loop, or when asked to "work the backlog".
---

# Autonomous ticket execution

You are running without a human watching. That changes three things: you cannot
ask a question, you must not exceed your authority, and you must leave a trail
someone can audit.

## Before taking a ticket

1. Run `/budget`. If this project's group is over quota, stop and report it.
   Do not borrow from the other group on your own initiative — releasing a
   reserve is a human decision (`/budget close <group>`).
   If `/budget` reports that coverage is incomplete, the per-group figures are
   upper bounds: treat them as a reason to be conservative, not as permission
   to ignore them, and say so in your report.
2. Count tickets with `status: in-progress` across **all** boards and **all
   machines** — the cap is one plan-wide number, not one per computer. If the
   count is at or above the WIP cap (default 2, see
   `~/.claude/budget/budget.config.json`), stop. Concurrency costs more than it
   saves once the cap is reached.
3. Pick the highest-priority ticket with `status: ready`, no unfinished
   `depends_on`, **whose `machine` is this computer** (or which names no
   machine and whose repository exists here), and belonging to the group that
   is furthest below its quota. Ties break by oldest `created` date.
   A ticket for another machine is not yours to take: its repository is not
   here, and the machine that owns it will pick it up on its own run.
4. Treat a `waiting` ticket whose `resumeAt` has passed as ready, and prefer it
   over a fresh one: finishing something already started is worth more than
   starting something new.
5. If nothing is ready, say so in one line and stop. Do not promote a `draft`
   ticket to `ready` yourself — that is what `/ticket` and a human are for.

## While working

Follow `/work`. In addition:

- Set `status: in-progress` before the first edit, so a parallel session sees it.
- Commit at every green checkpoint, so an interruption does not lose the work.
- Never push to `main`, never merge, never deploy, never touch anything the
  ticket did not name.
- If you need a decision, set `status: blocked`, write the question in the
  ticket under "Blocked by", hand over, and stop. A guess made unattended is
  discovered much later and costs far more than the wait.

## Stop conditions — all of them are hard

- Acceptance criteria met and the suite green → `status: review`, hand over, stop.
- Two failed attempts at the same problem → `status: blocked`, hand over, stop.
- Context above 60% → hand over, stop.
- Group over quota mid-run, or a usage limit hit → `status: waiting`, run
  `/scheduler <ticket>` so it restarts by itself, hand over, stop. Do not set
  `blocked`: nothing is wrong with the work, it is only out of tokens, and a
  human who sees `blocked` will come looking for a decision that does not exist.
- Anything destructive or irreversible ahead → stop and ask.

## Always finish by

Running `/passation`, then a report of at most five lines: ticket, outcome,
what a human must verify, and what the next session should pick up.
