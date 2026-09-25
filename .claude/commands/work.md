---
description: Execute one ready ticket end to end, stopping at the human checkpoint.
argument-hint: [ticket-id]
---

# Work ticket $0

Read `.claude/tickets/$0.md` and `PASSATION.md`.

Refuse to start, and say why, if: the ticket status is not `ready`; a blocking
ticket is unfinished; or the acceptance criteria are not checkable. A ticket that
is not ready costs more to guess at than to send back.

## Sequence

1. **Restate** the deliverable and the acceptance criteria in three lines, and
   set `status: in-progress`. If your restatement differs from the ticket, stop
   and resolve that first.
2. **Plan.** You are in plan mode. Produce the change list — files, functions,
   order — and get it approved before editing anything.
3. **Branch**: `<type>/$0-<slug>`.
4. **Build in slices.** Smallest working increment first, test it, then the
   next. Do not write the whole thing and test at the end.
5. **Test.** Add the tests from the ticket's test plan. Run the full suite. Run
   the linter and the type checker. Paste the real output, not a summary of it.
6. **Self-review.** Read your own `git diff` as if someone else wrote it.
   Remove anything the ticket did not ask for — stray logging, unrelated
   formatting, speculative abstraction.
7. **Update** `ARCHITECTURE.md` if the structure moved.
8. **Commit** in logical units with conventional messages. Do not push to `main`.
9. **Set `status: review`** and run `/passation`.

## Stop and hand back if

- Two attempts at the same failure have not worked. Write both attempts and the
  actual errors into "What failed" and stop.
- The ticket turns out to need a decision nobody has made.
- The change is growing past the ticket's boundary. Propose a split instead.
- The context passes 60%. Hand over cleanly rather than degrading.

## Finish with

Three lines maximum: what is done, what the human must check by hand (the
ticket's human checkpoint, with the exact command), and what comes next.
