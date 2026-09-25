---
description: Stage 2 — turn a framing document into an estimated, sequenced backlog of tickets.
argument-hint: [optional: path to the framing doc, defaults to docs/CADRAGE.md]
---

# Scoping and backlog

Read the framing document (`$ARGUMENTS` or `docs/CADRAGE.md`). If it does not
exist, stop and say that `/cadrage` has to run first.

Also read `ARCHITECTURE.md` if it exists, and skim the repository structure —
not the file contents — so estimates reflect what is already there.

## Produce the plan

**Milestones.** Break the work into 3–6 milestones, each one an outcome that can
be demonstrated, not a layer of the stack. "Users can see their positions" is a
milestone; "build the database layer" is not. Order them so that the riskiest
unknown from the framing document is tested in the first milestone.

**Tickets.** Split each milestone into tickets. A ticket is right-sized when a
single fresh session can finish it: roughly half a day to two days of human
equivalent, one clear deliverable, and acceptance criteria that can be checked
without asking anyone. Split anything larger. A ticket that cannot be estimated
is a research ticket — name it as such, timebox it, and make its deliverable a
written answer rather than code.

**Estimates.** For each ticket give effort in half-days and a confidence of
high, medium or low. Low confidence means the ticket needs a research ticket in
front of it. Do not pad; state the assumption the estimate rests on instead.

**Dependencies.** Mark what blocks what. Then say explicitly which tickets can
run in parallel — this is what lets several sessions work at once.

**Critical path.** Name it, give its total, and say what would shorten it.

## Write it out

Create one file per ticket under `.claude/tickets/<ID>.md` using the frontmatter
in `.claude/tickets/README.md`, with `status: draft`. Keep each ticket body short
at this stage — a title, the deliverable, the acceptance criteria, the estimate.
Detail comes later, from `/ticket`.

Then write `docs/BACKLOG.md`: the milestones, a table of every ticket
(id, title, milestone, estimate, confidence, depends-on, group), the critical
path, and the parallelisable set.

## Finish with

- The total estimate, as a range, with the assumption it rests on.
- The three tickets you would do first, and why those three.
- Anything in the framing document you could not turn into a ticket, and why.
