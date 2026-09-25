---
paths:
  - "tests/**"
  - "test/**"
  - "**/*.test.*"
  - "**/*.spec.*"
  - "**/test_*.py"
  - "**/*_test.py"
---

# Testing

- A bug fix starts with a failing test that reproduces the bug. Write it, watch
  it fail, then fix it.
- Test behaviour through the public surface, not private internals. A test that
  breaks on every refactor is a liability.
- One assertion subject per test. The test name says what is expected:
  `returns_empty_list_when_no_matches`, not `test_search_2`.
- No sleeps. Use fakes, injected clocks, or the framework's async helpers.
- Never weaken an assertion to make a test pass. Never mark a test skipped to
  make a suite green without saying so explicitly in the handover.
- Deterministic by default: seed every random generator, freeze time, and never
  reach the network in a unit test.
