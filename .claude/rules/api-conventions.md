---
paths:
  - "**/api/**"
  - "**/routes/**"
  - "**/handlers/**"
  - "**/*controller*"
---

# API conventions

- Resources are plural nouns; actions are HTTP verbs. `GET /positions`,
  `POST /orders`, not `POST /createOrder`.
- Every endpoint validates its input at the edge and returns a typed result.
- One error shape across the whole surface:
  `{ "error": { "code": "snake_case_code", "message": "human readable", "details": {} } }`
- Status codes carry meaning: 400 malformed, 401 unauthenticated, 403 forbidden,
  404 absent, 409 conflict, 422 semantically invalid, 429 throttled, 5xx ours.
- Never leak an internal exception, a stack trace, or a SQL string to a client.
- Pagination is cursor-based and explicit. No unbounded list endpoints.
- Every outbound call has a timeout, a retry policy, and a documented failure mode.
