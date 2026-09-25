# Git workflow

- One ticket, one branch: `<type>/<ticket-id>-<slug>` where type is
  `feat`, `fix`, `chore`, `docs`, `exp` (experiment).
- Never commit directly to `main`.
- Conventional commits: `feat(scope): summary`, imperative, under 72 chars.
- One logical change per commit. Do not mix a refactor with a behaviour change.
- Before committing: run the test suite and the linter, then `git diff --staged`
  and read it. If the diff contains anything the ticket did not ask for, unstage it.
- Never `git push --force`, never amend a pushed commit, never `git rebase` a
  shared branch.
- Never commit: `.env`, credentials, API keys, broker tokens, data dumps,
  notebook outputs, `node_modules/`, virtualenvs.
