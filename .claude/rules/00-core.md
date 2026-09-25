# Core rules

These apply everywhere, in every file. Rules with a `paths:` header load only
when you touch a matching file — that is deliberate, it keeps context small.

## Evidence over assertion

State what you verified and how. "The tests pass" must be followed by the
command you ran. If you did not run it, say you did not run it.

## Smallest change that works

Solve the ticket, not the surrounding code. Refactoring you were not asked for
belongs in its own ticket. If you spot something worth fixing, add it to
`.claude/tickets/` instead of doing it now.

## No silent fallbacks

Do not wrap a failure in a `try`/`except` that hides it, do not substitute a
default when data is missing, do not skip a test to make a suite green. A
failure that is visible is cheaper than one that is not.

## Read narrowly

Search before you read. Read the function, not the file; the file, not the
directory. Whole-file reads of anything over ~400 lines need a reason.

## Ask once, early

If two readings of the ticket are both plausible, ask before implementing
either. Asking costs one message; building the wrong thing costs a session.
