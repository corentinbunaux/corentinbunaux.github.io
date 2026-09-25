---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# TypeScript / JavaScript

- `strict` is on and stays on. No `any`; use `unknown` and narrow. No
  `@ts-ignore` without a comment saying why and a ticket to remove it.
- Model illegal states out of existence: discriminated unions over optional
  fields that are only valid together.
- Validate anything crossing a boundary (HTTP, storage, env) with a schema at
  the boundary, then trust the type inside.
- `async`/`await` over promise chains. Always handle the rejection path.
- Named exports. Default exports only where a framework requires one.
- No dependency for something the standard library does in five lines.
