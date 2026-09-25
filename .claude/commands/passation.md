---
description: Write the handover file that the next session starts from, then stop.
argument-hint: [optional: extra note to carry over]
---

# Write the handover

Rewrite `PASSATION.md` from what actually happened in this session. Archive the
previous version to `.claude/passations/<YYYY-MM-DD>-<ticket-id>.md` first, so
the history survives without loading it every time.

Fill every section of the template. The sections that matter most, and that are
most often written badly:

**What failed** — the approaches that did not work and *why each one failed*,
with the real error text. Without this the next session repeats your dead ends
at full price. Write it even if the session succeeded in the end.

**Next step** — one action, small enough to begin immediately, naming the file
and the function. "Continue implementing the parser" is not a next step.
"Add the `EOF` branch to `tokenise()` in `src/parse.py:88`; the failing case is
`tests/test_parse.py::test_truncated_input`" is.

**Do not** — traps you hit: a file that looks relevant and is not, a library
whose docs are wrong for the pinned version, a test that is expected to fail.

Rules for the file:

- Under 60 lines. It is loaded into every future session; length here is a
  recurring cost. Cut anything the next session can get from the code itself.
- Facts, not narrative. No "we then explored...".
- Exact identifiers: file paths, function names, test names, error strings.
- If the session ended blocked, say so in the status and put the blocker,
  verbatim, in "Open questions".

$ARGUMENTS

Then update the ticket's `status`, print the "Next step" line, and stop. Do not
start the next piece of work — that belongs to a fresh session with a clean
context. Suggest `/clear`.
