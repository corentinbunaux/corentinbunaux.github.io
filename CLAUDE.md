# corentinbunaux.github.io

Corentin Bunaux's personal portfolio site: presents his internships (Safran,
Kusmitea, Quimesis), school projects (EMSE — android, embedded, minesweeper,
programming), research work (SNCF) and personal projects, for recruiters and
visitors browsing his profile.

- **Budget group**: `corentin` — see `/budget`
- **Stack**: TypeScript/JavaScript, Next.js 16 (React 19, Turbopack), Tailwind CSS
- **Run**: `npm run dev` · **Test**: `npm run test` (Jest, 95% coverage threshold), `npm run test:e2e` (Playwright, 5 browser/device projects) · **Lint**: `npm run lint && npx tsc --noEmit`

## Read before anything else

1. `PASSATION.md` — what the last session did, what broke, what comes next. **Always read it first.**
2. `ARCHITECTURE.md` — the shape of the code and the decisions behind it.
3. `.claude/rules/` — conventions. Loaded for you; the path-scoped ones load only when you open a matching file.

## Working agreement

**One session, one ticket.** A session handles exactly one ticket from `.claude/tickets/`.
When the ticket is done, or the context passes 60%, run `/passation` and stop.
Do not start a second ticket in the same session.

**Plan before you build.** Sessions start in plan mode. Produce a plan, get it
approved, then implement. If a task is too vague to plan, ask instead of guessing.

**Verify your own work.** A change is not finished until `npm test` passes and
`npm run lint && npx tsc --noEmit` is clean. Report the actual command output, never a claim about it.

**Say when you are stuck.** Two failed attempts at the same problem means stop and
write what you tried in `PASSATION.md` under "What failed". Do not try a third
variation of the same idea.

## Non-negotiables

- Never commit secrets, `.env` files, API keys, or broker credentials.
- Never `git push --force`, never rewrite published history, never commit to `main` directly.
- Never delete or rewrite a file you were not asked to touch.
- Never invent an API, a library version, or a benchmark figure. Look it up or say you do not know.
- Ask before adding a dependency.

## Definition of done

A ticket is done when, and only when:

- [ ] The acceptance criteria in the ticket are all met
- [ ] Tests cover the new behaviour and the whole suite passes
- [ ] Lint and type checks are clean
- [ ] `ARCHITECTURE.md` is updated if the structure changed
- [ ] `PASSATION.md` is written for the next session
- [ ] The diff contains nothing unrelated to the ticket

## Cost discipline

This project runs on a metered plan shared with other projects. Concretely:

- Prefer `Grep`/`Glob` over reading whole files; read the range you need.
- Delegate verbose work (test runs, log digging, doc lookups) to a subagent so
  the output stays out of this conversation.
- Do not re-read a file you just wrote.
- Do not summarise what you did after every tool call. Report once, at the end.

## Compact instructions

When compacting, keep: the ticket under work and its acceptance criteria, decisions
made and options rejected, failing tests with their actual output, file paths touched,
and everything under "What failed". Drop: file contents already written to disk,
tool call chatter, resolved errors, and restated instructions.
