---
description: Start from the handover — orient, verify the state, and propose the next action.
argument-hint: [optional: ticket-id to resume]
---

# Resume

1. Read `PASSATION.md` in full.
2. Read the ticket it names in `.claude/tickets/`.
3. Check the real state rather than trusting the file:
   - `git status` and `git log --oneline -5` — is the branch where the handover says?
   - Run the test suite. Does it fail where the handover says it fails?
4. Report in at most five lines: where things stand, whether reality matches the
   handover, and the next step.
5. If reality and the handover disagree, say so first and stop. That mismatch is
   the most important thing in the session; do not paper over it by starting work.

Then wait for approval before acting. $ARGUMENTS
