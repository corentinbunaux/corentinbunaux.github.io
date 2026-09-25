# Tickets

One markdown file per ticket, `<ID>.md`, where ID is `<PREFIX>-<NNN>`
(`THE-012` for thesis work, `PEA-004` for the investment tool, and so on).

This directory is the source of truth. The Mission Control board mirrors it;
if the two disagree, the files win.

## Frontmatter

```yaml
---
id: PEA-004
title: Fetch and cache daily closes for the PEA universe
group: corentin         # must match a group in ~/.claude/budget/budget.config.json
machine: asus-corentin  # the computer that holds this repo; a runner elsewhere skips it
milestone: M1 — data layer
status: draft           # draft | ready | in-progress | waiting | review | blocked | done
resumeAt: null          # ISO instant when a `waiting` ticket restarts (set by /scheduler)
priority: P1            # P0 urgent · P1 next · P2 later · P3 someday
estimate: 1.0           # half-days
confidence: medium      # high | medium | low
depends_on: [PEA-002]
parallel_safe: true     # can run at the same time as other tickets
human_checkpoint: "Run `make fetch` and confirm 5 years of closes for 40 tickers"
created: 2026-09-20
---
```

## Lifecycle

```
draft  --/ticket-->  ready  --/work-->  in-progress  -->  review  --human-->  done
                                              |
                                              +-->  blocked     needs a decision
                                              +-->  waiting     needs tokens
```

- `draft` — exists, not yet precise enough to execute.
- `ready` — a fresh session can finish it from the file alone. Only `/ticket`
  should promote a ticket to this state.
- `in-progress` — a session is on it. **At most one session per ticket**, and
  the work-in-progress cap counts across every machine, not just this one.
- `review` — the code is done and green; a human has to perform the
  `human_checkpoint` before it counts.
- `waiting` — halted by a usage limit or by the group's quota, not by anything
  wrong with the work. `resumeAt` says when it restarts; `/scheduler` sets both
  and registers the restart. Nobody needs to do anything.
- `blocked` — waiting on a *decision* or an external dependency. The reason
  lives in the ticket body under "Blocked by". Someone does need to do
  something. Keep the two apart: conflating them means either ignoring a
  question or babysitting a countdown.
- `done` — checkpoint passed and merged.
