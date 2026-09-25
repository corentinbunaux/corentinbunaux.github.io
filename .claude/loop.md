Work the next ready ticket, one ticket only.

1. Read `PASSATION.md`. If it says the previous ticket is `blocked`, do not start
   anything new: report the blocker in one line and stop.
2. Run `/budget`. If this project's group is over quota, stop and say so.
3. Pick the highest-priority ticket in `.claude/tickets/` whose status is `ready`.
   If none is ready, say "no ready ticket" in one line and stop.
4. Run `/work <ticket-id>`.
5. When the acceptance criteria are met and the suite is green, set the ticket
   status to `review`, run `/passation`, and stop.

Never start a second ticket in the same iteration. Never push to `main`.
