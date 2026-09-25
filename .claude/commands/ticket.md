---
description: Stage 3 — take a draft ticket to "ready": precise enough for a session to execute without asking questions.
argument-hint: [ticket-id]
---

# Refine ticket $0

Read `.claude/tickets/$0.md`. If it is missing, list the tickets that exist and stop.

A ticket is `ready` when a session that has never seen this conversation can
finish it correctly from the ticket alone. That is the bar. Everything below
exists to reach it.

## Investigate first

Before writing anything, look at the code this ticket touches: find the files,
read the relevant functions, check whether something similar already exists in
the repo, and check whether the interfaces it assumes are really there. Report
in one or two lines what you found, especially if it contradicts the ticket.

## Then write the ticket body

**Context** — why this exists, in two sentences, and the link to its milestone.

**Deliverable** — what will be true when this is merged, in one sentence.

**Acceptance criteria** — a checklist. Each item objectively checkable by
running something or reading something. Include the negative cases and the error
paths, not just the happy path.

**Files** — the ones you expect to change, and the ones that look relevant but
must not be touched.

**Approach** — the intended route in three to six steps. Not code. If there are
two reasonable approaches, name both and recommend one with a reason.

**Test plan** — which tests to add, at what level, and the specific cases. Name
the fixture or the data needed.

**Out of scope** — what a session might reasonably drift into, and must not.

**Human checkpoint** — the one thing a person has to verify by hand before this
is accepted, and how to verify it. Usually "run X, see Y". If there is nothing a
person needs to check, say so.

**Risks** — what could make this take twice as long.

## Estimate and status

Re-estimate now that you have read the code, and say if it moved. Set
`status: ready` only if every acceptance criterion is checkable and no open
question remains. Otherwise leave it `draft` and list what is still missing —
and if the missing piece is a decision, ask for it directly.
