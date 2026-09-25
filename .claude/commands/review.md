---
description: Review the current diff against the ticket, the rules and the tests.
argument-hint: [optional: base branch, defaults to main]
allowed-tools: Bash(git diff:*) Bash(git log:*) Bash(git status:*) Bash(git merge-base:*)
---

# Code review

## Diff under review
!`git --no-pager diff --stat $(git merge-base HEAD ${1:-main})...HEAD`

## Changes
!`git --no-pager diff $(git merge-base HEAD ${1:-main})...HEAD`

## Instructions

Review the diff above against the ticket it claims to implement, the conventions
in `.claude/rules/`, and plain engineering judgement.

Look for, in this order:

1. **Correctness** — does it do what the ticket says, including the error paths?
   Find a concrete input that produces a wrong result, if one exists.
2. **Scope** — anything in the diff the ticket did not ask for.
3. **Tests** — do the new tests actually fail when the code is wrong? Is any
   assertion weakened, any test skipped, any sleep introduced?
4. **Security** — untrusted input reaching a sink, a secret in the source, a
   missing timeout, a destructive operation without a guard.
5. **Clarity** — names that mislead, comments that lie, abstraction that has no
   second caller.

For each finding: the file and line, what is wrong, a concrete failure scenario,
and the smallest fix. Order by severity. Distinguish "this is broken" from "I
would have written it differently" and say which you mean.

If the diff is clean, say so in one line and name the one thing you would still
watch. Do not invent findings to look thorough.
