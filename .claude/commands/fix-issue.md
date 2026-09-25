---
description: Reproduce, diagnose and fix a bug, test first.
argument-hint: [issue number, or a description of the bug]
---

# Fix: $ARGUMENTS

Do these in order. Do not skip to step 4.

1. **Reproduce.** Write the smallest test that fails because of this bug. Run it
   and paste the failure. If you cannot reproduce it, stop and say what you need
   — you cannot fix what you cannot observe.
2. **Locate.** Find the actual cause, not the place the symptom appears. State
   the causal chain in one or two sentences.
3. **Decide.** Fix the cause. If you are about to patch the symptom because the
   cause is expensive, say so explicitly and let the human choose.
4. **Fix**, minimally.
5. **Verify.** The new test passes, the full suite passes, and nothing else
   changed. Paste the output.
6. **Generalise once.** Ask whether the same mistake exists elsewhere in the
   codebase. Search for it. Report what you find; do not fix it in this diff.
7. **Record.** Add a line to `ARCHITECTURE.md` under "Known weak points" if this
   bug revealed one.
