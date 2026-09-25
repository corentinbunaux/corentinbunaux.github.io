---
name: deep-debug
description: Systematic protocol for a bug that resisted the first two fixes. Use when the same failure persists after two attempts, when a fix causes a new failure, or when the behaviour makes no sense.
---

# Deep debugging

Two failed attempts mean the model of the problem is wrong, not that the fix was
badly written. A third variation of the same idea will fail too, and each
attempt costs a full cycle. Stop patching and rebuild the model.

## 1. Write down what you believe

In three lines: what you think happens, where you think it breaks, why you think
that. Being explicit is what makes the wrong assumption visible.

## 2. Find the last point where reality still matches

Bisect the *execution*, not the code. Pick a point halfway through the flow and
check the actual state there — print it, log it, break on it. Is it what you
expected? Move halfway again in whichever direction was wrong. Three or four
steps localises almost anything.

Bisect the *history* too when the bug is a regression: `git bisect` beats
reading a diff when the diff is large.

## 3. Attack the assumptions, in this order

They fail roughly in this frequency:

- The code running is not the code you edited (stale build, wrong venv, cache,
  a duplicate module earlier on the path, a server not restarted).
- The input is not what you think (encoding, shape, null, whitespace, timezone,
  a silent type coercion).
- The version is not what you think (lockfile vs installed, a transitive bump).
- The environment differs (env var set locally and not in CI, or the reverse).
- The failure is elsewhere and this is only a symptom.

Check each one with a command, not by reasoning about it.

## 4. Shrink it

Reduce to the smallest input that still fails, in a standalone script outside
the application. A bug that survives that reduction is usually obvious; a bug
that vanishes tells you the cause is in what you removed.

## 5. If it is still alive

Stop and hand over. Write into "What failed": every hypothesis, the command that
tested it, and the actual output. That record is the deliverable — the next
session starts from your eliminations rather than repeating them.

## Never

- Add `try`/`except` around it to make the symptom go away.
- Weaken or skip the failing test.
- Change several things at once, then declare victory without knowing which
  one worked.
